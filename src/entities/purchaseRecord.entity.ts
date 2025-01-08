import {
  Cascade,
  Entity,
  Property,
  DateTimeType,
  ManyToOne,
  Rel,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { User } from "./index.js";

@Entity()
export abstract class PurchaseRecord extends BaseEntity {
  @Property()
  totalAmount!: number;

  @ManyToOne(() => User, {
    nullable: false,
  })
  user!: Rel<User>;

  @Property({ type: DateTimeType, nullable: true })
  purchaseAt? = new Date();
}
