import { Request, Response } from "express";
import { EntityManager } from "@mikro-orm/core";
import { User } from "../entities";
import { validateLoginData } from "../schemas";
import * as z from "zod";
import { orm } from "../shared/orm.js";
import { verifyPassword } from "../utils/authUtils.js";

const admin = {
  name: "Admin",
  surname: "User",
  email: "admin@gmail.com",
  password: "Goku1234",
  admin: true,
};

export const validateLogin = async (req: Request, res: Response) => {
  try {
    const em = orm.em.fork();

    // Valida los datos de inicio de sesión
    const { email, password } = validateLoginData(req.body);

    if (email === admin.email && password === admin.password) {
      return res.status(200).json({
        message: "Login successful",
        data: admin,
      });
    }
    const user = await em.findOne(User, { email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await verifyPassword(user.password, password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
