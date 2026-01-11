import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { Topic } from "../../entities/topic.entity.js";

export const TOPIC_DESCRIPTIONS = [
  "JavaScript",
  "Node.js",
  "SQL",
  "Frontend",
  "Backend",
];

export class TopicSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    try {
      console.log('Starting TopicSeeder...');

      for (const description of TOPIC_DESCRIPTIONS) {
        const existingTopic = await em.findOne(Topic, { description });
        if (!existingTopic) {
          const topic = em.create(Topic, { description });
          em.persist(topic);
          console.log(`Topic created: ${description}`);
        } else {
          console.log(`Topic already exists: ${description}`);
        }
      }

      await em.flush();
      console.log('TopicSeeder completed');
    } catch (error: any) {
      throw new Error(error.message? `Error in TopicSeeder: ${error.message}` : 'Error in TopicSeeder: Unknown error');
    }
  }
}
