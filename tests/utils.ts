import { EntityManager } from "@mikro-orm/mysql";
import { Course, Topic } from "../src/entities/index.js";
import { topics, courses, dateNow } from "./data";
import { expect } from "vitest";

export async function persistEntities(em: EntityManager): Promise<void> {
  for (const topic of topics) {
    em.create(Topic, topic);
  }
  for (const course of courses) {
    em.create(Course, course);
  }
  await em.flush();
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
export function expectedPATCHCourseData(courseId: number) {
  const course = courses[courseId - 1];

  return {
    ...course,
    id: course.id,
    createdAt: dateNow.getTime(),
    isActive: true,
    levels: undefined,
    topics: undefined,
    coursePurchaseRecords: undefined,
  };
}
export function expectedPUTCourseData(courseId: number) {
  const course = courses[courseId - 1]; // Obtenemos el curso por ID

  return {
    ...course,
    id: course.id,
    createdAt: dateNow.getTime(),
    levels: undefined,
    coursePurchaseRecords: undefined,
  };
}
