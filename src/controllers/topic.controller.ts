import { Request, Response, NextFunction } from "express";
import { Topic } from "../entities/index.js";
import { getOrm } from "../shared/index.js";
import { 
  validatedTopic,
  validateId,
 } from "../schemas/index.js";
import { ZodError } from "zod";
import { createResponse } from "../utils/createResponse.js";

const getEm = async () => (await getOrm()).em;

function SanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    description: req.body.description,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined)
      delete req.body.sanitizedInput[key];
  });
  next();
}

async function add(req: Request, res: Response) {
  try {
    const em = await getEm();
    if (!req.userData?.admin) {
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to create topics"));
      return;
    }
    const parsedData = validatedTopic(req.body.sanitizedInput);
    const topicCreated = em.create(Topic, parsedData);
    await em.flush();
    res
      .status(201)
      .json(createResponse("Success", "Topic created", topicCreated));
  } catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(422)
        .json(createResponse(
            "Unprocessable Entity",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const em = await getEm();
    const topics = await em.find(Topic, {});
    res
      .status(200)
      .json(createResponse("Success", "Finded all topics", topics));
  }catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(422)
        .json(createResponse(
            "Unprocessable Entity",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = await getEm();
    const id = validateId(req.params);
    const topic = await em.findOneOrFail(Topic, { id });
    res.status(200).json(createResponse("Success", "Finded topic", topic));
  }catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(422)
        .json(createResponse(
            "Unprocessable Entity",
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
    const em = await getEm();
    if (!req.userData?.admin) {
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to remove topics"));
      return;
    }
    const id = validateId(req.params);
    const topic = await em.findOneOrFail(Topic, id, { populate: ["courses"] });
    if (topic.courses.length > 0) {
      res
        .status(400)
        .json(
          createResponse(
            "Bad Request",
            "Cannot delete Topic as it is associated with one or more Courses."
          )
        );
    }
    em.remove(topic);
    await em.flush();
    res
      .status(204)
      .json(createResponse("Success", "Topic deleted successfully."));
  }catch (error: any) {
    if (error instanceof ZodError || error.name === "ZodError") {
      res
        .status(422)
        .json(createResponse(
            "Unprocessable Entity",
            error.issues
              ? error.issues.map((issue: any) => issue.message).join(", ")
              : "Validation error"
          ));
      return;
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

export { SanitizedInput, findAll, findOne, add, remove };
