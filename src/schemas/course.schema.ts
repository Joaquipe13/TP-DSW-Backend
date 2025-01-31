import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(1, "Price is required"),
  topics: z
    .array(z.number().int().positive())
    .min(1, "At least one topic is required"),
  resume: z.string().min(1, "Resume is required"),
});

const courseToPatchSchema = z.object({
  title: z
    .string()
    .optional()
    .refine((val) => typeof val === "string" || val === undefined, {
      message: "Title must be a valid string.",
    }),
  price: z
    .number()
    .positive()
    .optional()
    .refine((val) => val === undefined || val > 0, {
      message: "Price must be a positive number.",
    })
    .refine((val) => typeof val === "number" || val === undefined, {
      message: "Price must be a valid number.",
    }),

  topics: z
    .array(z.number().int().positive())
    .optional()
    .refine(
      (val) =>
        val === undefined ||
        (Array.isArray(val) &&
          val.every((v) => typeof v === "number" && v > 0)),
      {
        message: "Each topic must be a positive integer.",
      }
    ),
  isActive: z
    .boolean()
    .optional()
    .refine((val) => typeof val === "boolean" || val === undefined, {
      message: "Active status must be a boolean value.",
    }),
  resume: z
    .string()
    .optional()
    .refine((val) => typeof val === "string" || val === undefined, {
      message: "Resume must be a valid string.",
    }),
});

const searchByTitleSchema = z.object({
  title: z.string().nonempty("Title is required"),
});

function validateCourse(object: any) {
  try {
    return courseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

function validateCourseToPatch(object: any) {
  try {
    return courseToPatchSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

function validateSearchByTitle(object: any) {
  try {
    return searchByTitleSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}
export { validateCourse, validateCourseToPatch, validateSearchByTitle };
