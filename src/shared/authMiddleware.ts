import { create } from "domain";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createResponse } from "../utils/createResponse.js";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { JWT_SECRET } = process.env;

const secret = JWT_SECRET || "default_secret";

interface JwtPayload {
  userData: {
    id: number;
    name: string;
    surname: string;
    password: string;
    email: string;
    admin: boolean;
  };
}

export const someProtectedHandler = (req: Request, res: Response): void => {
  console.log("Usuario en req.user:", req.userData);

  if (!req.userData) {
    res.status(403).json(createResponse("Bad Request", "User not authorized"));
  }

  const { name, surname, email, admin } = req.userData as {
    name: string;
    surname: string;
    email: string;
    admin: boolean;
  };

  res.status(200).json(
    createResponse("Success", "Welcome to the protected route", {
      user: { name, surname, password: "", email, admin },
    })
  );
};

const revokedTokens: Set<string> = new Set();
export const revokeToken = (req: Request, res: Response) => {
  const token = req.body.token;

  if (!token) {
    res.status(400).json(createResponse("Bad Request", "Token is required"));
  }

  revokedTokens.add(token);
  res.status(200).json(createResponse("Success", "Token revoked successfully"));
};
export const authMiddleware =
  (strict: boolean = true) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    console.log("authHeader:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (strict) {
        res
          .status(401)
          .json(
            createResponse("Bad Request", "No token provided or invalid format")
          );

        return;
      } else {
        return next();
      }
    }

    const token = authHeader.split(" ")[1];
    console.log("token:", token);
    if (revokedTokens.has(token)) {
      res
        .status(401)
        .json(createResponse("Bad Request", "Token has been revoked"));

      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;

      console.log("decoded.userData:", decoded.userData);
      req.userData = decoded;

      console.log("Usuario en req.user middle:", req.user);
      return next();
    } catch (error) {
      if (strict) {
        res
          .status(401)
          .json(createResponse("Error", "Invalid or expired token"));
        return;
      } else {
        console.warn("Invalid token in optionalAuthMiddleware");
      }
    }

    next();
  };
export const createUserMiddleware =
  () =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message: "No token provided or invalid format",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.userData = {
        name: decoded.userData.name,
        surname: decoded.userData.surname,
        password: decoded.userData.password,
        email: decoded.userData.email,
        admin: decoded.userData.admin ?? false,
      };
    } catch (error) {
      res.status(401).json({
        status: "error",
        message: "Invalid or expired token",
      });
      return;
    }

    next();
  };
