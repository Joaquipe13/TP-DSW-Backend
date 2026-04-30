import {
  Entity,
  Property,
  DateTimeType,
  ManyToOne,
  Rel,
} from "@mikro-orm/core";
import { PurchaseRecord } from "./purchaseRecord.entity.js";
import { Subscription } from "./subscription.entity.js";

@Entity()
export class SubsPurchaseRecord extends PurchaseRecord {
  @ManyToOne(() => Subscription, {
    nullable: false,
  })
  subscription!: Rel<Subscription>;
  @Property({ type: DateTimeType, nullable: false })
  effectiveAt? = new Date();
}
