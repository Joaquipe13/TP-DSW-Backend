import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import dotenv from "dotenv";
import { MikroORM as MikroORMTesting } from "@mikro-orm/sqlite";
import { AdminSeeder } from "../database/seeds/adminUserSeeder.js";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` }); // Usar un archivo de entorno específico para pruebas.

const { DB_HOST, DB_NAME, NODE_ENV } = process.env;

let ormInstance;

export const getOrm = async () => {
  if (!ormInstance) {
    console.log(DB_HOST, DB_NAME, NODE_ENV);
    ormInstance = await (NODE_ENV == "test"
      ? MikroORMTesting.init({
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
        })
      : MikroORM.init({
          entities: ["dist/**/*.entity.js"],
          dbName: DB_NAME,
          clientUrl: DB_HOST,
          highlighter: new SqlHighlighter(),
          debug: true,
          schemaGenerator: {
            disableForeignKeys: true,
            createForeignKeyConstraints: true,
          },
        }));
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
  }
  // ejecutar el seeder
  const seeder = orm.getSeeder();
  await seeder.seed(AdminSeeder);
};
