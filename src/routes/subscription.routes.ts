import { Router } from "express";
import {
  sanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/subscription.controller.js";

export const subscriptionRouter = Router();

subscriptionRouter.get("/", findAll);
subscriptionRouter.get("/:id", findOne);
subscriptionRouter.post("/", sanitizedInput, add);
subscriptionRouter.put("/:id", sanitizedInput, update);
subscriptionRouter.patch("/:id", sanitizedInput, update);
subscriptionRouter.delete("/:id", remove);
