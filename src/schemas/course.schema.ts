import { z } from "zod";

const courseSchema = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }).min(1, "Title cannot be empty"),
  price: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price must be a number",
  }).positive("Price must be a positive number"),
  topics: z.array(
    z.number().int().positive(), 
    {
      required_error: "Topics list is required",
      invalid_type_error: "Topics must be an array of numbers",
    }
  ).min(1, "At least one topic is required"),
  resume: z.string({
    required_error: "Resume is required",
    invalid_type_error: "Resume must be a string",
  }).min(1, "Resume cannot be empty"),

}, {
  invalid_type_error: "Course data must be an object",
  required_error: "Course data is required",
});

const courseToPatchSchema = z.object({
  title: z
    .string()
    .optional()
    .refine((val) => typeof val === "string" || val === undefined, {
      message: "Title must be a valid string",
    }),
  price: z
    .number()
    .positive()
    .optional()
    .refine((val) => val === undefined || val > 0, {
      message: "Price must be a positive number",
    })
    .refine((val) => typeof val === "number" || val === undefined, {
      message: "Price must be a valid number",
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
        message: "Each topic must be a positive integer",
      }
    ),
  isActive: z
    .boolean()
    .optional()
    .refine((val) => typeof val === "boolean" || val === undefined, {
      message: "Active status must be a boolean value",
    }),
  resume: z
    .string()
    .optional()
    .refine((val) => typeof val === "string" || val === undefined, {
      message: "Resume must be a valid string",
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
