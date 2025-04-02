import { Request, Response, NextFunction } from "express";
import { Subscription, SubsPurchaseRecord } from "../entities/index.js";
import {
  validateSubscription,
  validateSubscriptionToPatch,
} from "../schemas/index.js";
import { ZodError } from "zod";
import { createResponse } from "../utils/createResponse.js";
import { isAuthorized, getOrm } from "../shared/index.js";

const orm = await getOrm();
const em = orm.em;
em.getRepository(Subscription);
function SanitizedInput(req: Request, res: Response, next: NextFunction) {
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
    res
      .status(200)
      .json(
        createResponse("Success", "found all subscriptions", subscriptions)
      );
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
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
    res
      .status(200)
      .json(createResponse("Success", "found subscription", subscription));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}
async function add(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
    const validSubscription = validateSubscription(req.body.sanitizedInput);
    const subscription = em.create(Subscription, {
      ...validSubscription,
      isActive: true,
    });
    await em.flush();
    const subscriptionCreated = em.getReference(Subscription, subscription.id);
    res
      .status(201)
      .json(
        createResponse("Success", "Subscription created", subscriptionCreated)
      );
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json(error.issues);
    }
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function update(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
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
      .json(createResponse("Success", "Subscription updated", subscription));
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

async function remove(req: Request, res: Response) {
  try {
    if (!isAuthorized(req, res)) return;
    const id = Number.parseInt(req.params.id);
    const subscription = em.getReference(Subscription, id);
    const purchaseRecordCount = await em.count(SubsPurchaseRecord, {
      subscription,
    });
    if (purchaseRecordCount > 0) {
      subscription.isActive = false;
      await em.flush();
      res
        .status(204)
        .json(createResponse("Success", "Subscription deactivated"));
    } else {
      await em.removeAndFlush(subscription);
      res.status(204).json(createResponse("Success", "Subscription deleted"));
    }
  } catch (error: any) {
    res.status(500).json(createResponse("Error", error.message));
  }
}

export { findAll, findOne, add, update, remove, SanitizedInput };
