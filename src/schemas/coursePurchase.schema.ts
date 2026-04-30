import { z } from "zod";

const coursePurchaseSchema = z.object({
  course: z.coerce.number().int().positive().min(1, "Course is required"),
  user: z.coerce.number().int().positive().min(1, "User is required"),
});

function validateCoursePurchaseRecord(object: any) {
  try {
    return coursePurchaseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

const checkPurchaseSchema = z.object({
  user: z.coerce.number().int().positive(),
  course: z.coerce.number().int().positive(),
});

function validateCheckCoursePurchase(object: any) {
  try {
    return checkPurchaseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

export { validateCheckCoursePurchase, validateCoursePurchaseRecord };
