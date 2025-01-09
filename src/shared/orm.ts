import { MikroORM } from "@mikro-orm/mysql";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
//const dbUrl = process.env.DB_HOST || "mysql://root:root@localhost:3306/tp-dsw";
//const dbName = process.env.DB_NAME || "tp-dsw";
const dbUrl =
  process.env.DB_HOST ||
  "mysql://uaksmpzkuokzoluc:VwOck94rfxlRdKbgu0eo@bwrlbbsluibvsx1sdw7b-mysql.services.clever-cloud.com:3306/bwrlbbsluibvsx1sdw7b";
const dbName = process.env.DB_NAME || "bwrlbbsluibvsx1sdw7b";
export const orm = await MikroORM.init({
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*entity.ts"],
  dbName: dbName,
  // Change 'type' to 'dbType'
  clientUrl: dbUrl, //"mysql://sql10756492:ntbdZfKzXJ@sql10.freemysqlhosting.net:3306/sql10756492"
  //"mysql://root:{contraseña}@localhost:{puerto}/tp-dsw"

  highlighter: new SqlHighlighter(),
  debug: true,
  schemaGenerator: {
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
