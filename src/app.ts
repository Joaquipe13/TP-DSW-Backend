import "reflect-metadata";
import express, { Express } from "express";
import dotenv from "dotenv";
import { getOrm, syncSchema } from "./shared/index.js";
import cors from "cors";
import { RequestContext } from "@mikro-orm/core";
import {
  userRouter,
  levelRouter,
  subsPurchaseRecordRouter,
  subscriptionRouter,
  unitRouter,
  loginRouter,
  courseRouter,
  coursePurchaseRecordRouter,
  topicRouter,
} from "./routes/index.js";
import { e2eRouter } from "../tests/E2E/e2e.routes.js";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { NODE_ENV, PUBLIC_URL, PORT, URL_FE, DB_HOST, DB_NAME } = process.env;
const app: Express = express();

const corsOptions = {
  origin: URL_FE,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

const startServer = async () => {
  const orm = await getOrm();
  const em = orm.em;
  app.use((req, res, next) => {
    RequestContext.create(em, next);
  });
  
  await syncSchema();

  app.use(express.json());

  app.use("/api/subscriptions", subscriptionRouter);
  app.use("/api/subsPurchaseRecords", subsPurchaseRecordRouter);
  app.use("/api/users", userRouter);
  app.use("/api/levels", levelRouter);
  app.use("/api/units", unitRouter);
  app.use("/api/login", loginRouter);
  app.use("/api/courses", courseRouter);
  app.use("/api/coursePurchaseRecords", coursePurchaseRecordRouter);
  app.use("/api/topics", topicRouter);

  if (NODE_ENV === "testE2E") {
    app.use("/api/e2e", e2eRouter);
  }

  app.use((_, res) => {
    res.status(404).send({ message: "Resource not found" });
  });

  app.listen(PORT, () => {
    console.log(
      `Server running on  ${PUBLIC_URL}, NODE_ENV: ${NODE_ENV}, URL_FE: ${URL_FE}, PORT: ${PORT}, DB_HOST: ${DB_HOST}, DB_NAME: ${DB_NAME}`
    );
  });
};
try {
  await startServer();
} catch (error: any) {
  console.error("Failed to start server:", error);
  process.exit(1);
}

export default app;
