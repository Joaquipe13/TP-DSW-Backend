import { JwtPayload } from "jsonwebtoken";
interface UserData {
  id: number;
  name: string;
  surname: string;
  password: string;
  email: string;
  admin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
    interface Request {
      user?: { id: number; admin: boolean };
    }
    interface Request {
      userData?: UserData | JwtPayload;
    }
  }
}
