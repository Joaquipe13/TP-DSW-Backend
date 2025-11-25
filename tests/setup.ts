import { getOrm, syncSchema } from "../src/shared/orm.js";
import { beforeAll, afterAll } from "vitest";
import { EntityManager, MikroORM } from "@mikro-orm/mysql";
import  persistEntities  from "./persistEntities.ts";

let orm: MikroORM;

beforeAll(async () => {
  orm = await getOrm();
  await syncSchema();
  const em: EntityManager = orm.em.fork();
  await persistEntities(em);
}, 30000);

afterAll(async () => {
  if (orm) {
    await orm.close();
  }
});
