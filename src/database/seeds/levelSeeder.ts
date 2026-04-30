import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { Level } from "../../entities/level.entity.js";
import { Course } from "../../entities/course.entity.js";

interface LevelData {
  courseTitle: string;
  name: string;
  description: string;
  order: number;
}

export const LEVELS_DATA: LevelData[] = [
  {
    courseTitle: "JavaScript desde cero",
    name: "Fundamentos",
    description: "Variables, tipos de datos, operadores y estructuras de control",
    order: 1,
  },
  {
    courseTitle: "JavaScript desde cero",
    name: "Funciones y scope",
    description: "Funciones, arrow functions, closure y contexto de ejecucion",
    order: 2,
  },
  {
    courseTitle: "Node.js y Express",
    name: "Introduccion a Node.js",
    description: "Fundamentos de Node.js y el ecosistema npm",
    order: 1,
  },
  {
    courseTitle: "Node.js y Express",
    name: "Express Framework",
    description: "Creacion de APIs REST con Express",
    order: 2,
  },
  {
    courseTitle: "SQL para desarrolladores",
    name: "Fundamentos de SQL",
    description: "Bases de datos relacionales y consultas basicas",
    order: 1,
  },
  {
    courseTitle: "SQL para desarrolladores",
    name: "Consultas avanzadas",
    description: "JOINs, subconsultas e indices",
    order: 2,
  },
];

export class LevelSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    try {
      console.log('Starting LevelSeeder...');

      for (const levelData of LEVELS_DATA) {
        const course = await em.findOne(Course, { title: levelData.courseTitle });
        if (!course) {
          console.warn(`Course not found: ${levelData.courseTitle}`);
          continue;
        }

        const existingLevel = await em.findOne(Level, {
          name: levelData.name,
          course: course,
        });

        if (existingLevel) {
          console.log(`Level already exists: ${levelData.name} (${levelData.courseTitle})`);
          continue;
        }

        const level = em.create(Level, {
          name: levelData.name,
          description: levelData.description,
          order: levelData.order,
          course: course,
        });

        em.persist(level);
      }

      await em.flush();
      console.log('LevelSeeder completed');
    } catch (error) {
      console.error('Error in LevelSeeder:', error);
      throw error;
    }
  }
}
