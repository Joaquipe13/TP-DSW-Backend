import { Request, Response, NextFunction } from "express";
import { User } from "../entities/index.js";
import { getOrm } from "../shared/orm.js";
import { validateUser, validateUserToPatch } from "../schemas/index.js";
import {
  generateSessionToken,
  sendConfirmationEmail,
  createResponse,
} from "../utils/index.js";
import { ZodError } from "zod";
import { encryptPassword } from "../shared/encryption.js";
import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "default_secret";

const orm = await getOrm();
const em = orm.em;
em.getRepository(User);
function SanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: req.body.password,
    admin: req.body.admin,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined)
      delete req.body.sanitizedInput[key];
  });
  next();
}
async function findAll(req: Request, res: Response) {
  try {
    const users = await em.find(User, {}, { populate: ["purchaseRecords"] });
    res.status(200).json(createResponse("Success", "found all users", users));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const user = await em.findOneOrFail(
      User,
      { id },
      { populate: ["purchaseRecords"] }
    );
    res.status(200).json(createResponse("Success", "found user", user));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

function generateUserToken(userData: any): string {
  return jwt.sign({ userData }, TOKEN_SECRET, { expiresIn: "1h" });
}

async function requestUserCreation(req: Request, res: Response) {
  try {
    const validUser = validateUser(req.body.sanitizedInput);
    if (validUser instanceof ZodError) {
      res
        .status(400)
        .json(
          createResponse("Bad Request", "Validation failed", validUser.issues)
        );
    }

    const existingUser = await em.findOne(User, { email: validUser.email });
    if (existingUser) {
      res
        .status(400)
        .json(
          createResponse("Bad Request", "User with this email already exists")
        );
    }

    const token = generateUserToken(validUser);
    const emailResult = await sendConfirmationEmail(validUser.email, token);
    console.log("token", token);
    res.status(200).json(createResponse("Success", "Confirmation email sent"));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
    return;
  }
}

async function confirmUserCreation(req: Request, res: Response) {
  try {
    const userData = req.userData;

    if (!userData) {
      res.status(403).json(createResponse("Error", "User not authorized"));
      return;
    }

    const password = req.userData?.password;

    if (!password) {
      res.status(400).json(createResponse("Error", "Password is required"));
      return;
    }

    const encryptedPassword = await encryptPassword(password);

    userData.password = encryptedPassword;

    const user = em.create(User, { ...userData });

    await em.persistAndFlush(user);
    const validUser = { ...userData, id: user.id };
    const sessionToken = generateSessionToken(validUser);
    console.log("sessionToken", sessionToken);
    res
      .status(201)
      .json(createResponse("Success", "User created", sessionToken));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const user = await em.findOneOrFail(User, id);
    const userToUpdate =
      req.method === "PATCH"
        ? validateUserToPatch(req.body.sanitizedInput)
        : validateUser(req.body.sanitizedInput);
    em.assign(user, userToUpdate);
    await em.flush();
    res.status(200).json(createResponse("Success", "User updated"));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const user = em.getReference(User, id);
    await em.removeAndFlush(user);
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

export {
  SanitizedInput,
  findAll,
  findOne,
  confirmUserCreation,
  requestUserCreation,
  update,
  remove,
};
