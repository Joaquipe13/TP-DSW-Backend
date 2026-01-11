import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { Subscription } from "../../entities/subscription.entity.js";

interface SubscriptionData {
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

export const SUBSCRIPTIONS_DATA: SubscriptionData[] = [
  {
    description: "Plan Mensual",
    duration: 30,
    price: 19.99,
    isActive: true,
  },
  {
    description: "Plan Trimestral",
    duration: 90,
    price: 49.99,
    isActive: true,
  },
  {
    description: "Plan Semestral",
    duration: 180,
    price: 89.99,
    isActive: true,
  },
  {
    description: "Plan Anual",
    duration: 365,
    price: 149.99,
    isActive: true,
  },
  {
    description: "Plan Estudiante (Mensual)",
    duration: 30,
    price: 9.99,
    isActive: true,
  },
];

export class SubscriptionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    try {
      console.log('Starting SubscriptionSeeder...');

      for (const subData of SUBSCRIPTIONS_DATA) {
        const existingSubscription = await em.findOne(Subscription, {
          description: subData.description,
        });

        if (existingSubscription) {
          console.log(`Subscription already exists: ${subData.description}`);
          continue;
        }

        const subscription = em.create(Subscription, {
          description: subData.description,
          duration: subData.duration,
          price: subData.price,
          isActive: subData.isActive,
        });

        em.persist(subscription);
      }

      await em.flush();
      console.log('SubscriptionSeeder completed');
    } catch (error: any) {
      throw new Error(error.message? `Error in SubscriptionSeeder: ${error.message}` : 'Error in SubscriptionSeeder: Unknown error');
    }
  }
}
