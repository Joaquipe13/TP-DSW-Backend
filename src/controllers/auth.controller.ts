import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/index.js";
import { validateLoginData } from "../schemas/index.js";
import * as z from "zod";
import { orm } from "../shared/orm.js";
import { verifyPassword } from "../shared/encryption.js";

const secret = process.env.JWT_SECRET || "default_secret";

const generateToken = (payload: object, expiresIn = "8h") => {
  return jwt.sign(payload, secret, { expiresIn });
};
const admin = {
  name: process.env.ADMIN_NAME || "Admin",
  surname: process.env.ADMIN_SURNAME || "User",
  email: process.env.ADMIN_EMAIL || "admin@gmail.com",
  password: process.env.ADMIN_PASSWORD || "Goku1234",
  admin: true,
};
const createResponse = (status: string, message: string, data?: any) => ({
  status,
  message,
  data,
});
const em = orm.em;

const validateCredentials = async (email: string, password: string) => {
  if (email === admin.email && password === admin.password) {
    return {
      id: 0,
      name: admin.name,
      surname: admin.surname,
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
    email: user.email,
    admin: user.admin,
  };
};
export const validateLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = validateLoginData(req.body);
    const userData = await validateCredentials(email, password);
    const token = generateToken(userData);
    res
      .status(200)
      .json(createResponse("success", "Login successful", { token }));
    return;
  } catch (error: any | z.ZodError) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json(createResponse("error", "Validation error", error.errors));
      return;
    }

    if (error.message === "Invalid credentials") {
      res.status(401).json(createResponse("error", "Invalid credentials"));
      return;
    }

    console.error("Error during login:", error);
    res.status(500).json(createResponse("error", "Internal server error"));
    return;
  }
};
