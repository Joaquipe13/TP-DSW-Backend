import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { TopicSeeder } from "./topicSeeder.js";
import { CourseBasicSeeder } from "./courseBasicSeeder.js";
import { LevelSeeder } from "./levelSeeder.js";
import { UnitSeeder } from "./unitSeeder.js";
import { SubscriptionSeeder } from "./subscriptionSeeder.js";
import { CoursePurchaseRecordSeeder } from "./coursePurchaseRecordSeeder.js";
import { SubsPurchaseRecordSeeder } from "./subsPurchaseRecordSeeder.js";
import { AdminUserSeeder } from "./adminUserSeeder.js";
import { UserSeeder } from "./standarUsersSeeder.js";

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('=== Starting DatabaseSeeder ===');
    
    return this.call(em, [
      AdminUserSeeder,
      UserSeeder,
      
      TopicSeeder,
      SubscriptionSeeder,
      
      CourseBasicSeeder,
      
      LevelSeeder,
      
      UnitSeeder,
      
      CoursePurchaseRecordSeeder,
      SubsPurchaseRecordSeeder,
    ]);
  }
}
