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
export const validateRole = (req: Request, res: Response) => {
  if (!req.userData) {
    res.status(403).json(createResponse("Bad Request", "User not authorized"));
    return;
  }
  const role = req.userData.admin ? "admin" : "user";
  res
    .status(200)
    .json(createResponse("Success", "Role validated successfully", role));
};
export const someProtectedHandler = (req: Request, res: Response): void => {
  console.log("Usuario en req.user:", req.userData);

  if (!req.userData) {
    res.status(403).json(createResponse("Bad Request", "User not authorized"));
  }

  const { id, name, surname, email, admin } = req.userData as {
    id: number;
    name: string;
    surname: string;
    email: string;
    admin: boolean;
  };

  res.status(200).json(
    createResponse("Success", "Welcome to the protected route", {
      user: { id, name, surname, password: "", email, admin },
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
export const isAuthorized = (req: Request, res: Response): boolean => {
  if (!req.userData || !req.userData.admin) {
    res
      .status(403)
      .json({ status: "Forbidden", message: "User not authorized" });
    return false;
  }
  return true;
};
