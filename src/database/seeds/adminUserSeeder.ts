import { Seeder } from "@mikro-orm/seeder";
import dotenv from "dotenv";
import { encryptPassword } from "../../shared/encryption.js";
import { User } from "../../entities/user.entity.js";
import { EntityManager } from "@mikro-orm/mysql";

dotenv.config({ path: process.env.NODE_ENV });

const { ADMIN_USER, ADMIN_PASS, ADMIN_SURNAME, ADMIN_NAME } = process.env;

export class AdminUserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const existingAdmin = await em.findOne(User, { email: "admin@gmail.com" });

    if (!existingAdmin) {
      const encryptedPassword = await encryptPassword(ADMIN_PASS || "Goku1234");

      const adminSeed = em.create(User, {
        name: ADMIN_NAME || "Admin",
        surname: ADMIN_SURNAME || "User",
        email: ADMIN_USER || "admin@gmail.com",
        password: encryptedPassword,
        admin: true,
      });

      await em.persistAndFlush(adminSeed);
    }
  }
}
