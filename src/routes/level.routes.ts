import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/level.controller.js";
import { authMiddleware } from "../shared/index.js";

export const levelRouter: Router = Router();
levelRouter.get("/:id", authMiddleware(true), findOne);
levelRouter.post("/", authMiddleware(true), SanitizedInput, add);
levelRouter.get("/", authMiddleware(true), findAll);
levelRouter.patch("/:id", authMiddleware(true), SanitizedInput, update);
levelRouter.put("/:id", authMiddleware(true), SanitizedInput, update);
levelRouter.delete("/:id", authMiddleware(true), remove);
