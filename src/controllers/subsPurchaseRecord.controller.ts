import { Request, Response, NextFunction } from "express";
import { SubsPurchaseRecord } from "../entities";
import { orm } from "../shared/orm.js";
import { validateSubsPurchaseRecord } from "../schemas";
import {
  validateListPurchases,
  validateSearchByQuery,
  validateCheckSubsPurchase,
} from "../schemas";
import { ZodError } from "zod";
import { Subscription } from "../entities/subscription.entity.js";

const em = orm.em;

em.getRepository(SubsPurchaseRecord);
em.getRepository(Subscription);

function sanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    subscription: req.body.subscription,
    member: req.body.member,
  };

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}
function sanitizedSearchByQuery(query: any) {
  const sanitizedQuery: any = {};

  if (query.startDate) {
    const startDate = new Date(query.startDate);
    if (!isNaN(startDate.getTime())) {
      sanitizedQuery.startDate = startDate.toISOString();
    }
  }

  if (query.endDate) {
    const endDate = new Date(query.endDate);
    if (!isNaN(endDate.getTime())) {
      sanitizedQuery.endDate = endDate.toISOString();
    }
  }

  if (query.subscription) {
    const subscriptionId = Number(query.subscription);
    if (!isNaN(subscriptionId)) {
      sanitizedQuery.subscription = subscriptionId;
    }
  }
  if (query.user) {
    const userId = Number(query.user);
    if (!isNaN(userId)) {
      sanitizedQuery.user = userId;
    }
  }
  return sanitizedQuery;
}

async function findAll(req: Request, res: Response) {
  try {
    const sanitizedQuery = sanitizedSearchByQuery(req.query);
    const validatedQuery = validateSearchByQuery(sanitizedQuery);

    const subsPurchaseRecords = await em.find(
      SubsPurchaseRecord,
      validatedQuery,
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

async function add(req: Request, res: Response) {
  try {
    const validSubsPurchaseRecord = validateSubsPurchaseRecord(
      req.body.sanitizedInput
    );
    const subscriptionId = validSubsPurchaseRecord.subscription;
    const subscription = await em.findOneOrFail(Subscription, subscriptionId);
    const subscriptionPurchaseRecord = em.create(SubsPurchaseRecord, {
      ...validSubsPurchaseRecord,
      totalAmount: subscription.price,
      purchaseAt: new Date(),
    });
    await em.flush();
    res.status(201).json({
      message: "Subscription purchase record created",
      data: subscriptionPurchaseRecord,
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

async function listUserPurchasedSubs(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    validateListPurchases({ user: userId });
    const purchasedSubs = await em.find(
      SubsPurchaseRecord,
      { user: { id: userId } },
      { populate: ["subscription"] }
    );
    const subs = purchasedSubs.map((record) => record.subscription);
    res.status(200).json({
      message: subs.length
        ? "Purchased subscriptions found"
        : "No purchased subscriptions were found",
      data: subs,
    });
  } catch (error: any) {
    console.error("Error retrieving purchased subscriptions:", error);
    res.status(500).json({ message: error.message });
  }
}
async function checkSubsPurchase(req: Request, res: Response) {
  try {
    const purchase = validateCheckSubsPurchase({
      user: req.params.userId,
      subscription: req.params.subscriptionId,
    });

    const purchased = await em.findOne(SubsPurchaseRecord, {
      user: { id: purchase.user },
      subscription: { id: purchase.subscription },
    });
    res.status(200).json({
      message: purchased
        ? "Subscription has been purchased by the user"
        : "Subscription has not been purchased by the user",
      purchased: !!purchased,
    });
  } catch (error: any) {
    console.error("Error verifying subscription purchase:", error);
    res.status(500).json({ message: error.message });
  }
}
export {
  findAll,
  findOne,
  add,
  sanitizedInput,
  listUserPurchasedSubs,
  checkSubsPurchase,
};
