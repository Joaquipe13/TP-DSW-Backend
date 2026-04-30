import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  listUserPurchasedCourses,
  checkCoursePurchase,
} from "../controllers/coursePurchaseRecord.controller.js";

import { authMiddleware } from "../shared/index.js";

export const coursePurchaseRecordRouter: Router = Router();

coursePurchaseRecordRouter.get("/courses",authMiddleware(true), listUserPurchasedCourses);
coursePurchaseRecordRouter.get("/check/:courseId",authMiddleware(false), checkCoursePurchase);
coursePurchaseRecordRouter.get("/",authMiddleware(true), findAll);
coursePurchaseRecordRouter.get("/:id",authMiddleware(true), findOne);
coursePurchaseRecordRouter.post("/",authMiddleware(true), SanitizedInput, add);
