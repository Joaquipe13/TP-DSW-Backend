import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Course, CoursePurchaseRecord, Topic } from "../entities/index.js";
import {
  validateCourse,
  validateCourseToPatch,
  validateId,
  validateSearchByTitle
} from "./../schemas/index.js";
import { getOrm } from "./../shared/orm.js";
import { createResponse } from "../utils/createResponse.js";
const getEm = async () => (await getOrm()).em;

function SanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    title: req.body.title,
    price: req.body.price,
    topics: req.body.topics,
    isActive: req.body.isActive,
    resume: req.body.resume,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

function sanitizeSearchInput(req: Request) {
  const queryResult: any = {
    title: req.query.title,
  };

  Object.keys(queryResult).forEach((key) => {
    if (queryResult[key] === undefined) {
      delete queryResult[key];
    } else if (key === "title") {
      queryResult[key] = { $like: `%${queryResult[key].trim()}%` };
    }
  });

  return queryResult;
}

async function findAll(req: Request, res: Response) {
  try {
    const em = await getEm();
    const sanitizedQuery = sanitizeSearchInput(req);
    const courses = await em.find(Course, sanitizedQuery, {
      populate: ["topics"],
    });

    const coursesPreview = courses.map((course) => {
      const topicsPreview = course.topics.getItems().map((topic) => ({
          id: topic.id,
          description: topic.description,
        }));
        return {
          id: course.id,
          title: course.title,
          price: course.price,
          resume: course.resume,
          isActive: course.isActive,
          createdAt: course.createdAt,
          topics: topicsPreview,
      };
    });

    res
      .status(200)
      .json(createResponse("Success", "Found all courses", coursesPreview));
  }catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request",  error.issues.map((issue) => issue.message).join(", ")));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = await getEm();
    const purchased: boolean = await checkUserCoursePurchase(req, res);
    if (!purchased){
      return
    };

    const id = validateId(req.params);

    const course = await em.findOneOrFail(
      Course,
      { id },
      { populate: ["topics", "levels"] }
    );
    res.status(200).json(createResponse("Success", "Found course", course));
  } catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request",  error.issues.map((issue) => issue.message).join(", ")));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function preview(req: Request, res: Response) {
  try {
    const em = await getEm();
    const id = validateId(req.params);

    const course = await em.findOneOrFail(
      Course,
      { id },
      { populate: ["topics", "levels"] }
    );

    const topicsPreview = course.topics.getItems().map((topic) => ({
      id: topic.id,
      description: topic.description,
    }));

    const levelsPreview = course.levels?.getItems().map((level) => ({
      id: level.id,
      order: level.order,
      name: level.name,
    })) || [];
      
    const coursePreview = {
      id: course.id,
      title: course.title,
      price: course.price,
      resume: course.resume,
      isActive: course.isActive,
      createdAt: course.createdAt,
      topics: topicsPreview,
      levels: levelsPreview,
    };

    res.status(200).json(createResponse("Success", "Course preview", coursePreview));
  } catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request",  error.issues.map((issue) => issue.message).join(", ")));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function add(req: Request, res: Response) {
  try {
    const em = await getEm();
    if (req.userData?.admin === false){ 
         res
          .status(403)
          .json({ status: "Forbidden", message: "User not authorized" });
        return
    }

    const validCourse = validateCourse(req.body);

    const course = em.create(Course, {
      ...validCourse,
      createdAt: new Date(),
      isActive: false,
    });
    await em.flush();
    const courseCreated = em.getReference(Course, course.id);
    res
      .status(201)
      .json(createResponse("Success", "Course created", courseCreated));
  } catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(422)
        .json(createResponse(
            "Unprocessable Entity",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function update(req: Request, res: Response) {
  try {
    const em = await getEm();
    if (req.userData?.admin === false){ 
         res
          .status(403)
          .json({ status: "Forbidden", message: "User not authorized" });
        return
    }
    const id = Number.parseInt(req.params.id);
    const course = await em.findOneOrFail(Course, id);

    const courseUpdated =
      req.method === "PATCH"
        ? validateCourseToPatch(req.body.sanitizedInput)
        : validateCourse(req.body.sanitizedInput);

    if (courseUpdated.topics && Array.isArray(courseUpdated.topics)) {
      const topics = await em.find(Topic, {
        id: { $in: courseUpdated.topics },
      });
      if (topics.length !== courseUpdated.topics.length) {
        res
          .status(400)
          .json(
            createResponse("Bad Request", "Some topics could not be found.")
          );
        return;
      }
      const updatedTopics = topics.map((topic) => topic.id);
      courseUpdated.topics = updatedTopics;
    }

    em.assign(course, courseUpdated);
    await em.flush();

    res.status(200).json(createResponse("Success", "Course updated", course));
  }catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(422)
        .json(createResponse(
            "Unprocessable Entity",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function remove(req: Request, res: Response) {
  try {
    const em = await getEm();
    if (req.userData?.admin === false){ 
         res
          .status(403)
          .json({ status: "Forbidden", message: "User not authorized" });
        return
    }
    const id = Number.parseInt(req.params.id);
    const course = await em.findOne(Course, { id });

    if (!course) { 
      res
        .status(404)
        .json(createResponse("Not Found", "Course does not exist"));
      return;
    }
    const purchaseRecordCount = await em.count(CoursePurchaseRecord, {
      course,
    });
    if (purchaseRecordCount > 0) {
      course.isActive = false;
      await em.flush();
      res.status(200).json(createResponse("Success", "Course desactivated"));
    } else {
      await em.removeAndFlush(course);
      res.status(200).json(createResponse("Success", "Course deleted"));
    }
  }catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(422)
        .json(createResponse("Unprocessable Entity",  error.issues.map((issue) => issue.message).join(", ")));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function checkUserCoursePurchase(
  req: Request,
  res: Response
): Promise<boolean> {
  try {
    const em = await getEm();
    const userId = req.userData?.id;
    const courseId = req.params.id;
    if (!userId) {
      res
        .status(401)
        .json(createResponse("Unauthorized", "User not authorized"));
      return false;
    }

    const purchased = await em.findOne(CoursePurchaseRecord, {
      user: { id: userId },
      course: { id: courseId },
    });

    if (!purchased ) {
      if (req.userData?.admin === false) {
        res
          .status(403)
          .json(
            createResponse(
              "Forbidden",
              "Course has not been purchased by the user",
              { purchased: false }
            )
          );
        return false;
      }
    }

    return true;
  } catch (error: any) {
    console.error("Error verifying course purchase:", error);
    res.status(500).json(createResponse("Error", error.message));
    return false;
  }
}

export { findAll, findOne, preview, add, update, remove, SanitizedInput };
