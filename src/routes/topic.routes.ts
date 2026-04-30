import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  remove,
} from "../controllers/topic.controller.js";
import { authMiddleware } from "../shared/index.js";

export const topicRouter: Router = Router();

topicRouter.get("/", authMiddleware(false), findAll);
topicRouter.get("/:id", authMiddleware(true), findOne);
topicRouter.post("/", authMiddleware(true), SanitizedInput, add);
topicRouter.delete("/:id", authMiddleware(true), remove);
