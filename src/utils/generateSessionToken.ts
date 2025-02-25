import dotenv from "dotenv";

import jwt from "jsonwebtoken";
dotenv.config({ path: process.env.NODE_ENV });
const { JWT_SECRET } = process.env;
const secret = JWT_SECRET || "default_secret";

const generateSessionToken = (payload: object, expiresIn = "8h") => {
  console.log("payload", payload);
  return jwt.sign(payload, secret, { expiresIn });
};
export { generateSessionToken };
