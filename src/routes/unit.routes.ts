import { Router } from "express";
import {
  SanitizedInput,
  findAll,
  findOne,
  add,
  update,
  remove,
} from "../controllers/unit.controller.js";

export const unitRouter: Router = Router();

unitRouter.get("/", findAll);
unitRouter.get("/:id", findOne);
unitRouter.post("/", SanitizedInput, add);
unitRouter.put("/:id", SanitizedInput, update);
unitRouter.patch("/:id", SanitizedInput, update);
unitRouter.delete("/:id", remove);
