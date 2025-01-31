import { Course, Topic } from "../src/entities/index.js";

export const dateNow = new Date();
export const topics: Topic[] = [
  Object.assign(new Topic(), {
    id: 1,
    description: "Introducción a JavaScript",
  }),
  Object.assign(new Topic(), {
    id: 2,
    description: "Introducción a TypeScript",
  }),
  Object.assign(new Topic(), {
    id: 3,
    description: "Introducción a React",
  }),
];

export const courses: Course[] = [
  Object.assign(new Course(), {
    id: 1,
    isActive: true,
    title: "Curso de JavaScript",
    resume: "Curso básico de JavaScript",
    createdAt: dateNow,
    price: 100,
    topics: [1],
    levels: [],
  }),
  Object.assign(new Course(), {
    id: 2,
    isActive: true,
    title: "Curso de TypeScript",
    resume: "Curso avanzado de TypeScript",
    createdAt: dateNow,
    price: 120,
    topics: [2],
    levels: [],
  }),
];

export const courseToCreate = {
  title: "Curso de React",
  resume: "Curso básico de React",
  price: 100,
  topics: [2],
};

export const courseToPut = { ...courses[0], isActive: false };

export const courseInput = {
  title: "any title",
  price: 100,
  topics: [1, 2, 3],
  resume: "Resume example",
};
export const courseToPatchInput = {
  price: 100,
  topics: [1, 2, 3],
  resume: "Resume example",
  isActive: true,
};
export const invalidCourseInput = {
  title: "",
  price: -10,
  topics: [],
  resume: "",
};
export const invalidCourseToPatchInput = {
  title: 10,
  price: -10,
  topics: ["string"],
  resume: 15,
  isActive: "true",
};
