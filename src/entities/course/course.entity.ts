import {
  Cascade,
  Entity,
  OneToMany,
  Property,
  Collection,
  DateTimeType,
  ManyToMany,
  Rel,
  ManyToOne,
} from "@mikro-orm/core";
import { BaseEntity } from "./../../shared/baseEntity.entity.js";
import { CoursePurchaseRecord } from "./../coursePurchaseRecord/coursePurchaseRecord.entity.js";
import { Topic } from "./../topic/topic.entity.js";
import { Level } from "./../level/level.entity.js";
@Entity()
export class Course extends BaseEntity {
  @Property({ nullable: false, unique: true })
  title!: string;
  @Property({ type: DateTimeType })
  createAt = new Date();
  @Property({ nullable: false })
  price!: number;
  @OneToMany(
    () => CoursePurchaseRecord,
    (coursePurchaseRecord) => coursePurchaseRecord.course,
    {
      cascade: [Cascade.ALL],
      nullable: true,
    }
  )
  coursePurchaseRecords? = new Collection<CoursePurchaseRecord>(this);
  @ManyToMany(() => Topic, (topic) => topic.courses, {
    cascade: [Cascade.ALL],
    owner: true,
  })
  topics = new Collection<Topic>(this);
  @OneToMany(() => Level, (level) => level.course, {
    cascade: [Cascade.ALL],
    nullable: true,
  })
  levels? = new Collection<Level>(this);
}