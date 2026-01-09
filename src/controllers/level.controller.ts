import { Request, Response, NextFunction } from "express";
import { Level } from "../entities/index.js";
import { getOrm } from "../shared/index.js";
import { validateId,
  validateLevel, 
  validateLevelToPatch
} from "../schemas/index.js";
import { ZodError } from "zod";
import { createResponse } from "../utils/createResponse.js";

const orm = await getOrm();
const em = orm.em;
em.getRepository(Level);
function SanitizedInput(req: Request, res: Response, next: NextFunction) {
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
    res.json(createResponse("Success", "found all levels", levels));
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
    const level = await em.findOneOrFail(
      Level,
      { id },
      { populate: ["units", "course"] }
    );
    if (level.units) {
      level.units.getItems().sort((a, b) => a.order - b.order);
    }
    res.status(200).json(createResponse("Success", "found level", level));
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
async function add(req: Request, res: Response) {
  try {
    if (!req.userData?.admin){
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to create levels"));
      return;
    }
    const validLevel = validateLevel(req.body.sanitizedInput);
    const courseId = validLevel.course;
    const order = await em.count(Level, { course: courseId });
    const level = em.create(Level, { ...validLevel, order: order + 1 });
    await em.flush();
    const createdLevel = em.getReference(Level, level.id);
    res
      .status(201)
      .json(createResponse("Success", "Level created", createdLevel));
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
    if (!req.userData?.admin){
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to update levels"));
      return;
    };
    const id = validateId(req.params);
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
    res.status(200).json(createResponse("Success", "Level updated", level));
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

async function remove(req: Request, res: Response) {
  await em.transactional(async (em) => {
    try {
      if (!req.userData?.admin){
        await em.rollback();
        res
          .status(403)
          .json(createResponse("Forbidden", "You are not authorized to remove levels"));
        return;
      }
      const id = validateId(req.params);
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
  });
}

export { SanitizedInput, findAll, findOne, add, update, remove };
