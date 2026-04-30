import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { CoursePurchaseRecord } from "../../entities/coursePurchaseRecord.entity.js";
import { User } from "../../entities/user.entity.js";
import { Course } from "../../entities/course.entity.js";

interface CoursePurchaseData {
  userEmail: string;
  courseTitle: string;
  totalAmount: number;
  purchaseAt: Date;
}

export const COURSE_PURCHASES_DATA: CoursePurchaseData[] = [
  {
    userEmail: "sofia.ramirez@learnsphere.com",
    courseTitle: "JavaScript desde cero",
    totalAmount: 49.99,
    purchaseAt: new Date("2025-12-15T10:30:00"),
  },
  {
    userEmail: "mateo.fernandez@learnsphere.com",
    courseTitle: "Node.js y Express",
    totalAmount: 59.99,
    purchaseAt: new Date("2025-12-20T14:45:00"),
  },
  {
    userEmail: "valentina.torres@learnsphere.com",
    courseTitle: "SQL para desarrolladores",
    totalAmount: 39.99,
    purchaseAt: new Date("2025-12-22T09:15:00"),
  },
  {
    userEmail: "sebastian.ruiz@learnsphere.com",
    courseTitle: "JavaScript desde cero",
    totalAmount: 49.99,
    purchaseAt: new Date("2025-12-28T16:20:00"),
  },
  {
    userEmail: "isabella.mendez@learnsphere.com",
    courseTitle: "Node.js y Express",
    totalAmount: 59.99,
    purchaseAt: new Date("2026-01-02T11:00:00"),
  },
  {
    userEmail: "alejandro.vargas@learnsphere.com",
    courseTitle: "SQL para desarrolladores",
    totalAmount: 39.99,
    purchaseAt: new Date("2026-01-05T13:30:00"),
  },
  {
    userEmail: "camila.castro@learnsphere.com",
    courseTitle: "JavaScript desde cero",
    totalAmount: 49.99,
    purchaseAt: new Date("2026-01-07T10:00:00"),
  },
  {
    userEmail: "nicolas.herrera@learnsphere.com",
    courseTitle: "Node.js y Express",
    totalAmount: 59.99,
    purchaseAt: new Date("2026-01-08T15:45:00"),
  },
];

export class CoursePurchaseRecordSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    try {
      console.log('Starting CoursePurchaseRecordSeeder...');

      const users = await em.find(User, {});
      const courses = await em.find(Course, {});

      if (users.length === 0) {
        console.warn('⚠️  No users created. Run UserSeeder first.');
        return;
      }

      if (courses.length === 0) {
        console.warn('⚠️  No courses created. Run CourseBasicSeeder first.');
        return;
      }

      for (const purchaseData of COURSE_PURCHASES_DATA) {
        const user = await em.findOne(User, { email: purchaseData.userEmail });
        if (!user) {
          console.warn(`User not found: ${purchaseData.userEmail}`);
          continue;
        }

        const course = await em.findOne(Course, { title: purchaseData.courseTitle });
        if (!course) {
          console.warn(`Course not found: ${purchaseData.courseTitle}`);
          continue;
        }

        const existingPurchase = await em.findOne(CoursePurchaseRecord, {
          user: user,
          course: course,
          purchaseAt: purchaseData.purchaseAt,
        });

        if (existingPurchase) {
          continue;
        }

        const purchase = em.create(CoursePurchaseRecord, {
          user: user,
          course: course,
          totalAmount: purchaseData.totalAmount,
          purchaseAt: purchaseData.purchaseAt,
        });

        em.persist(purchase);
      }

      await em.flush();
      console.log('CoursePurchaseRecordSeeder completed');
    } catch (error: any) {
      throw new Error(error.message ? `Error in CoursePurchaseRecordSeeder: ${error.message}` : 'Error in CoursePurchaseRecordSeeder: Unknown error');
    }
  }
}
