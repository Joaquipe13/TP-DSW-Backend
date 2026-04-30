import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  update,
  remove,
  add,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../shared/index.js";
export const userRouter: Router = Router();

userRouter.get("/", authMiddleware(true), findAll);
userRouter.get("/:id", findOne);
userRouter.post("/", SanitizedInput, add);
userRouter.put("/:id", SanitizedInput, update);
userRouter.delete("/:id", authMiddleware(true), remove);
