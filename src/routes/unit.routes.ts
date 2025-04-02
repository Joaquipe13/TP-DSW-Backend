import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/unit.controller.js";
import { authMiddleware } from "../shared/authMiddleware.js";

export const unitRouter: Router = Router();

unitRouter.get("/", authMiddleware(true), findAll);
unitRouter.get("/:id", authMiddleware(true), findOne);
unitRouter.post("/", authMiddleware(true), SanitizedInput, add);
unitRouter.put("/:id", authMiddleware(true), SanitizedInput, update);
unitRouter.patch("/:id", authMiddleware(true), SanitizedInput, update);
unitRouter.delete("/:id", authMiddleware(true), remove);
