import { Router } from "express";
import {
  sanitizeLevelInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/level.controller.js";

export const levelRouter = Router();
levelRouter.get("/:id", findOne);
levelRouter.post("/", sanitizeLevelInput, add);
levelRouter.get("/", findAll);
levelRouter.patch("/:id", sanitizeLevelInput, update);
levelRouter.put("/:id", sanitizeLevelInput, update);
levelRouter.delete("/:id", remove);
