import { Course, Topic, CoursePurchaseRecord, User } from "../src/entities/index.js";
import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const { EMAIL_USER, EMAIL_PASS, ADMIN_NAME, ADMIN_SURNAME } = process.env;

export const dateNow = new Date();

export const users: User[] = [
  Object.assign(new User(), {
    id: 1,
    name: ADMIN_NAME as string,
    surname: ADMIN_SURNAME as string,
    password: EMAIL_PASS as string,
    email: EMAIL_USER as string,
    admin: true,
  }),
  Object.assign(new User(), {
    id: 2,
    name: "Regular",
    surname: "User",
    password: "password",
    email: "regular@example.com",
    admin: false,
  }),
  Object.assign(new User(), {
    id: 3,
    name: "Regular2",
    surname: "User2",
    password: "password",
    email: "regular2@example.com",
    admin: false,
  }),
];

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

export const coursePurchaseRecords: CoursePurchaseRecord[] = [
  Object.assign(new CoursePurchaseRecord(), {
    id: 1,
    user: 2,
    course: 2,
    purchaseDate: dateNow,
  })
];  

export const courseToCreate = {
  title: "Curso de React",
  resume: "Curso básico de React",
  price: 100,
  topics: [2],
};

export const courseToPut = { ...courses[0], title: "Other title" };

export const courseInput = {
  title: "any title",
  price: 10,
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
  isActive: true,
};
