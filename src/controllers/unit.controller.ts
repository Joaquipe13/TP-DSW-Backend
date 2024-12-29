import { Request, Response, NextFunction } from "express";
import { Unit } from "../entities";
import { orm } from "../shared/orm.js";
import { validateUnit, validateUnitToPatch } from "../schemas";
import { ZodError } from "zod";
import { EntityManager } from "@mikro-orm/core";

const em: EntityManager = orm.em.fork();
em.getRepository(Unit);

function sanitizeUnitInput(req: Request, res: Response, next: NextFunction) {
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
    const sanitizedQuery = sanitizeSearchInput(req);
    const units = await em.find(Unit, sanitizedQuery);
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

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // Obtén la referencia de la unidad
    const unit = await em.findOne(Unit, id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    let unitUpdated;

    if (req.method === "PATCH") {
      // Validar la entrada antes de procesarla
      unitUpdated = validateUnitToPatch(req.body.sanitizedInput);

      // Si se proporciona un nuevo valor para "order", procesamos la actualización de los órdenes
      if (unitUpdated.order) {
        const originalOrder = unit.order;
        const newOrder = unitUpdated.order;

        if (originalOrder !== newOrder) {
          const allUnits = await em.find(Unit, {});

          // Si el nuevo orden es mayor, reducimos el orden de las unidades entre los valores originales y nuevos
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
      // Validar la entrada para otros tipos de solicitudes (PUT, por ejemplo)
      unitUpdated = validateUnit(req.body.sanitizedInput);
    }

    // Asignar los nuevos valores a la unidad y guardar
    em.assign(unit, unitUpdated);
    await em.flush();

    // Responder con éxito
    res.status(200).json({ message: "Unit updated", data: unitUpdated });
  } catch (error: any) {
    // Capturar cualquier error y devolver una respuesta 500
    console.error(error);
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
