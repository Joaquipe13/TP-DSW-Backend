import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "./../controllers/course.controller.js";

export const courseRouter: Router = Router();

courseRouter.get("/:id", findOne);
courseRouter.get("/", findAll);
courseRouter.post("/", SanitizedInput, add);
courseRouter.patch("/:id", SanitizedInput, update);
courseRouter.put("/:id", SanitizedInput, update);
courseRouter.delete("/:id", remove);
