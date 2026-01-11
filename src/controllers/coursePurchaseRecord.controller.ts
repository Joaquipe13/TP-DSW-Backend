import { Request, Response, NextFunction } from "express";
import { CoursePurchaseRecord, Course, User } from "../entities/index.js";
import { getOrm } from "../shared/index.js";
import {
  validateCheckCoursePurchase,
  validateCoursePurchaseRecord,
  validateId,
  validateListPurchases,
  validateSearchByQuery,
} from "../schemas/index.js";
import { ZodError } from "zod";
import { createResponse, sendCoursePurchaseReceipt } from "../utils/index.js";

const getEm = async () => (await getOrm()).em;

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
    const em = await getEm();
    const sanitizedQuery = sanitizedSearchByQuery(req.query);

    if (sanitizedQuery?.user === undefined && !req.userData?.admin){
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to access these records"));
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
    return;
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = await getEm();
    const id = validateId(req.params);
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
async function add(req: Request, res: Response) {
  try {
    const em = await getEm();
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
async function listUserPurchasedCourses(req: Request, res: Response) {
  try {
    const em = await getEm();
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
async function checkCoursePurchase(req: Request, res: Response) {
  try {
    const em = await getEm();
    const userId = req.userData?.id;
    if (!userId) {
      res
        .status(401)
        .json(createResponse("Unauthorized", "User not authenticated"));
      return;
    }
    const purchase = validateCheckCoursePurchase({
      user: userId,
      course: req.params.courseId,
    });

    // Use count for a lightweight existence check
    const purchaseCount = await em.count(CoursePurchaseRecord, {
      user: purchase.user,
      course: purchase.course,
    });
    const purchased = purchaseCount > 0;
    res
      .status(200)
      .json(
        createResponse(
          "Success",
          purchased
            ? "Course has been purchased by the user"
            : "Course has not been purchased by the user",
          purchased
        )
      );
  } catch (error: any) {
    console.error("Error verifying course purchase:", error);
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
export {
  findAll,
  findOne,
  add,
  SanitizedInput,
  listUserPurchasedCourses,
  checkCoursePurchase,
};
