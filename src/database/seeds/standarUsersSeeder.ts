import { Seeder } from "@mikro-orm/seeder";
import { encryptPassword } from "../../shared/encryption.js";
import { User } from "../../entities/user.entity.js";
import { EntityManager } from "@mikro-orm/mysql";

interface UserData {
  name: string;
  surname: string;
  email: string;
  password: string;
  admin: boolean;
}

export const standarUsers: UserData[] = [
  {
    name: "Sofía",
    surname: "Ramírez",
    email: "sofia.ramirez@learnsphere.com",
    password: "Tr3n_VeloZ!99$",
    admin: false,
  },
  {
    name: "Mateo",
    surname: "Fernández",
    email: "mateo.fernandez@learnsphere.com",
    password: "K#mP4s-Nor7e",
    admin: false,
  },
  {
    name: "Valentina",
    surname: "Torres",
    email: "valentina.torres@learnsphere.com",
    password: "Luz.V3rde@2026",
    admin: false,
  },
  {
    name: "Sebastián",
    surname: "Ruiz",
    email: "sebastian.ruiz@learnsphere.com",
    password: "Xy9!mR#4wZ",
    admin: false,
  },
  {
    name: "Isabella",
    surname: "Méndez",
    email: "isabella.mendez@learnsphere.com",
    password: "G4to-N3gro%77",
    admin: false,
  },
  {
    name: "Alejandro",
    surname: "Vargas",
    email: "alejandro.vargas@learnsphere.com",
    password: "Azul&C1elo$82",
    admin: false,
  },
  {
    name: "Camila",
    surname: "Castro",
    email: "camila.castro@learnsphere.com",
    password: "P!zza_Cal1ente#",
    admin: false,
  },
  {
    name: "Nicolás",
    surname: "Herrera",
    email: "nicolas.herrera@learnsphere.com",
    password: "V1enTo-Sur!45",
    admin: false,
  },
  {
    name: "Lucía",
    surname: "Ortega",
    email: "lucia.ortega@learnsphere.com",
    password: "R0ca.Fuer7e?",
    admin: false,
  },
  {
    name: "Diego",
    surname: "Silva",
    email: "diego.silva@learnsphere.com",
    password: "L1br0_Abiert0$",
    admin: false,
  }
];


export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    for (const userData of standarUsers) {
      const existingUser = await em.findOne(User, { email: userData.email });
      if (!existingUser) {
        console.log('Starting UserSeeder...');
        const encryptedPassword = await encryptPassword(userData.password);
        const userSeed = em.create(User, {
          name: userData.name,
          surname: userData.surname,
          email: userData.email,
          password: encryptedPassword,
          admin: userData.admin,
        });
        await em.persistAndFlush(userSeed);
      }
    }
  }
}
