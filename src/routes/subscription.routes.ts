import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/subscription.controller.js";
import { authMiddleware } from "../shared/authMiddleware.js";

export const subscriptionRouter: Router = Router();

subscriptionRouter.get("/", findAll);
subscriptionRouter.get("/:id", findOne);
subscriptionRouter.post("/", authMiddleware(true), SanitizedInput, add);
subscriptionRouter.put("/:id", authMiddleware(true), SanitizedInput, update);
subscriptionRouter.patch("/:id", authMiddleware(true), SanitizedInput, update);
subscriptionRouter.delete("/:id", authMiddleware(true), remove);
