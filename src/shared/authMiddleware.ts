import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "default_secret";

interface JwtPayload {
  id: number;
  name: string;
  surname: string;
  email: string;
  admin: boolean;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
    return;
  }
};

export const someProtectedHandler = (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    res.status(403).json({
      status: "error",
      message: "User not authorized",
    });
    return;
  }

  res.status(200).json({
    status: "success",
    message: "Welcome to the protected route",
    user,
  });
  return;
};
