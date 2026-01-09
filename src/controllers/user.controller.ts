import { Request, Response, NextFunction } from "express";
import { User } from "../entities/index.js";
import { getOrm } from "../shared/index.js";
import { 
  validateUser,
  validateUserToPatch,
  validateId 
} from "../schemas/index.js";
import { ZodError } from "zod";
import { encryptPassword } from "../shared/encryption.js";
import { createResponse } from "../utils/createResponse.js";

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
    if (!req.userData?.admin) {
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to view users"));
      return;
    }
    const users = await em.find(User, {}, { populate: ["purchaseRecords"] });
    res.status(200).json(createResponse("Success", "found all users", users));
  }catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request",  error.issues.map((issue) => issue.message).join(", ")));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = validateId(req.params);
    const user = await em.findOneOrFail(
      User,
      { id },
      { populate: ["purchaseRecords"] }
    );
    res.status(200).json(createResponse("Success", "found user", user));
  }catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(createResponse("Bad Request",  error.issues.map((issue) => issue.message).join(", ")));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}
async function add(req: Request, res: Response) {
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
    const hashedPassword = await encryptPassword(validUser.password);
    validUser.password = hashedPassword;
    if (validUser.admin === undefined) validUser.admin = false;
    const user = em.create(User, validUser);
    await em.flush();
    const userCreated = em.getReference(User, user.id);
    res
      .status(201)
      .json(createResponse("Success", "User created", userCreated));
  } catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(400)
        .json(createResponse(
            "Bad Request",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = validateId(req.params);
    const user = await em.findOneOrFail(User, id);
    const userToUpdate =
      req.method === "PATCH"
        ? validateUserToPatch(req.body.sanitizedInput)
        : validateUser(req.body.sanitizedInput);
    em.assign(user, userToUpdate);
    await em.flush();
    res.status(200).json(createResponse("Success", "User updated"));
  }catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(400)
        .json(createResponse(
            "Bad Request",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = validateId(req.params);
    const user = em.getReference(User, id);
    await em.removeAndFlush(user);
  }catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(400)
        .json(createResponse(
            "Bad Request",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

export { SanitizedInput, findAll, findOne, add, update, remove };
