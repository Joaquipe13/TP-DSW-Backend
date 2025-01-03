import { Request, Response, NextFunction } from "express";
import { Level } from "../entities/index.js";
import { orm } from "../shared/orm.js";
import { validateLevel, validateLevelToPatch } from "../schemas/index.js";
import { ZodError } from "zod";
import { EntityManager } from "@mikro-orm/core";

const em: EntityManager = orm.em.fork();
em.getRepository(Level);
function sanitizeLevelInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    description: req.body.description,
    course: req.body.course,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}
function sanitizeSearchInput(req: Request) {
  const queryResult: any = {};
  if (req.query.course !== undefined) {
    const course = Number(req.query.course);
    if (!isNaN(course) && course > 0) {
      queryResult.course = course;
    }
  }
  if (req.query.order !== undefined) {
    const order = Number(req.query.order);
    if (!isNaN(order) && (order === 1 || order === -1)) {
      queryResult.order = order;
    }
  }
  return queryResult;
}

async function findAll(req: Request, res: Response) {
  try {
    const sanitizedQuery = sanitizeSearchInput(req);
    const levels = await em.find(Level, sanitizedQuery, {
      populate: ["units"],
    });
    res.json({ message: "found all levels", data: levels });
  } catch (error: any) {
    res.status(500).json({ message: "Error finding Levels" });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const level = await em.findOneOrFail(
      Level,
      { id },
      { populate: ["units", "course"] }
    );
    if (level.units) {
      level.units.getItems().sort((a, b) => a.order - b.order);
    }
    res.status(200).json({ message: "found level", data: level });
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
}
async function add(req: Request, res: Response) {
  try {
    const validLevel = validateLevel(req.body.sanitizedInput);
    const courseId = validLevel.course;
    const order = await em.count(Level, { course: courseId });
    const level = em.create(Level, { ...validLevel, order: order + 1 });
    await em.flush();
    const createdLevel = em.getReference(Level, level.id);
    res.status(201).json({ message: "Level created", data: { createdLevel } });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).send({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const level = em.getReference(Level, id);
    let levelUpdated;

    if (req.method === "PATCH") {
      levelUpdated = validateLevelToPatch(req.body.sanitizedInput);
      if (levelUpdated.order) {
        const originalOrder = level.order;
        const newOrder = levelUpdated.order;
        if (originalOrder !== newOrder) {
          const allLevels = await em.find(Level, {});
          if (newOrder > originalOrder) {
            allLevels.forEach((level) => {
              if (level.order > originalOrder && level.order <= newOrder) {
                level.order -= 1;
              }
            });
          } else if (newOrder < originalOrder) {
            allLevels.forEach((lvl) => {
              if (lvl.order < originalOrder && lvl.order >= newOrder) {
                lvl.order += 1;
              }
            });
          }
        }
      }
    } else {
      levelUpdated = validateLevel(req.body.sanitizedInput);
    }
    em.assign(level, levelUpdated);
    await em.flush();
    res.status(200).json({ message: "Level updated", data: level });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).send({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  await em.transactional(async (em) => {
    try {
      const id = Number.parseInt(req.params.id);
      const level = await em.findOneOrFail(Level, { id });
      const course = level.course;
      const order = level.order;
      await em.removeAndFlush(level);
      const levelsToUpdate = await em.find(Level, {
        course: course.id,
        order: { $gt: order },
      });
      for (const u of levelsToUpdate) {
        u.order -= 1;
        em.persist(u);
      }

      await em.flush();
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}

export { sanitizeLevelInput, findAll, findOne, add, update, remove };
