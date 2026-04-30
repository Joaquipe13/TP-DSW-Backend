import { createResponse } from "../../src/utils/index.js";
import { Request, Response } from "express"

import dotenv from "dotenv";
import { encryptPassword, getOrm } from "../../src/shared/index.js";
import { User, CoursePurchaseRecord, SubsPurchaseRecord } from "../../src/entities/index.js";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const { NODE_ENV, E2E_NAME, E2E_SURNAME, E2E_EMAIL, E2E_PASSWORD, ADMIN_NAME, EMAIL_PASS,EMAIL_USER, ADMIN_SURNAME } = process.env;

const getEm = async () => (await getOrm()).em;

export async function getE2EUserCredentials(req: Request, res: Response) {
  if (NODE_ENV !== "testE2E") {
    res.status(404).json(createResponse("Not Found", "Endpoint unavailable"));
    return;
  }

  const em = await getEm();
  const email = E2E_EMAIL;
  
  const password = E2E_PASSWORD ? await encryptPassword(E2E_PASSWORD) : undefined;
  const user = em.create(User, {
    name: E2E_NAME,
    surname: E2E_SURNAME,
    password: password,
    email: E2E_EMAIL,
    admin: false,
  });
  await em.persistAndFlush(user);



  res
    .status(200)
    .json(createResponse("Success", "User credentials ready",  { email: E2E_EMAIL, password: E2E_PASSWORD} ));
  return;
}

export async function getE2EAdminCredentials(req: Request, res: Response) {
  if (NODE_ENV !== "testE2E") {
    res.status(404).json(createResponse("Not Found", "Endpoint unavailable"));
    return;
  }

  const em = await getEm();
  const email = EMAIL_USER;
  

  let user = await em.findOne(User, { email });
  if (!user) {
    const password = EMAIL_PASS ? await encryptPassword(EMAIL_PASS) : undefined;
    user = em.create(User, {
      name: ADMIN_NAME,
      surname: ADMIN_SURNAME,
      password: password,
      email: EMAIL_USER,
      admin: true,
    });
    await em.persistAndFlush(user);
  }

  res
    .status(200)
    .json(createResponse("Success", "Admin credentials ready", { email: EMAIL_USER, password: EMAIL_PASS} ));
  return;
}