import supertest from "supertest";
import app from "../src/app.js";
import { test, expect, describe } from "vitest";
import "./setup.js";
import {
  expectedCourseData,
  expectedCourseCreatedData,
  expectedPATCHCourseData,
  expectedPUTCourseData,
  adminToken,
  authorizedUserToken,
  unauthorizedUserToken,
} from "./utils.js";
import { courses, courseToCreate, courseToPatchInput, courseToPut, invalidCourseToPatchInput } from "./data.js";

const api = supertest(app);

describe("GET /api/courses", () => {
  test("Should return status 200", async () => {
    const response = await api
      .get("/api/courses");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found all courses",
      data: expectedCourseData(courses),
    });
  });

  test("Should return status 200 with title filter", async () => {
    const title = "JavaScript";
    const response = await api.get(`/api/courses?title=${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found all courses",
      data: expectedCourseData([courses[0]]),
    });
  });

  test("Should return status 200 with no matching title", async () => {
    const title = "NonExistingCourseTitle";
    const response = await api.get(`/api/courses?title=${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found all courses",
      data: [],
    });
  });

  test("Should return status 200 with empty title", async () => {
    const title = "";
    const response = await api.get(`/api/courses?title=${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found all courses",
      data: expectedCourseData(courses),
    });
  });

  test("Should return status 200 with whitespace title", async () => {
    const title = "   ";
    const response = await api.get(`/api/courses?title=${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found all courses",
      data: expectedCourseData(courses),
    });
  });

  test("Should return status 200 with special characters in title", async () => {
    const title = "!@#$%^&*()";
    const response = await api.get(`/api/courses?title=${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found all courses",
      data: [],
    });
  });

  test("Should return status 400 with invalid query parameter", async () => {
    const response = await api.get(`/api/courses?invalidParam=value`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found all courses",
      data: expectedCourseData(courses),
    });
  });
})

describe("GET /api/courses/:id", () => {

  test("Should return status 200 for existing course using admin token", async () => {
    const courseId = 1;
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found course",
      data: expectedCourseData([courses[courseId - 1]])[0],
    });
  });

  test("Should return status 200 for existing course using authorized user token", async () => {
    const courseId = 2;
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${authorizedUserToken()}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Found course",
      data: expectedCourseData([courses[courseId - 1]])[0],
    });
  });

  test("Should return status 401 for unauthorized access", async () => {
    const courseId = 1;
    const response = await api.get(`/api/courses/${courseId}`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Authentication token is missing or invalid format",
    });
  });

  test("Should return status 401 for invalid token", async () => {
    const courseId = 1;
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ***`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Invalid or expired token",
    });
  });

  test("Should return status 401 for missing token", async () => {
    const courseId = 1;
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer `);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Authentication token is missing or invalid format",
    });
  });

  test("Should return status 401 for invalid header format", async () => {
    const courseId = 1;
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `${adminToken()}`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Authentication token is missing or invalid format",
    });
  });

  test("Should return status 500 for non-existing course", async () => {
    const courseId = 999;
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "Error",
      message: `Course not found ({ id: ${courseId} })`,
    });
  });

  test("Should return status 400 for invalid course ID", async () => {
    const courseId = "invalid";
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: "Bad Request",
      message: `ID must be a number`,
    });
  });

  test("Should return status 403 for forbidden access", async () => {
    const courseId = 1;
    const response = await api
      .get(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${unauthorizedUserToken()}`);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        "status": "Forbidden",
        "data": {
          "purchased": false,
        },
        "message": "Course has not been purchased by the user",
    });
  });  
});

describe("POST /api/courses", () => {

  test("POST /api/courses should return status 201", async () => {
    const response = await api
      .post("/api/courses")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(courseToCreate);
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: "Success",
      message: "Course created",
      data: expectedCourseCreatedData(courseToCreate),
    });
  });

  test("Should return status 401 for unauthorized access", async () => {
    const response = await api
      .post("/api/courses")
      .send(courseToCreate);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Authentication token is missing or invalid format",
    });
  });

  test("Should return status 400 for invalid course data", async () => {
    const invalidCourseData = {
      title: "",
      description: "A course with invalid data",
      duration: -5,
      topics: [],
    };
    const response = await api
      .post("/api/courses")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(invalidCourseData);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      status: "Unprocessable Entity",
      message: "Title cannot be empty, Price is required, At least one topic is required, Resume is required",
    });
  });

  test("Should return status 400 for missing course data", async () => {
    const response = await api
      .post("/api/courses")
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      status: "Unprocessable Entity",
      message: "Course data is required",
    });
  });

  test("Should return status 400 for invalid course data type", async () => {
    const response = await api
      .post("/api/courses")
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(["This is not a valid course object"]);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      status: "Unprocessable Entity",
      message: "Course data must be an object",
    });
  });

  test("Should return status 403 for forbidden access", async () => {
    const response = await api
      .post("/api/courses")
      .set("Authorization", `Bearer ${unauthorizedUserToken()}`)
      .send(["This is not a valid course object"]);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: "Forbidden",
      message: "User not authorized",
    });
  });

});

