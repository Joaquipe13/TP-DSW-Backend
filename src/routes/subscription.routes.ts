import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/subscription.controller.js";

export const subscriptionRouter: Router = Router();

subscriptionRouter.get("/", findAll);
subscriptionRouter.get("/:id", findOne);
subscriptionRouter.post("/", SanitizedInput, add);
subscriptionRouter.put("/:id", SanitizedInput, update);
subscriptionRouter.patch("/:id", SanitizedInput, update);
subscriptionRouter.delete("/:id", remove);
