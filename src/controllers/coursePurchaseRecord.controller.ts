import { Request, Response, NextFunction } from "express";
import { CoursePurchaseRecord } from "../entities/coursePurchaseRecord.entity.js";
import { Course } from "../entities/course.entity.js";
import { orm } from "../shared/orm.js";
import {
  validateCoursePurchaseRecord,
  validateSearchByQuery,
} from "../schemas/coursePurchase.schema.js";
import { getErrorMap, ZodError } from "zod";
import { getRandomValues } from "crypto";

const em = orm.em;
em.getRepository(CoursePurchaseRecord);
em.getRepository(Course);

function SanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    course: req.body.course,
    user: req.body.user,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const validatedQuery = validateSearchByQuery(req.query);

    const coursePurchaseRecords = await em.find(
      CoursePurchaseRecord,
      validatedQuery,
      {
        populate: ["course", "user"],
      }
    );
    res.json({
      message: "found all coursePurchaseRecords",
      data: coursePurchaseRecords,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const coursePurchaseRecord = await em.findOneOrFail(
      CoursePurchaseRecord,
      { id },
      { populate: ["course", "user"] }
    );
    res.status(200).json({
      message: "found coursePurchaseRecord",
      data: coursePurchaseRecord,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
async function add(req: Request, res: Response) {
  try {
    const validCoursePurchaseRecord = validateCoursePurchaseRecord(
      req.body.sanitizedInput
    );
    const courseId = validCoursePurchaseRecord.course;
    const course = await em.findOneOrFail(Course, courseId);
    const coursePurchaseRecord = em.create(CoursePurchaseRecord, {
      ...validCoursePurchaseRecord,
      totalAmount: course.price,
      purchaseAt: new Date(),
    });
    await em.flush();
    res.status(201).json({
      message: "Course purchase record created",
      data: coursePurchaseRecord,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    console.log(error.issues);
    res.status(500).json({ message: error.message });
  }
}

export { findAll, findOne, add, SanitizedInput };
