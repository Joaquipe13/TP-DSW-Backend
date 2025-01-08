import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
    interface Request {
        user?: { id: number; admin: boolean }; 
      }
  }
}
