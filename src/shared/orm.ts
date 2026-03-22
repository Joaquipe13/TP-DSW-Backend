import { MikroORM} from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { MikroORM as MikroORMTesting } from "@mikro-orm/sqlite";
import dotenv from "dotenv";
import { DatabaseSeeder } from "../database/seeds/databaseSeeder.js";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV } = process.env;
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306;
let ormInstance;
let ormTestingInstance;
let ormPromise;
let ormTestingPromise;


export const getOrm = async () => {
  if(NODE_ENV == "test") {
    if (!ormTestingInstance) {
      if (!ormTestingPromise) {
        ormTestingPromise = MikroORMTesting.init({
              entities: ["dist/**/*.entity.js"],
              entitiesTs: ["src/**/*entity.ts"],
              host: DB_HOST,
              port: DB_PORT,
              user: DB_USER,
              password: DB_PASSWORD, 
              dbName: DB_NAME,
              type: "sqlite",
              highlighter: new SqlHighlighter(),
              debug: false,
              driverOptions: process.env.NODE_ENV === 'production' ? {
                connection: {
                  ssl: {
                    minVersion: 'TLSv1.2',
                    rejectUnauthorized: true,
                  },
                },
              } : {},
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
