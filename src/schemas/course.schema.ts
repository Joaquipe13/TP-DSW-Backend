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
  title: z.string().optional(),
  price: z.number().optional(),
  topics: z.array(z.number().int().positive()).optional(),
  isActive: z.boolean().optional(),
  resume: z.string().optional(),
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
