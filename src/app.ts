import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { orm, syncSchema } from "./shared/index.js";
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

dotenv.config();

const app = express();

const PORT =/*  process.env.PORT ||  */3000;
const PORT_FE = /* process.env.PORT_FE || */ 5173;
const corsOptions = {
  origin: `http://localhost:${PORT_FE}`,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
//app.use(cors());

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

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

await syncSchema();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
