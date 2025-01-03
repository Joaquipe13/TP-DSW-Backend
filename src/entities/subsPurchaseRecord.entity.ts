import {
  Cascade,
  Entity,
  OneToMany,
  Property,
  DateTimeType,
  ManyToOne,
  Rel,
} from "@mikro-orm/core";
import { PurchaseRecord, Subscription } from "./index.js";

@Entity()
export class SubsPurchaseRecord extends PurchaseRecord {
  @ManyToOne(() => Subscription, {
    nullable: false,
  })
  subscription!: Rel<Subscription>;
}
