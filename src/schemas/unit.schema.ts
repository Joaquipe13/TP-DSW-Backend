import { z } from "zod";

const unitSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters")
    .regex(
      /^[A-Za-z0-9\s.,-]+$/,
      "Name can only contain letters, numbers, spaces, and certain symbols (.,-)"
    ),
  level: z.number().min(1, "Level is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Name must not exceed 2000 characters"),
});
export function validateUnit(object: any) {
  try {
    return unitSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

const unitToPatch = z.object({
  name: z
    .string()
    .max(50, "Name must not exceed 50 characters")
    .regex(
      /^[A-Za-z0-9\s.,-]+$/,
      "Name can only contain letters, numbers, spaces, and certain symbols (.,-)"
    )
    .optional(),
  order: z.number().optional(),
  content: z
    .string()
    .max(2000, "Name must not exceed 2000 characters")
    .optional(),
});

export function validateUnitToPatch(object: any) {
  try {
    return unitToPatch.parse(object);
  } catch (error: any) {
    throw error;
  }
}
