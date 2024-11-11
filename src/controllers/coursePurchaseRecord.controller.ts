import { Request, Response, NextFunction } from "express";
import { CoursePurchaseRecord } from "../entities/coursePurchaseRecord.entity.js";
import { Course } from "../entities/course.entity.js";
import { orm } from "../shared/orm.js";
import {
  validateCheckPurchase,
  validatelistPurchases,
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
function sanitizedSearchByQuery(query: any) {
  const sanitizedQuery: any = {};
  if (query.startDate) {
    const startDate = new Date(query.startDate);
    if (!isNaN(startDate.getTime())) {
      sanitizedQuery.startDate = startDate.toISOString();
    }
  }
  if (query.endDate) {
    // Sanitizar endDate como string válido de fecha
    const endDate = new Date(query.endDate);
    if (!isNaN(endDate.getTime())) {
      sanitizedQuery.endDate = endDate.toISOString();
    }
  }
  if (query.course) {
    const courseId = Number(query.course);
    if (!isNaN(courseId)) {
      sanitizedQuery.course = courseId;
    }
  }
  if (query.user) {
    const userId = Number(query.user);
    if (!isNaN(userId)) {
      sanitizedQuery.user = userId;
    }
  }
  return sanitizedQuery;
}

async function findAll(req: Request, res: Response) {
  try {
    const sanitizedQuery = sanitizedSearchByQuery(req.query);
    const validatedQuery = validateSearchByQuery(sanitizedQuery);

    const coursePurchaseRecords = await em.find(
      CoursePurchaseRecord,
      validatedQuery,
      {
        populate: ["course", "user"],
      }
    );

    res.json({
      message: "found all coursePurchaseRecords",
      data: { coursePurchaseRecords },
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
async function listUserPurchasedCourses(req: Request, res: Response) {
  try {
    // Extraer y validar userId desde req.params
    const userId = Number(req.params.userId);

    // Verificar que userId sea un número válido
    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    validatelistPurchases({ user: userId });
    const purchasedCourses = await em.find(
      CoursePurchaseRecord,
      { user: { id: userId } },
      { populate: ["course"] }
    );
    const courses = purchasedCourses.map((record) => record.course);
    res.status(200).json({
      message: courses.length
        ? "Cursos comprados encontrados"
        : "No se encontraron cursos comprados",
      data: courses,
    });
  } catch (error: any) {
    console.error("Error al obtener cursos comprados:", error);
    res.status(500).json({ message: error.message });
  }
}
async function checkCoursePurchase(req: Request, res: Response) {
  try {
    const purchase = validateCheckPurchase({
      user: req.params.userId,
      course: req.params.courseId,
    });

    const purchased = await em.findOne(CoursePurchaseRecord, {
      user: { id: purchase.user },
      course: { id: purchase.course },
    });
    res.status(200).json({
      message: purchased
        ? "El curso ha sido comprado por el usuario"
        : "El curso no ha sido comprado por el usuario",
      purchased: !!purchased,
    });
  } catch (error: any) {
    console.error("Error al verificar compra:", error);
    res.status(500).json({ message: error.message });
  }
}
export {
  findAll,
  findOne,
  add,
  SanitizedInput,
  listUserPurchasedCourses,
  checkCoursePurchase,
};
