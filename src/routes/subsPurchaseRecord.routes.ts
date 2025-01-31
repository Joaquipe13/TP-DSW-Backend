import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  listUserPurchasedSubs,
  checkSubsPurchase,
} from "../controllers/subsPurchaseRecord.controller.js";

export const subsPurchaseRecordRouter: Router = Router();

subsPurchaseRecordRouter.get("/user/:userId", listUserPurchasedSubs);
subsPurchaseRecordRouter.get("/check/:userId", checkSubsPurchase);
subsPurchaseRecordRouter.get("/", findAll);
subsPurchaseRecordRouter.get("/:id", findOne);
subsPurchaseRecordRouter.post("/", SanitizedInput, add);
