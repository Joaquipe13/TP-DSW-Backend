import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  update,
  remove,
  add,
} from "../controllers/user.controller.js";

export const userRouter: Router = Router();

userRouter.get("/", findAll);
userRouter.get("/:id", findOne);
userRouter.post("/", SanitizedInput, add);
userRouter.put("/:id", SanitizedInput, update);
userRouter.delete("/:id", remove);
