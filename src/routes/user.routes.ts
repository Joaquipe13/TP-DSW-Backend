import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  confirmUserCreation,
  requestUserCreation,
  update,
  remove,
} from "../controllers/user.controller.js";
import { createUserMiddleware } from "../shared/index.js";

export const userRouter: Router = Router();

userRouter.get("/confirm", createUserMiddleware(), confirmUserCreation);
userRouter.get("/", findAll);
userRouter.get("/:id", findOne);
userRouter.post("/", SanitizedInput, requestUserCreation);
userRouter.put("/:id", SanitizedInput, update);
userRouter.delete("/:id", remove);
