import { z } from "zod";

const subscriptionSchema = z.object({
  description: z
    .string({ message: "Invalid description" })
    .min(1, "Description is required"),
  duration: z
    .number({ message: "Invalid duration" })
    .min(1, "Duration is required"),
  price: z.number({ message: "Invalid price" }).min(1, "Price is required"),
});
function validateSubscription(object: any) {
  try {
    return subscriptionSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

const subscriptionToPatch = z.object({
  description: z
    .string({ message: "Invalid description" })
    .min(1, "Description is required"),
  duration: z
    .number({ message: "Invalid duration" })
    .min(1, "Duration is required"),
  price: z.number({ message: "Invalid price" }).min(1, "Price is required"),
  isActive: z.boolean().optional(),
});

function validateSubscriptionToPatch(object: any) {
  try {
    return subscriptionToPatch.parse(object);
  } catch (error: any) {
    throw error;
  }
}
export { validateSubscription, validateSubscriptionToPatch };
