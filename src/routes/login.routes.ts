import { Router } from "express";
import { validateLogin } from "../controllers/auth.controller.js";
import {
  someProtectedHandler,
  authMiddleware,
  revokeToken,
  // optionalAuthMiddleware,
} from "../shared/index.js";

export const loginRouter = Router();

loginRouter.get("/auth", authMiddleware(true), someProtectedHandler);
loginRouter.post("/revoke-token", authMiddleware(false), revokeToken);
loginRouter.post("/", validateLogin);
