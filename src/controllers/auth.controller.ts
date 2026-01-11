import { Request, Response } from "express";
import { User } from "../entities/index.js";
import { validateLoginData } from "../schemas/index.js";
import * as z from "zod";
import { getOrm } from "../shared/orm.js";
import { verifyPassword } from "../shared/encryption.js";
import { generateSessionToken, createResponse } from "../utils/index.js";

const getEm = async () => (await getOrm()).em;

const validateCredentials = async (email: string, password: string) => {
  console.log("email: ", email, "password: ", password);

  const em = await getEm();

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
    console.log("Login successful");
  } catch (error: any | z.ZodError) {
    if (error instanceof z.ZodError) {
      res
        .status(422)
        .json(createResponse("Unprocessable Entity", "Validation error", error.errors));
      return;
    }
    if (error.message === "Invalid credentials") {
      res
        .status(401)
        .json(createResponse("Unauthorized", "Invalid credentials"));
      return;
    }
    res.status(500).json(createResponse("Error", "Internal server error"));
  }
};
