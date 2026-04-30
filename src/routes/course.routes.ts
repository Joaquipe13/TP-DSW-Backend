import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  preview,
  add,
  update,
  remove,
} from "./../controllers/course.controller.js";
import { authMiddleware } from "../shared/index.js";
export const courseRouter: Router = Router();

courseRouter.get("/preview/:id", authMiddleware(false), preview);
courseRouter.get("/:id", authMiddleware(true), findOne);
courseRouter.get("/", authMiddleware(false), findAll);
courseRouter.post("/", authMiddleware(true), add);
courseRouter.patch("/:id", authMiddleware(true), SanitizedInput, update);
courseRouter.put("/:id", authMiddleware(true), SanitizedInput, update);
courseRouter.delete("/:id", authMiddleware(true), remove);
