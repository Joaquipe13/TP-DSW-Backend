import { Request, Response, NextFunction } from "express";
import { orm } from "./../shared/orm.js";
import {
  validateCourse,
  validateCourseToPatch,
  validateSearchByTitle,
} from "./../schemas/index.js";
import { ZodError } from "zod";
import { CoursePurchaseRecord, Course, Topic } from "../entities/index.js";

const em = orm.em;

function sanitizeCourseInput(req: Request, res: Response, next: NextFunction) {
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
    res.status(200).json({ message: "Found all courses", data: courses });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const course = await em.findOneOrFail(
      Course,
      { id },
      { populate: ["topics", "levels"] }
    );
    res.status(200).json({ message: "Found course", data: course });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
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
      .json({ message: "Course created", data: { courseCreated } });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
      return;
    }
    res.status(500).send({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
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
        res.status(400).json({ message: "Some topics could not be found." });
        return;
      }
      const updatedTopics = topics.map((topic) => topic.id);
      courseUpdated.topics = updatedTopics;
    }

    em.assign(course, courseUpdated);
    await em.flush();

    res.status(200).json({ message: "Course updated", data: course });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const course = em.getReference(Course, id);
    const purchaseRecordCount = await em.count(CoursePurchaseRecord, {
      course,
    });
    if (purchaseRecordCount > 0) {
      course.isActive = false;
      await em.flush();
      res.status(200).json({ message: "Course deactivated" });
    } else {
      await em.removeAndFlush(course);
      res.status(204).json({ message: "Course deleted" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { findAll, findOne, add, update, remove, sanitizeCourseInput };
