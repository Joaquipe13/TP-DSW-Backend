import { test, expect, describe } from "vitest";
import "./setup.js";
import {
  courseInput,
  invalidCourseInput,
  courseToPatchInput,
  invalidCourseToPatchInput,
} from "./data.js";
import {
  validateCourse,
  validateCourseToPatch,
} from "../src/schemas/course.schema.js";
import { ZodError } from "zod";

describe("Course validations test", () => {

  test("Should validate a correct course input", async () => {
    const validatedCourse = validateCourse(courseInput);
    expect(validatedCourse).toEqual(courseInput);
  });

  test("validateCourse should throw an error for invalid properties", () => {
    const courseInput = {
      invalidProp: "This is not allowed",
    };
    expect(() => validateCourse(courseInput)).toThrowError(ZodError);
  });

  test("Should throw ZodError for invalid course input", async () => {
    expect(() => validateCourse(invalidCourseInput)).toThrowError(ZodError);

    try {
      validateCourse(invalidCourseInput);
    } catch (error: any) {
      expect(error.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["title"],
            message: "Title cannot be empty",
          }),
          expect.objectContaining({
            path: ["price"],
            message: "Price must be a positive number",
          }),
          expect.objectContaining({
            path: ["topics"],
            message: "At least one topic is required",
          }),
          expect.objectContaining({
            path: ["resume"],
            message: "Resume cannot be empty",
          }),
        ])
      );
    }
  });

  test("Should validate a correct courseToPatch input", async () => {
    const validatedCourse = validateCourseToPatch(courseToPatchInput);
    expect(validatedCourse).toEqual(courseToPatchInput);
  });

  test("validateCourseToPatch should allow an empty object", () => {
    const emptyInput = {};
    expect(() => validateCourseToPatch(emptyInput)).not.toThrow();
    const result = validateCourseToPatch(emptyInput);
    expect(result).toEqual({});
  });

  test("validateCourseToPatch should throw an error for invalid properties", () => {
    const courseToPatchInput = {
      invalidProp: "This is not allowed",
    };
    expect(validateCourseToPatch({ courseToPatchInput })).toEqual({});
  });
  
  test("validateCourseToPatch should throw an error for invalid values", () => {
    try {
      validateCourseToPatch(invalidCourseToPatchInput);
      throw new Error("Expected validateCourseToPatch to throw");
    } catch (error: any) {
      expect(error).toBeInstanceOf(ZodError);
      expect(error.errors).toContainEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["title"],
            message: "Expected string, received number",
          }),
          expect.objectContaining({
            path: ["price"],
            message: "Price must be greater than 0",
          }),
          expect.objectContaining({
            path: ["topics", 0],
            message: "Expected number, received string",
          }),
          expect.objectContaining({
            path: ["resume"],
            message: "Expected string, received number",
          }),
        ])
      );
    }
  });
});
