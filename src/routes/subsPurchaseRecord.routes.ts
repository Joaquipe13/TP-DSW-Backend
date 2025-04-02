import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  listUserPurchasedSubs,
  checkSubsPurchase,
} from "../controllers/subsPurchaseRecord.controller.js";
import { authMiddleware } from "../shared/authMiddleware.js";

export const subsPurchaseRecordRouter: Router = Router();

subsPurchaseRecordRouter.get(
  "/user/:userId",
  authMiddleware(true),
  listUserPurchasedSubs
);
subsPurchaseRecordRouter.get(
  "/check/:userId",
  authMiddleware(true),
  checkSubsPurchase
);
subsPurchaseRecordRouter.get("/", authMiddleware(true), findAll);
subsPurchaseRecordRouter.get("/:id", authMiddleware(true), findOne);
subsPurchaseRecordRouter.post("/", authMiddleware(true), SanitizedInput, add);
