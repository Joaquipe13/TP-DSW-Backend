import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Rel,
  Collection,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { PurchaseRecord } from "./purchaseRecord.entity.js";

@Entity()
export abstract class User extends BaseEntity {
  @Property({ unique: true })
  dni!: string;

  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  surname!: string;

  @Property({ nullable: false })
  email!: string;

  @Property({ nullable: false })
  password!: string;

  @Property({ nullable: false, default: false })
  admin!: boolean;

  @OneToMany(() => PurchaseRecord, (purchaseRecord) => purchaseRecord.user, {
    cascade: [Cascade.ALL],
    nullable: true,
  })
  purchaseRecords = new Collection<PurchaseRecord>(this);
}
