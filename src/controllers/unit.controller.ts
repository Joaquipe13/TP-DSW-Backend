import { Request, Response, NextFunction } from "express";
import { Unit } from "../entities/unit.entity.js";
import { orm } from "../shared/orm.js";
import { validateUnit, validateUnitToPatch } from "../schemas/unit.schema.js";
import { ZodError } from "zod";
import { EntityManager } from "@mikro-orm/core";

const em: EntityManager = orm.em.fork();
em.getRepository(Unit);

function sanitizeUnitInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    name: req.body.name,
    level: req.body.level,
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined)
      delete req.body.sanitizedInput[key];
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const units = await em.find(Unit, {});
    res.status(200).json({ message: "found all units", data: units });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const unit = await em.findOneOrFail(Unit, { id }, { populate: ["level"] });
    res.status(200).json({ message: "found unit", data: unit });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
async function add(req: Request, res: Response) {
  try {
    const validUnit = validateUnit(req.body.sanitizedInput);
    const levelId = validUnit.level;
    const order = await em.count(Unit, { level: levelId });
    const unit = em.create(Unit, { ...validUnit, order: order + 1 });
    await em.flush();
    const createdUnit = em.getReference(Unit, unit.id);
    res.status(201).json({ message: "unit created", data: createdUnit });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).json({ message: error.message });
  }
}
async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const unit = em.getReference(Unit, id);
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
    em.assign(unitUpdated, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: "unit updated", data: unitUpdated });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  await em.transactional(async (em) => {
    try {
      const id = Number.parseInt(req.params.id);
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
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
}

export { sanitizeUnitInput, findAll, findOne, add, update, remove };
