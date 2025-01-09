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

const revokedTokens: Set<string> = new Set();
export const revokeToken = (req: Request, res: Response) => {
  const token = req.body.token;

  if (!token) {
    res.status(400).json({
      status: "error",
      message: "Token is required",
    });
    return;
  }

  revokedTokens.add(token);

  res.status(200).json({
    status: "success",
    message: "Token revoked successfully",
  });
  return;
};
export const authMiddleware =
  (strict: boolean = true) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      if (strict) {
        res.status(401).json({
          status: "error",
          message: "No token provided or invalid format",
        });
        return;
      } else {
        return next(); // Continuar si no se requiere autenticación estricta
      }
    }

    const token = authHeader.split(" ")[1];

    // Verificar si el token está en la lista de tokens revocados
    if (revokedTokens.has(token)) {
      res.status(401).json({
        status: "error",
        message: "Token has been revoked",
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = decoded;
    } catch (error) {
      if (strict) {
        res.status(401).json({
          status: "error",
          message: "Invalid or expired token",
        });
        return;
      } else {
        console.warn("Invalid token in optionalAuthMiddleware");
      }
    }

    next();
  };
