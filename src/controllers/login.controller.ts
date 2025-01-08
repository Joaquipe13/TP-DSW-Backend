import { Request, Response } from "express";
import { User } from "../entities/index.js";
import { validateLoginData } from "../schemas/index.js";
import * as z from "zod";
import { orm } from "../shared/orm.js";
import { verifyPassword } from "../shared/encryption.js";

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

    const { email, password } = validateLoginData(req.body);

    if (email === admin.email && password === admin.password) {
      res.status(200).json({
        message: "Login successful",
        data: admin,
      });
    }
    const user = await em.findOne(User, { email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const passwordMatch = await verifyPassword(user.password, password);

    if (!passwordMatch) {
      res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
