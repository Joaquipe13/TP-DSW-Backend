import { Request, Response, NextFunction } from "express";
import { Subscription } from "../entities";
import { orm } from "../shared/orm.js";
import { validateSubscription, validateSubscriptionToPatch } from "../schemas";
import { ZodError } from "zod";
import { SubsPurchaseRecord } from "../entities/subsPurchaseRecord.entity.js";

const em = orm.em;
em.getRepository(Subscription);
function sanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    description: req.body.description,
    duration: req.body.duration,
    price: req.body.price,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const subscriptions = await em.find(Subscription, {});
    res.json({ message: "found all subscriptions", data: subscriptions });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const subscription = await em.findOneOrFail(
      Subscription,
      { id },
      { populate: ["subsPurchaseRecords"] }
    );
    res.status(200).json({ message: "found subscription", data: subscription });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
async function add(req: Request, res: Response) {
  try {
    const validSubscription = validateSubscription(req.body.sanitizedInput);
    const subscription = em.create(Subscription, {
      ...validSubscription,
      isActive: true,
    });
    await em.flush();
    const subscriptionCreated = em.getReference(Subscription, subscription.id);
    res
      .status(201)
      .json({ message: "Subscription created", data: subscriptionCreated });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json(error.issues);
    }
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const subscription = em.getReference(Subscription, id);
    const subscriptionUpdated =
      req.method === "PATCH"
        ? validateSubscriptionToPatch(req.body.sanitizedInput)
        : validateSubscription(req.body.sanitizedInput);
    em.assign(subscription, subscriptionUpdated);
    await em.flush();
    res
      .status(200)
      .json({ message: "Subscription updated", data: subscription });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const subscription = em.getReference(Subscription, id);
    const purchaseRecordCount = await em.count(SubsPurchaseRecord, {
      subscription,
    });
    if (purchaseRecordCount > 0) {
      subscription.isActive = false;
      await em.flush();
      return res.status(200).json({ message: "Subscription deactivated" });
    } else {
      await em.removeAndFlush(subscription);
      res.status(204).json({ message: "Subscription deleted" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { findAll, findOne, add, update, remove, sanitizedInput };
