import { MikroORM} from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { MikroORM as MikroORMTesting } from "@mikro-orm/sqlite";
import dotenv from "dotenv";
import { DatabaseSeeder } from "../database/seeds/databaseSeeder.js";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { DB_HOST, DB_NAME, NODE_ENV } = process.env;

let ormInstance;
let ormTestingInstance;
let ormPromise;
let ormTestingPromise;

let instanceCount = 0;

export const getOrm = async () => {
  if(NODE_ENV == "test") {
    if (!ormTestingInstance) {
      if (!ormTestingPromise) {
        instanceCount++;
        console.log(`\n[ORM] Creando instancia de TEST #${instanceCount}`);
        console.log(new Error().stack);
        ormTestingPromise = MikroORMTesting.init({
              entities: ["dist/**/*.entity.js"],
              entitiesTs: ["src/**/*entity.ts"],
              dbName: DB_NAME,
              type: "sqlite",
              highlighter: new SqlHighlighter(),
              debug: false,
              schemaGenerator: {
                disableForeignKeys: true,
                createForeignKeyConstraints: false,
              },
          });
      }
      ormTestingInstance = await ormTestingPromise;
    }
    return ormTestingInstance;
  }
  if (!ormInstance) {
    if (!ormPromise) {
      instanceCount++;
      console.log(`\n[ORM] Creando instancia de PRODUCTION #${instanceCount}`);
      console.log(new Error().stack);
      ormPromise = MikroORM.init({
          entities: ["dist/**/*.entity.js"],
          dbName: DB_NAME,
          clientUrl: DB_HOST,
          highlighter: new SqlHighlighter(),
          debug: true,
          schemaGenerator: {
            disableForeignKeys: true,
            createForeignKeyConstraints: true,
          },
        });
    }
    ormInstance = await ormPromise;
  }
  return ormInstance;
};

export const syncSchema = async () => {
  const orm = await getOrm();
  const generator = orm.getSchemaGenerator();
  if (NODE_ENV === "test") {
    await generator.dropSchema();
    await generator.createSchema();
  } else {
    await generator.updateSchema();
    const seeder = orm.getSeeder();
    try {
      await seeder.seed(DatabaseSeeder);
    } catch (err: any) {
      throw new Error(err.message ? `Seeding failed: ${err.message}` : 'Seeding failed: Unknown error');
    }
  }
};
