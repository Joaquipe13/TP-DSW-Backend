import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Subscription, SubsPurchaseRecord, User } from "../entities/index.js";
import {
  validateId,
  validateListPurchases,
  validateSearchByQuery,
  validateSubsPurchaseRecord
} from "../schemas/index.js";
import { getOrm } from "../shared/index.js";
import { createResponse, sendSubscriptionReceipt } from "../utils/index.js";

const getEm = async () => (await getOrm()).em;

function SanitizedInput(req: Request, res: Response, next: NextFunction) {
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
    const em = await getEm();
    const sanitizedQuery = sanitizedSearchByQuery(req.query);
    if (sanitizedQuery?.user === undefined && !req.userData?.admin) {
      res
        .status(403)
        .json(createResponse("Forbidden", "You are not authorized to view all purchase records"));
      return;
    }
    console.error(`\x1b[31m  paso \x1b[0m`, sanitizedQuery);
    const validatedQuery = validateSearchByQuery(sanitizedQuery);

    const subsPurchaseRecords = await em.find(
      SubsPurchaseRecord,
      validatedQuery,
      { populate: ["subscription", "user"] }
    );
    res
      .status(200)
      .json(
        createResponse(
          "Success",
          "Found subsPurchaseRecords",
          subsPurchaseRecords
        )
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
    const subsPurchaseRecord = await em.findOneOrFail(
      SubsPurchaseRecord,
      { id },
      { populate: ["subscription", "user"] }
    );
    res
      .status(200)
      .json(
        createResponse(
          "Success",
          "Found subsPurchaseRecord",
          subsPurchaseRecord
        )
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

async function add(req: Request, res: Response) {
  try {
    const em = await getEm();
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
    const user = await em.findOneOrFail(User, subscriptionPurchaseRecord.user);
    const purchaseDetails = {
      id: subscriptionPurchaseRecord.id,
      description: subscription.description,
      duration: subscription.duration,
      price: subscription.price,
      datePurchase: new Date(),
      activateDate: effectiveAt,
    };
    const email = user.email;
    const sendEmail: string = await sendSubscriptionReceipt(
      email,
      purchaseDetails
    );
    res
      .status(201)
      .json(
        createResponse(
          "Success",
          sendEmail === "The email was sent successfully"
            ? "Subscription purchase record created and email sent"
            : sendEmail,
          subscriptionPurchaseRecord
        )
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

async function listUserPurchasedSubs(req: Request, res: Response) {
  try {
    const em = await getEm();
    const userId = req.userData?.id;
    if (!userId) {
      res
        .status(401)
        .json(createResponse("Unauthorized", "User not authenticated"));
      return;
    }
    const purchasedSubs = await em.find(
      SubsPurchaseRecord,
      { user: { id: userId } },
      { populate: ["subscription"] }
    );
    const subs = purchasedSubs.map((record) => record.subscription);
    res
      .status(200)
      .json(
        createResponse(
          "Success",
          subs.length
            ? "Purchased subscriptions found"
            : "No purchased subscriptions were found",
          subs
        )
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
async function checkSubsPurchase(req: Request, res: Response) {
  try {
    const em = await getEm();
    const userId = req.userData?.id;
    if (!userId) {
      res
        .status(401)
        .json(createResponse("Unauthorized", "User not authenticated"));
      return;
    }
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

    res
      .status(200)
      .json(
        createResponse(
          "Success",
          purchased
            ? "Subscription has been purchased by the user"
            : "Subscription has not been purchased by the user",
          !!purchased
        )
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
export {
  findAll,
  findOne,
  add,
  SanitizedInput,
  listUserPurchasedSubs,
  checkSubsPurchase,
};
