import { Request, Response, NextFunction } from "express";
import { SubsPurchaseRecord } from "../entities/subsPurchaseRecord.entity.js";
import { orm } from "../shared/orm.js";
import { subsPurchaseSchema } from "../schemas/subsPurchase.schema.js";
import { ZodError } from "zod";

const em = orm.em;

em.getRepository(SubsPurchaseRecord);
function sanitizedInput(req: Request, res: Response, next: NextFunction) {
  // Creación de objeto con propiedades válidas
  req.body.sanitizedInput = {
    totalAmount: req.body.totalAmount,
    subscription: req.body.subscription,
    member: req.body.member,
  };

  // Eliminación de propiedades undefined
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function add(req: Request, res: Response) {
  try {
    const parsedData = subsPurchaseSchema.parse(req.body.sanitizedInput);
    //const subsPurchaseRecord = em.create(SubsPurchaseRecord, parsedData);
    await em.flush();
    res.status(201).json({
      message: "Subscription purchase record created",
      //data: subsPurchaseRecord,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).json({ message: error.message });
  }
}

async function findAll(req: Request, res: Response) {
  try {
    res.json({ message: "found all subsPurchaseRecords" });
    const subsPurchaseRecords = await em.find(
      SubsPurchaseRecord,
      {},
      { populate: ["subscription", "user"] }
    );
    res.json({
      message: "found all subsPurchaseRecords",
      data: subsPurchaseRecords,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const subsPurchaseRecord = await em.findOneOrFail(
      SubsPurchaseRecord,
      { id },
      { populate: ["subscription", "user"] }
    );
    res
      .status(200)
      .json({ message: "found subsPurchaseRecord", data: subsPurchaseRecord });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const subsPurchaseRecordToUpdate = await em.findOneOrFail(
      SubsPurchaseRecord,
      { id }
    );
    em.assign(subsPurchaseRecordToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({
      message: "SubsPurchaseRecord updated",
      data: subsPurchaseRecordToUpdate,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const subsPurchaseRecord = em.getReference(SubsPurchaseRecord, id);
    await em.removeAndFlush(subsPurchaseRecord);
    res.status(204).json({ message: "SubsPurchaseRecord deleted" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
  //res.status(500).json({ message: 'Not implemented' });
}

export { findAll, findOne, add, update, remove, sanitizedInput };
