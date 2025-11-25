import { EntityManager } from "@mikro-orm/core";
import {users, topics, courses, coursePurchaseRecords} from "./data.ts";
import { Course, CoursePurchaseRecord, Topic, User } from "../src/entities/index.ts";


async function persistEntities(em: EntityManager): Promise<void> {
  for (const data of users) {
    em.create(User, data); 
  }

  for (const data of topics) {
    em.create(Topic, data);
  }

  for (const data of courses) {
    em.create(Course, data);
  }

  for (const data of coursePurchaseRecords) {
    em.create(CoursePurchaseRecord, data);
  }

  await em.flush();;
}

export default persistEntities;