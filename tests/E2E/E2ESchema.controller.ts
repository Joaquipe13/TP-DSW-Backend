import { createResponse } from "../../src/utils/index.js";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { getOrm, syncSchema } from "../../src/shared/index.js";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const { NODE_ENV } = process.env;

export async function resetSchema(req: Request, res: Response) {
  if (NODE_ENV !== "testE2E") {
    res.status(404).json(createResponse("Not Found", "Endpoint unavailable"));
    return;
  }

  try {
    await syncSchema();
    res.status(200).json(createResponse("Success", "Schema reset completed"));
    return;
  } catch (error: any) {
    const message = error.message || "Unknown error";
    res.status(500).json(
      createResponse("Error", `Failed to reset schema: ${message}`)
    );
    return;
  }
}
