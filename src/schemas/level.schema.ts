import { z } from "zod";

const levelSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[A-Za-z0-9\s.,-]+$/,
      "Name can only contain letters, numbers, spaces, and certain symbols (.,-)"
    ),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must not exceed 500 characters"),
  course: z.number().int().positive().min(1, "Course is required"),
});

function validateLevel(object: any) {
  try {
    return levelSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

const levelToPatch = z.object({
  name: z
    .string()
    .max(20, "Name must not exceed 100 characters")
    .regex(/^[A-Za-z0-9\s.,-]+$/, "Name can only contain letters and spaces")
    .optional(),
  description: z
    .string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  order: z.number().int().positive().optional(),
});

function validateLevelToPatch(object: any) {
  try {
    return levelToPatch.parse(object);
  } catch (error: any) {
    throw error;
  }
}
const searchByOrderAndCourseSchema = z.object({
  order: z.number().int().positive(),
  course: z.number().int().positive(),
});
export { validateLevel, validateLevelToPatch };
