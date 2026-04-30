import { Entity, ManyToOne, Rel } from "@mikro-orm/core";
import { Course } from "./course.entity.js";
import { PurchaseRecord } from "./purchaseRecord.entity.js";

@Entity()
export class CoursePurchaseRecord extends PurchaseRecord {
  @ManyToOne(() => Course, { nullable: false })
  course!: Rel<Course>;
}
