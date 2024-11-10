import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  listUserPurchasedCourses,
} from "../controllers/coursePurchaseRecord.controller.js";

export const coursePurchaseRecordRouter = Router();

coursePurchaseRecordRouter.get(
  "/user/:userId/courses",
  listUserPurchasedCourses
);
coursePurchaseRecordRouter.get("/", findAll);
coursePurchaseRecordRouter.get("/:id", findOne);
coursePurchaseRecordRouter.post("/", SanitizedInput, add);
