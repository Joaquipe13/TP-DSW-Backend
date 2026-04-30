import { z } from "zod";
import { Subscription } from "../entities/subscription.entity.js";

const subsPurchaseSchema = z.object({
  subscription: z.coerce
    .number()
    .int()
    .positive()
    .min(1, "Subscription is required"),
  user: z.coerce.number().int().positive().min(1, "User is required"),
});

function validateSubsPurchaseRecord(object: any) {
  try {
    return subsPurchaseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}
const checkPurchaseSchema = z.object({
  user: z.coerce.number().int().positive(),
  subscription: z.coerce.number().int().positive(),
});
function validateCheckSubsPurchase(object: any) {
  try {
    return checkPurchaseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}
export { validateSubsPurchaseRecord, validateCheckSubsPurchase };
