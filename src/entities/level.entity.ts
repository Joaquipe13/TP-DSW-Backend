import {
  Entity,
  ManyToOne,
  Property,
  Collection,
  OneToMany,
  Rel,
  Cascade,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { Course } from "./course.entity.js";
import { Unit } from "./unit.entity.js";

@Entity()
export class Level extends BaseEntity {
  @Property({ nullable: false, unique: true })
  name!: string;

  @Property({ nullable: false, type: "text" })
  description!: string;

  @Property({ nullable: false })
  order!: number;

  @ManyToOne(() => Course, { nullable: false })
  course!: Rel<Course>;

  @OneToMany(() => Unit, (unit) => unit.level, { cascade: [Cascade.ALL] })
  units = new Collection<Unit>(this);
}
