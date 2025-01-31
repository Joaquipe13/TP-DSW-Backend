import supertest from "supertest";
import app from "../src/app";
import { test, expect, describe } from "vitest";
import "./setup.ts";
import {
  expectedCourseData,
  expectedCourseCreatedData,
  expectedPATCHCourseData,
  expectedPUTCourseData,
} from "./utils";
import { courses, courseToCreate } from "./data";

const api = supertest(app);
describe.skip("Course test", () => {
  test("GET /api/courses should return status 200", async () => {
    const response = await api.get("/api/courses");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Found all courses",
        data: {
          courses: expectedCourseData(courses),
        },
      })
    );
  });
  test("GET /api/courses?title=title should return status 200", async () => {
    const title = "JavaScript";
    const response = await api.get(`/api/courses?title=${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Found all courses",
        data: {
          courses: expectedCourseData([courses[0]]),
        },
      })
    );
  });
  test("GET /api/courses/:id should return status 200", async () => {
    const courseId = 1;
    const response = await api.get(`/api/courses/${courseId}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Found course",
        data: expectedCourseData([courses[courseId - 1]])[0],
      })
    );
  });
  test("POST /api/courses should return status 201", async () => {
    const response = await api.post("/api/courses").send(courseToCreate);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Course created",
        data: {
          courseCreated: expect.objectContaining({
            ...expectedCourseCreatedData(courseToCreate),
            createdAt: expect.any(String),
          }),
        },
      })
    );
  });
  test("PATCH /api/courses/:id should return status 200", async () => {
    const courseId = 1;
    const response = await api
      .patch(`/api/courses/${courseId}`)
      .send({ isActive: true });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Course updated",
        data: expectedPATCHCourseData(courseId),
      })
    );
  });
  test("PUT /api/courses/:id should return status 200", async () => {
    const courseId = 1;
    const response = await api.put(`/api/courses/${courseId}`).send({
      ...courses[courseId - 1],
      title: "Curso JavaScript 2",
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Course updated",
        data: {
          ...expectedPUTCourseData(courseId),
          title: "Curso JavaScript 2",
        },
      })
    );
  });
  test("DELETE /api/courses/:id should return status 202", async () => {
    const courseId = 1;
    const response = await api.delete(`/api/courses/${courseId}`);
    expect(response.status).toBe(202);
    expect(response.body.message).toEqual("Course deleted");
  });
});
