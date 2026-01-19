import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "./baseEntity.entity.js";
import { Level } from "./level.entity.js";

@Entity()
export class Unit extends BaseEntity {
  @Property({ nullable: false })
  name!: string;

  @Property({ nullable: false })
  order!: number;

  @Property({ length: 2000, nullable: false })
  content!: string;

  @ManyToOne(() => Level, { onDelete: "CASCADE" })
  level!: Rel<Level>;
}
