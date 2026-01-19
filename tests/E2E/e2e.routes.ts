import { Router } from "express";
import dotenv from "dotenv";
import { getE2EUserCredentials, getE2EAdminCredentials } from "./E2Etoken.controller.js";
import { resetSchema } from "./E2ESchema.controller.js";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const e2eRouter = Router();

e2eRouter.get("/userCredentials", getE2EUserCredentials );
e2eRouter.get("/adminCredentials", getE2EAdminCredentials );
e2eRouter.post("/reset-schema", resetSchema);

