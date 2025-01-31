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
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const { NODE_ENV, PUBLIC_URL, PORT, URL_FE } = process.env;
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

  if (NODE_ENV != "test") await syncSchema();

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

  app.use((_, res) => {
    res.status(404).send({ message: "Resource not found" });
  });

  app.listen(PORT, () => {
    console.log(`Server running on  ${PUBLIC_URL}, NODE_ENV: ${NODE_ENV}`);
  });
};

startServer();

export default app;
