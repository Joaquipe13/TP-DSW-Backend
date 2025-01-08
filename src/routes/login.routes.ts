import { Router } from "express";
import { validateLogin } from "../controllers/auth.controller.js";
import { someProtectedHandler, authMiddleware } from "../shared/index.js";

export const loginRouter = Router();

loginRouter.get("/auth", authMiddleware, someProtectedHandler);
loginRouter.post("/", validateLogin);

