import { Request, Response, NextFunction } from "express";
import { CoursePurchaseRecord, Course, User } from "../entities/index.js";
import { getOrm, isAuthorized } from "../shared/index.js";
import {
  validateCheckCoursePurchase,
  validateCoursePurchaseRecord,
  validateListPurchases,
  validateSearchByQuery,
} from "../schemas/index.js";
import { ZodError } from "zod";
import { createResponse, sendCoursePurchaseReceipt } from "../utils/index.js";

const orm = await getOrm();
const em = orm.em;
em.getRepository(CoursePurchaseRecord);
em.getRepository(Course);
em.getRepository(User);

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
  if (query.title) {
    const title = query.title;
    if (typeof title === "string") {
      sanitizedQuery.title = title;
    }
  }
  return sanitizedQuery;
}

async function findAll(req: Request, res: Response) {
  try {
    const sanitizedQuery = sanitizedSearchByQuery(req.query);
    if (sanitizedQuery?.user !== undefined && !isAuthorized(req, res)) {
      return;
    }

    const validatedQuery = validateSearchByQuery(sanitizedQuery);

    const coursePurchaseRecords = await em.find(
      CoursePurchaseRecord,
      validatedQuery,
      {
        populate: ["course", "user"],
      }
    );

    res.status(200).json(
      createResponse("Success", "Found all coursePurchaseRecords", {
        coursePurchaseRecords,
      })
    );
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
    return;
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
    res
      .status(200)
      .json(
        createResponse(
          "Success",
          "Found coursePurchaseRecord",
          coursePurchaseRecord
        )
      );
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
    return;
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
    const user = await em.findOneOrFail(User, coursePurchaseRecord.user);
    const purchaseDetails = {
      id: coursePurchaseRecord.id,
      title: course.title,
      price: course.price,
      datePurchase: new Date(),
    };
    const email = user.email;
    const sendEmail: string = await sendCoursePurchaseReceipt(
      email,
      purchaseDetails
    );
    res
      .status(201)
      .json(
        createResponse(
          "Success",
          sendEmail === "The email was sent successfully"
            ? "Course purchase record created and email sent"
            : sendEmail,
          coursePurchaseRecord
        )
      );
  } catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request", "Validation error", error.issues));
      return;
    }
  }
}
async function listUserPurchasedCourses(req: Request, res: Response) {
  try {
    const sanitizedQuery = sanitizedSearchByQuery(req.query);
    const validatedQuery = validateSearchByQuery(sanitizedQuery);
    const purchasedCourses = await em.find(
      CoursePurchaseRecord,
      validatedQuery,
      { populate: ["course"] }
    );
    const courses = purchasedCourses
      .map((record) => record.course)
      .filter(
        (course, index, self) =>
          index === self.findIndex((t) => t.id === course.id)
      );
    res
      .status(200)
      .json(
        createResponse(
          "Success",
          courses.length
            ? "Purchased courses found"
            : "No purchased courses were found",
          courses
        )
      );
  } catch (error: any) {
    console.error("Error retrieving purchased courses:", error);
    res.status(500).json(createResponse("Error", error.message));
  }
}
async function checkCoursePurchase(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
    const purchase = validateCheckCoursePurchase({
      user: req.params.userId,
      course: req.params.courseId,
    });

    const purchased = await em.findOne(CoursePurchaseRecord, {
      user: { id: purchase.user },
      course: { id: purchase.course },
    });
    res
      .status(200)
      .json(
        createResponse(
          "Success",
          purchased
            ? "Course has been purchased by the user"
            : "Course has not been purchased by the user",
          { purchased: !!purchased }
        )
      );
  } catch (error: any) {
    console.error("Error verifying course purchase:", error);
    res.status(500).json(createResponse("Error", error.message));
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
