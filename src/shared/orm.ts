import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*entity.ts"],
  dbName: "tp-dsw",
  // Change 'type' to 'dbType'
  clientUrl: "mysql://root:root@localhost:3306/tp-dsw", //"mysql://root:{contraseña}@localhost:{puerto}/tp-dsw"

  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
    // Never use this in production
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  if (false) {
    await generator.dropSchema();
    await generator.createSchema();
  }
  await generator.updateSchema();
};
