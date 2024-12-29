import { Request, Response, NextFunction } from "express";
import { Topic } from "../entities";
import { orm } from "../shared/orm.js";
import { validatedTopic } from "../schemas";
import { ZodError } from "zod";

const em = orm.em;
em.getRepository(Topic);

function sanitizedInput(req: Request, res: Response, next: NextFunction) {
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
    const parsedData = validatedTopic(req.body.sanitizedInput);
    const topicCreated = em.create(Topic, parsedData);
    await em.flush();
    res.status(201).json({ message: "Topic created", data: topicCreated });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).send({ message: error.message });
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const topics = await em.find(Topic, {});
    res.json({ message: "Finded all topics", data: topics });
  } catch (error: any) {
    res.status(500).json({ message: "Error finding topics" });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const topic = await em.findOneOrFail(Topic, { id });
    res.status(200).json({ message: "Finded topic", data: topic });
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
}
async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const topic = await em.findOneOrFail(Topic, id, { populate: ["courses"] });
    if (topic.courses.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete Topic as it is associated with one or more Courses.",
      });
    }
    em.remove(topic);
    await em.flush();
    res.status(200).json({ message: "Topic deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizedInput, findAll, findOne, add, remove };
