import {
  Entity,
  Property,
  DateTimeType,
  ManyToOne,
  Rel,
} from "@mikro-orm/core";
import { BaseEntity } from "./baseEntity.entity.js";
import { User } from "./user.entity.js";

@Entity()
export abstract class PurchaseRecord extends BaseEntity {
  @Property()
  totalAmount: number = 0;

  @ManyToOne(() => User, {
    nullable: false,
  })
  user!: Rel<User>;

  @Property({ type: DateTimeType, nullable: false })
  purchaseAt? = new Date();
}
