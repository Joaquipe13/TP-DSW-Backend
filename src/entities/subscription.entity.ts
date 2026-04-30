import {
  Cascade,
  Entity,
  OneToMany,
  Property,
  Collection,
} from "@mikro-orm/core";
import { BaseEntity } from "./baseEntity.entity.js";
import { SubsPurchaseRecord } from "./index.js";
@Entity()
export class Subscription extends BaseEntity {
  @Property({ nullable: false })
  isActive!: boolean;

  @Property({ nullable: false, unique: true })
  description!: string;

  @Property({ nullable: false })
  duration!: number;

  @Property({ nullable: false })
  price!: number;

  @OneToMany(
    () => SubsPurchaseRecord,
    (subsPurchaseRecord) => subsPurchaseRecord.subscription,
    {
      cascade: [Cascade.ALL],
      nullable: true,
    }
  )
  subsPurchaseRecords? = new Collection<SubsPurchaseRecord>(this);
}
