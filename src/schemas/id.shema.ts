import { z } from "zod";

const idSchema = z.object({
  id: z.coerce
    .number({ invalid_type_error: "ID must be a number" })
    .int({ message: "ID must be an integer" })
    .positive({ message: "ID must be a positive number" }),
});

function validateId(object: any): number {
  try {
    const data = idSchema.parse(object);
    return data.id; 
  } catch (error: any) {
    throw error;
  }
}

export { validateId };