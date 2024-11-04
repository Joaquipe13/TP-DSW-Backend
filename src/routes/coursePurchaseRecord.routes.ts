import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,

  // update,
  //remove,
} from "../controllers/coursePurchaseRecord.controller.js";

export const coursePurchaseRecordRouter = Router();

coursePurchaseRecordRouter.get("/", findAll);
coursePurchaseRecordRouter.get("/:id", findOne);
coursePurchaseRecordRouter.post("/", SanitizedInput, add);
//coursePurchaseRecordRouter.put('/:id', SanitizedInput, update);
//coursePurchaseRecordRouter.delete('/:id', remove);
