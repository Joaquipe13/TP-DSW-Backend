import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  listUserPurchasedCourses,
  checkCoursePurchase,
} from "../controllers/coursePurchaseRecord.controller.js";

export const coursePurchaseRecordRouter = Router();

coursePurchaseRecordRouter.get(
  "/user/:userId/courses",
  listUserPurchasedCourses
);
coursePurchaseRecordRouter.get("/check/:userId/:courseId", checkCoursePurchase);
coursePurchaseRecordRouter.get("/", findAll);
coursePurchaseRecordRouter.get("/:id", findOne);
coursePurchaseRecordRouter.post("/", SanitizedInput, add);
