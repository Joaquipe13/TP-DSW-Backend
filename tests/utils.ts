import { dateNow, topics, users, courses} from "./data.js";
import { expect } from "vitest";
import { generateSessionToken } from "../src/utils/index.js";


function sanitizedCourse(course: any) {
   if (course.levels.length === 0) {
    delete course.levels;
  }
  if (course.coursePurchaseRecords.length === 0) {
    delete course.coursePurchaseRecords;
  } 
  return course;
}

export function expectedCourseData(courses: any[]) {
  return courses.map((course) => ({
    ...course,
    id: course.id,
    createdAt: dateNow.getTime(),
    isActive: course.isActive || false,
    levels: course.levels || [],
    topics: course.topics.map((topicId) => ({
      id: topicId,
      description: topics[topicId - 1].description,
    })),
    coursePurchaseRecords: undefined,
  }));
}

export function expectedCourseCreatedData(course: any) {
  return {
    ...course,
    id: expect.any(Number),
    isActive: false,
    levels: [],
    topics: course.topics,
  };
}
export function expectedPATCHCourseData(courseId: number, changes: any) {
  const existingCourse = courses[courseId - 1];
  const result: any = {
    ...existingCourse,
    ...changes,
    createdAt: dateNow.getTime()
  };
  return sanitizedCourse(result);
}
export function expectedPUTCourseData(course: any) {

  const result: any = {
    ...course,
    id: course.id,
    createdAt: dateNow.getTime(),
    levels: undefined,
    coursePurchaseRecords: undefined,
  };
  if (!result.levels) {
    delete result.levels;
  }
  if (!result.coursePurchaseRecords) {
    delete result.coursePurchaseRecords;
  }
  return result;
}

export function adminToken() {
  const JwtPayload = {
    id: 1,
    name: users[0].name,
    surname: users[0].surname,
    email: users[0].email,
    admin: users[0].admin,
  };
  return generateSessionToken(
    JwtPayload,
    1
  );
}
export function authorizedUserToken() {
  const JwtPayload = {
    id: 2,
    name: users[1].name,
    surname: users[1].surname,
    email: users[1].email,
    admin: false,
  };
  return generateSessionToken(
    JwtPayload,
    1
  );
}
export function unauthorizedUserToken() {
  const JwtPayload = {
    id: 3,
    name: users[2].name,
    surname: users[2].surname,
    email: users[2].email,
    admin: false,
  };
  return generateSessionToken(
    JwtPayload,
    1
  );
}