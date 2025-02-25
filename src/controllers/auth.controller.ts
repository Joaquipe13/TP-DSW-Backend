import { Request, Response } from "express";
import { User } from "../entities/index.js";
import { validateLoginData } from "../schemas/index.js";
import * as z from "zod";
import { getOrm } from "../shared/orm.js";
import { verifyPassword } from "../shared/encryption.js";
import dotenv from "dotenv";
import { generateSessionToken, createResponse } from "../utils/index.js";

dotenv.config({ path: process.env.NODE_ENV });
const { EMAIL_USER, EMAIL_PASS } = process.env;
const orm = await getOrm();
const em = orm.em;

const admin = {
  name: process.env.ADMIN_NAME || "Admin",
  surname: process.env.ADMIN_SURNAME || "User",
  email: EMAIL_USER || "admin@gmail.com",
  password: EMAIL_PASS || "Goku1234",
  admin: true,
};

const validateCredentials = async (email: string, password: string) => {
  if (email === admin.email && password === admin.password) {
    return {
      id: 0,
      name: admin.name,
      surname: admin.surname,
      password: "",
      email: admin.email,
      admin: true,
    };
  }

  const user = await em.findOne(User, { email });
  if (!user || !(await verifyPassword(user.password, password))) {
    throw new Error("Invalid credentials");
  }

  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    password: "",
    email: user.email,
    admin: user.admin,
  };
};
export const validateLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = validateLoginData(req.body);
    const userData = await validateCredentials(email, password);
    const sessionToken = generateSessionToken(userData);
    res
      .status(200)
      .json(createResponse("Success", "Login successful", sessionToken));
    return;
  } catch (error: any | z.ZodError) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request", "Validation error", error.errors));
      return;
    }
    if (error.message === "Invalid credentials") {
      res
        .status(401)
        .json(createResponse("Bad Request", "Invalid credentials"));
      return;
    }
    res.status(500).json(createResponse("Error", "Internal server error"));
  }
};
