import { z } from "zod";

export const unitSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[A-Za-z0-9\s.,-]+$/,
      "Name can only contain letters, numbers, spaces, and certain symbols (.,-)"
    ),
  level: z.number().min(1, "Level is required"),
});
export function validateUnit(object: any) {
  try {
    return unitSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

export const unitToPatch = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[A-Za-z0-9\s.,-]+$/,
      "Name can only contain letters, numbers, spaces, and certain symbols (.,-)"
    )
    .optional(),
  order: z.number().optional(),
  level: z.number().optional(),
});

export function validateUnitToPatch(object: any) {
  try {
    return unitToPatch.parse(object);
  } catch (error: any) {
    throw error;
  }
}
