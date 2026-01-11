import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { Course } from "../../entities/course.entity.js";
import { Topic } from "../../entities/topic.entity.js";

interface CourseBasicData {
  title: string;
  resume: string;
  price: number;
  topicDescriptions: string[];
}

export const COURSES_BASIC_DATA: CourseBasicData[] = [
  {
    title: "JavaScript desde cero",
    resume: "Sintaxis base, funciones, DOM y patrones modernos para crear interactividad.",
    price: 49.99,
    topicDescriptions: ["JavaScript", "Frontend"],
  },
  {
    title: "Node.js y Express",
    resume: "APIs REST con Express, middleware, autenticacion y despliegues básicos.",
    price: 59.99,
    topicDescriptions: ["Node.js", "Backend", "JavaScript"],
  },
  {
    title: "SQL para desarrolladores",
    resume: "Consultas, joins, indices y modelado relacional aplicado a proyectos reales.",
    price: 39.99,
    topicDescriptions: ["SQL", "Backend"],
  },
];

export class CourseBasicSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    try {
      console.log('Starting CourseBasicSeeder...');

      for (const courseData of COURSES_BASIC_DATA) {
        const existingCourse = await em.findOne(Course, { title: courseData.title });
        if (existingCourse) {
          console.log(`Course already exists: ${courseData.title}`);
          continue;
        }

        const course = em.create(Course, {
          title: courseData.title,
          resume: courseData.resume,
          price: courseData.price,
          isActive: true,
          createdAt: new Date(),
        });

        for (const topicDescription of courseData.topicDescriptions) {
          const topic = await em.findOne(Topic, { description: topicDescription });
          if (topic) {
            course.topics.add(topic);
          } else {
            console.warn(`Topic not found: ${topicDescription}`);
          }
        }

        em.persist(course);
        await em.flush();
      }

    } catch (error: any) {
      throw new Error(error.message ? `Error in CourseBasicSeeder: ${error.message}` : 'Error in CourseBasicSeeder: Unknown error');
    }
  }
}
