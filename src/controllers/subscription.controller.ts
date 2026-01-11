import { Request, Response, NextFunction } from "express";
import { Subscription, SubsPurchaseRecord } from "../entities/index.js";
import {
  validateSubscription,
  validateSubscriptionToPatch,
  validateId
} from "../schemas/index.js";
import { ZodError } from "zod";
import { createResponse } from "../utils/createResponse.js";
import {  getOrm } from "../shared/index.js";

const getEm = async () => (await getOrm()).em;
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
    const em = await getEm();
    const subscriptions = await em.find(Subscription, {});
    res
      .status(200)
      .json(
        createResponse("Success", "found all subscriptions", subscriptions)
      );
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
    const subscription = await em.findOneOrFail(
      Subscription,
      { id },
      { populate: ["subsPurchaseRecords"] }
    );
    res
      .status(200)
      .json(createResponse("Success", "found subscription", subscription));
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
    if (!req.userData?.admin){
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to create subscriptions"));
      return;
    }
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
    if (!req.userData?.admin){
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to update subscriptions"));
      return;
    }
    const id = validateId(req.params);
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
    if (!req.userData?.admin){
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to remove subscriptions"));
      return;
    }
    const id = validateId(req.params);
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

export { findAll, findOne, add, update, remove, SanitizedInput };
