import { Request, Response, NextFunction } from "express";
import { Unit } from "../entities/index.js";
import { getOrm } from "../shared/index.js";
import { 
  validateUnit, 
  validateUnitToPatch,
  validateId 
} from "../schemas/index.js";
import { ZodError } from "zod";
import { createResponse } from "../utils/createResponse.js";

const getEm = async () => (await getOrm()).em;

function SanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    content: req.body.content,
    level: req.body.level,
    order: req.body.order,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined)
      delete req.body.sanitizedInput[key];
  });
  next();
}
function sanitizeSearchInput(req: Request) {
  const queryResult: any = {};
  if (req.query.level !== undefined) {
    const level = Number(req.query.level);
    if (!isNaN(level) && level > 0) {
      queryResult.level = level;
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
    const em = await getEm();
    const sanitizedQuery = sanitizeSearchInput(req);
    const units = await em.find(Unit, sanitizedQuery);
    res.status(200).json(createResponse("Success", "found all units", units));
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
    const unit = await em.findOneOrFail(Unit, { id }, { populate: ["level"] });
    res.status(200).json(createResponse("Success", "found unit", unit));
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
async function add(req: Request, res: Response) {
  try {
    const em = await getEm();
    if (!req.userData?.admin) {
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to create units"));
      return;
    }
    const validUnit = validateUnit(req.body.sanitizedInput);
    const levelId = validUnit.level;
    const order = await em.count(Unit, { level: levelId });
    const unit = em.create(Unit, { ...validUnit, order: order + 1 });
    await em.flush();
    const createdUnit = em.getReference(Unit, unit.id);
    res
      .status(201)
      .json(createResponse("Success", "unit created", createdUnit));
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
async function update(req: Request, res: Response) {
  try {
    const em = await getEm();
    if (!req.userData?.admin) {
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to update units"));
      return;
    }
   
      const id = validateId(req.params);

    if (isNaN(id)) {
      res.status(422).json(createResponse("Unprocessable Entity", "Invalid ID"));
      return;
    }

    const unit = await em.findOne(Unit, id);

    if (!unit) {
      res.status(404).json(createResponse("Not Found", "Unit not found"));
      return;
    }

    let unitUpdated;

    if (req.method === "PATCH") {
      unitUpdated = validateUnitToPatch(req.body.sanitizedInput);

      if (unitUpdated.order) {
        const originalOrder = unit.order;
        const newOrder = unitUpdated.order;

        if (originalOrder !== newOrder) {
          const allUnits = await em.find(Unit, {});

          if (newOrder > originalOrder) {
            allUnits.forEach((unit) => {
              if (unit.order > originalOrder && unit.order <= newOrder) {
                unit.order -= 1;
              }
            });
          } else if (newOrder < originalOrder) {
            allUnits.forEach((lvl) => {
              if (lvl.order < originalOrder && lvl.order >= newOrder) {
                lvl.order += 1;
              }
            });
          }
        }
      }
    } else {
      unitUpdated = validateUnit(req.body.sanitizedInput);
    }

    em.assign(unit, unitUpdated);
    await em.flush();

    res
      .status(200)
      .json(createResponse("Success", "Unit updated", unitUpdated));
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

async function remove(req: Request, res: Response) {
  const em = await getEm();
  await em.transactional(async (em) => {
    try {
      if (!req.userData?.admin) {
        await em.rollback();
        res
          .status(403)
          .json(createResponse("Forbidden", "You are not authorized to delete units"));
        return;
      }
      const id = validateId(req.params);
      const unit = await em.findOneOrFail(Unit, { id });
      const level = unit.level;
      const order = unit.order;
      await em.removeAndFlush(unit);
      const unitsToUpdate = await em.find(Unit, {
        level: level.id,
        order: { $gt: order },
      });
      for (const u of unitsToUpdate) {
        u.order -= 1;
        em.persist(u);
      }

      await em.flush();
      res
        .status(204)
        .json(createResponse("Success", "Unit deleted successfully."));
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
  });
}

export { SanitizedInput, findAll, findOne, add, update, remove };
