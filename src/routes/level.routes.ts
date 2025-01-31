import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/level.controller.js";

export const levelRouter: Router = Router();
levelRouter.get("/:id", findOne);
levelRouter.post("/", SanitizedInput, add);
levelRouter.get("/", findAll);
levelRouter.patch("/:id", SanitizedInput, update);
levelRouter.put("/:id", SanitizedInput, update);
levelRouter.delete("/:id", remove);
