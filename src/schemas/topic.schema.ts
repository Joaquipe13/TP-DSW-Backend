import { z } from "zod";

const topicSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .regex(/^[A-Za-z\s]+$/, {
      message: "Description can only contain letters and spaces",
    }),
});
function validatedTopic(object: any) {
  try {
    return topicSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}
export { validatedTopic };
