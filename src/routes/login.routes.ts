import { Router } from "express";
import { validateLogin } from "../controllers/login.controller.js";

export const loginRouter = Router();

loginRouter.post("/", validateLogin);
