import { Request, Response, NextFunction } from "express";
import { SubsPurchaseRecord, Subscription } from "../entities/index.js";
import { orm } from "../shared/orm.js";
import {
  validateListPurchases,
  validateSearchByQuery,
  validateCheckSubsPurchase,
  validateSubsPurchaseRecord,
} from "../schemas/index.js";
import { date, ZodError } from "zod";

const em = orm.em;

em.getRepository(SubsPurchaseRecord);
em.getRepository(Subscription);

function sanitizedInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    subscription: req.body.subscription,
    user: req.body.user,
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
    const purchasedSubs = await em.find(
      SubsPurchaseRecord,
      { user: { id: validSubsPurchaseRecord.user } },
      { populate: ["subscription"], orderBy: { effectiveAt: "DESC" } }
    );
    let purchased = false;
    let expirationDate: number = Date.now();
    if (purchasedSubs.length > 0) {
      const firstPurchase = purchasedSubs[0];
      if (firstPurchase?.effectiveAt && firstPurchase?.subscription?.duration) {
        expirationDate =
          firstPurchase.effectiveAt.getTime() +
          firstPurchase.subscription.duration * 24 * 60 * 60 * 1000;
        purchased = expirationDate > Date.now();
      }
    }

    let effectiveAt =
      expirationDate > Date.now() ? new Date(expirationDate) : new Date();

    const subscriptionId = validSubsPurchaseRecord.subscription;
    const subscription = await em.findOneOrFail(Subscription, subscriptionId);
    const subscriptionPurchaseRecord = em.create(SubsPurchaseRecord, {
      ...validSubsPurchaseRecord,
      totalAmount: subscription.price,
      purchaseAt: new Date(),
      effectiveAt: effectiveAt,
    });
    await em.flush();
    res.status(201).json({
      message: "Subscription purchase record created",
      data: subscriptionPurchaseRecord,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      res
        .status(400)
        .json(error.issues.map((issue) => ({ message: issue.message })));
    }
    res.status(500).json({ message: error.message });
  }
}

async function listUserPurchasedSubs(req: Request, res: Response) {
  try {
    const userId = validateListPurchases({ user: req.params.userId });
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
    const userId = validateListPurchases({ user: req.params.userId });
    const purchasedSubs = await em.find(
      SubsPurchaseRecord,
      { user: { id: userId } },
      { populate: ["subscription"], orderBy: { effectiveAt: "DESC" } }
    );
    let purchased = false;
    if (purchasedSubs.length > 0) {
      const firstPurchase = purchasedSubs[0];
      if (firstPurchase?.effectiveAt && firstPurchase?.subscription?.duration) {
        purchased =
          firstPurchase.effectiveAt.getTime() +
            firstPurchase.subscription.duration * 24 * 60 * 60 * 1000 >
          Date.now();
      }
    }

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
