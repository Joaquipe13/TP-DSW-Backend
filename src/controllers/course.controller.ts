import { Request, Response, NextFunction } from "express";
import { getOrm } from "./../shared/orm.js";
import {
  validateCourse,
  validateCourseToPatch,
  validateSearchByTitle,
} from "./../schemas/index.js";
import { ZodError } from "zod";
import { CoursePurchaseRecord, Course, Topic } from "../entities/index.js";
import { createResponse } from "../utils/createResponse.js";
import { isAuthorized } from "../shared/index.js";

const orm = await getOrm();
const em = orm.em;

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
    const sanitizedQuery = sanitizeSearchInput(req);
    const courses = await em.find(Course, sanitizedQuery, {
      populate: ["topics", "levels"],
    });
    res
      .status(200)
      .json(createResponse("Success", "Found all courses", courses));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function findOne(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
    const purchased: boolean = await checkUserCoursePurchase(req, res);
    if (purchased) return;
    const id = Number.parseInt(req.params.id);
    const course = await em.findOneOrFail(
      Course,
      { id },
      { populate: ["topics", "levels"] }
    );
    res.status(200).json(createResponse("Success", "Found course", course));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function add(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
    const validCourse = validateCourse(req.body.sanitizedInput);
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
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request", "Validation error", error.issues));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function update(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
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
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function remove(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
    const id = Number.parseInt(req.params.id);
    const course = em.getReference(Course, id);
    const purchaseRecordCount = await em.count(CoursePurchaseRecord, {
      course,
    });
    if (purchaseRecordCount > 0) {
      course.isActive = false;
      await em.flush();
      res.status(204).json(createResponse("Success", "Course deactivated"));
    } else {
      await em.removeAndFlush(course);
      res.status(204).json(createResponse("Success", "Course deleted"));
    }
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function checkUserCoursePurchase(
  req: Request,
  res: Response
): Promise<boolean> {
  try {
    const userId = req.userData?.id;
    const courseId = req.params.id;

    if (!userId) {
      res
        .status(403)
        .json(createResponse("Bad Request", "User not authorized"));
      return false;
    }

    const purchased = await em.findOne(CoursePurchaseRecord, {
      user: { id: userId },
      course: { id: courseId },
    });

    if (!purchased) {
      res
        .status(200)
        .json(
          createResponse(
            "Success",
            "Course has not been purchased by the user",
            { purchased: false }
          )
        );
      return false;
    }

    return true;
  } catch (error: any) {
    console.error("Error verifying course purchase:", error);
    res.status(500).json(createResponse("Error", error.message));
    return false;
  }
}

export { findAll, findOne, add, update, remove, SanitizedInput };