describe("Patch /api/courses/:id", () => {

  test("PATCH /api/courses/:id should return status 200", async () => {
    const courseId = 1;
    const response = await api
      .patch(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(courseToPatchInput);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Course updated",
      data: expectedPATCHCourseData(courseId, courseToPatchInput),
    });
  });

  test("PATCH /api/courses/:id should ignore unknown fields and return status 200", async () => {
  const courseId = 1;
  const response = await api
    .patch(`/api/courses/${courseId}`)
    .set("Authorization", `Bearer ${adminToken()}`)
    .send({ 
        ...courseToPatchInput,
        superHack: "intentando romper todo"
    });

  expect(response.status).toBe(200);
  expect(response.body).toEqual(
    {
      status: "Success",
      message: "Course updated",
      data: expectedPATCHCourseData(courseId, courseToPatchInput),
    }
  );
});

  test("PATCH /api/courses/:id should return status 400 for invalid data", async () => {
    const courseId = 1;
    const response = await api
      .patch(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(invalidCourseToPatchInput);
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      status: "Unprocessable Entity",
      message: "Expected string, received number, Number must be greater than 0, Price must be a positive number, Expected number, received string, Expected string, received number",
    });
  });

  test("PATCH /api/courses/:id should return status 401 for unauthorized access", async () => {
    const courseId = 1;
    const response = await api
      .patch(`/api/courses/${courseId}`)
      .send(courseToPatchInput);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Authentication token is missing or invalid format",
    });
  });

  test("PATCH /api/courses/:id should return status 403 for forbidden access", async () => {
    const courseId = 1;
    const response = await api
      .patch(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${authorizedUserToken()}`)
      .send(courseToPatchInput);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: "Forbidden",
      message: "User not authorized",
    });
  });

  test("PATCH /api/courses/:id should return status 500 for non-existing course", async () => {
    const courseId = 999;
    const response = await api
      .patch(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(courseToPatchInput);
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "Error",
      message: `Course not found (${courseId})`,
    });
  });


})

describe("PUT /api/courses/:id", () => {
  test("PUT /api/courses/:id should return status 200", async () => {
    const courseId = 1;
    const response = await api
      .put(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send(courseToPut);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "Success",
      message: "Course updated",
      data: {
          ...expectedPUTCourseData(courseToPut)
      }});
  });

  test("PUT /api/courses/:id should return status 400 for invalid data", async () => {
    const courseId = 1;
    const response = await api
      .put(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ ...courses[courseId - 1], price: -100 });
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      status: "Unprocessable Entity",
      message: "Price must be a positive number",
    });
  });

  test("PUT /api/courses/:id should return status 401 for unauthorized access", async () => {
    const courseId = 1;
    const response = await api
      .put(`/api/courses/${courseId}`)
      .send({ isActive: true });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Authentication token is missing or invalid format",
    });
  });

  test("PUT /api/courses/:id should return status 403 for forbidden access", async () => {
    const courseId = 1;
    const response = await api
      .put(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${authorizedUserToken()}`)
      .send({ ...courses[courseId - 1], price: 100 });
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      status: "Forbidden",
      message: "User not authorized",
    });
  });

  test("PUT /api/courses/:id should return status 500 for non-existing course", async () => {
    const courseId = 999;
    const response = await api
      .put(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`)
      .send({ isActive: true });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      status: "Error",
      message: `Course not found (${courseId})`,
    });
  });


});


describe("DELETE /api/courses/:id", () => {

  test("DELETE /api/courses/:id should return status 200, Course deleted", async () => {
    const courseId = 1;
    const response = await api
      .delete(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "Success", message: "Course deleted" });
    expect(response.body.data).toBeUndefined();
  });

  test("DELETE /api/courses/:id should return status 200, Course desactivated", async () => {
    const courseId = 2;
    const response = await api
      .delete(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "Success", message: "Course desactivated" });
    expect(response.body.data).toBeUndefined();
  });


  test("DELETE /api/courses/:id should return status 401 for unauthorized access", async () => {
    const courseId = 2;
    const response = await api
      .delete(`/api/courses/${courseId}`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Authentication token is missing or invalid format",
    });
  });

  test("DELETE /api/courses/:id should return status 401 for unauthorized access", async () => {
    const courseId = 2;
    const response = await api
      .delete(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ***`);
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: "Unauthorized",
      message: "Invalid or expired token",
    });
  });

  test("DELETE /api/courses/:id should return status 403 for forbidden access", async () => {
    const courseId = 2;
    const response = await api
      .delete(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${authorizedUserToken()}`);
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ status: "Forbidden", message: "User not authorized" });
    expect(response.body.data).toBeUndefined();
  });

  test("DELETE /api/courses/:id should return status 404 for non-existing course", async () => {
    const courseId = 999;
    const response = await api
      .delete(`/api/courses/${courseId}`)
      .set("Authorization", `Bearer ${adminToken()}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: "Not Found",
      message: `Course does not exist`,
    });
  });
});
