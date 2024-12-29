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
export class User extends BaseEntity {
  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  surname!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property({ nullable: false, length: 255 })
  password!: string;

  @Property({ nullable: false, default: false })
  admin!: boolean;

  @OneToMany(() => PurchaseRecord, (purchaseRecord) => purchaseRecord.user, {
    cascade: [Cascade.ALL],
    nullable: true,
  })
  purchaseRecords = new Collection<PurchaseRecord>(this);
}
