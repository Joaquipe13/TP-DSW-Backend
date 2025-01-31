import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  remove,
} from "../controllers/topic.controller.js";

export const topicRouter: Router = Router();

topicRouter.get("/", findAll);
topicRouter.get("/:id", findOne);
topicRouter.post("/", SanitizedInput, add);
topicRouter.delete("/:id", remove);
