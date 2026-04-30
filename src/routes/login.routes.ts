import { Router } from "express";
import { validateLogin } from "../controllers/auth.controller.js";
import {
  someProtectedHandler,
  authMiddleware,
  revokeToken,
  validateRole,
} from "../shared/index.js";

export const loginRouter: Router = Router();
loginRouter.get("/role", authMiddleware(true), validateRole);
loginRouter.get("/auth", authMiddleware(true), someProtectedHandler);
loginRouter.post("/revoke-token", authMiddleware(false), revokeToken);
loginRouter.post("/", validateLogin);
