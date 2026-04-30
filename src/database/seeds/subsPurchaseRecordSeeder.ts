import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { SubsPurchaseRecord } from "../../entities/subsPurchaseRecord.entity.js";
import { User } from "../../entities/user.entity.js";
import { Subscription } from "../../entities/subscription.entity.js";

interface SubsPurchaseData {
  userEmail: string;
  subscriptionDescription: string;
  totalAmount: number;
  purchaseAt: Date;
  effectiveAt: Date;
}

export const SUBS_PURCHASES_DATA: SubsPurchaseData[] = [
  {
    userEmail: "lucia.ortega@learnsphere.com",
    subscriptionDescription: "Plan Mensual",
    totalAmount: 19.99,
    purchaseAt: new Date("2025-12-10T10:00:00"),
    effectiveAt: new Date("2025-12-10T10:00:00"),
  },
  {
    userEmail: "diego.silva@learnsphere.com",
    subscriptionDescription: "Plan Trimestral",
    totalAmount: 49.99,
    purchaseAt: new Date("2025-12-15T14:30:00"),
    effectiveAt: new Date("2025-12-15T14:30:00"),
  },
  {
    userEmail: "sofia.ramirez@learnsphere.com",
    subscriptionDescription: "Plan Anual",
    totalAmount: 149.99,
    purchaseAt: new Date("2025-12-20T09:00:00"),
    effectiveAt: new Date("2025-12-20T09:00:00"),
  },
  {
    userEmail: "mateo.fernandez@learnsphere.com",
    subscriptionDescription: "Plan Semestral",
    totalAmount: 89.99,
    purchaseAt: new Date("2026-01-01T11:15:00"),
    effectiveAt: new Date("2026-01-01T11:15:00"),
  },
  {
    userEmail: "valentina.torres@learnsphere.com",
    subscriptionDescription: "Plan Estudiante (Mensual)",
    totalAmount: 9.99,
    purchaseAt: new Date("2026-01-03T16:45:00"),
    effectiveAt: new Date("2026-01-03T16:45:00"),
  },
  {
    userEmail: "sebastian.ruiz@learnsphere.com",
    subscriptionDescription: "Plan Mensual",
    totalAmount: 19.99,
    purchaseAt: new Date("2026-01-06T12:00:00"),
    effectiveAt: new Date("2026-01-06T12:00:00"),
  },
];

export class SubsPurchaseRecordSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    try {
      console.log('Starting SubsPurchaseRecordSeeder...');

      const users = await em.find(User, {});
      const subscriptions = await em.find(Subscription, {});

      if (users.length === 0) {
        console.warn('⚠️  No users created. Run UserSeeder first.');
        return;
      }

      if (subscriptions.length === 0) {
        console.warn('⚠️  No subscriptions created. Run SubscriptionSeeder first.');
        return;
      }

      for (const purchaseData of SUBS_PURCHASES_DATA) {
        const user = await em.findOne(User, { email: purchaseData.userEmail });
        if (!user) {
          console.warn(`User not found: ${purchaseData.userEmail}`);
          continue;
        }

        const subscription = await em.findOne(Subscription, {
          description: purchaseData.subscriptionDescription,
        });
        if (!subscription) {
          console.warn(`Subscription not found: ${purchaseData.subscriptionDescription}`);
          continue;
        }

        const existingPurchase = await em.findOne(SubsPurchaseRecord, {
          user: user,
          subscription: subscription,
          purchaseAt: purchaseData.purchaseAt,
        });

        if (existingPurchase) {
          console.log(`Purchase already exists: ${user.email} - ${subscription.description}`);
          continue;
        }

        const purchase = em.create(SubsPurchaseRecord, {
          user: user,
          subscription: subscription,
          totalAmount: purchaseData.totalAmount,
          purchaseAt: purchaseData.purchaseAt,
          effectiveAt: purchaseData.effectiveAt,
        });

        em.persist(purchase);
      }

      await em.flush();
      console.log('SubsPurchaseRecordSeeder completed');
    } catch (error: any) {
      throw new Error(error.message? `Error in SubsPurchaseRecordSeeder: ${error.message}` : 'Error in SubsPurchaseRecordSeeder: Unknown error');
    }
  }
}
