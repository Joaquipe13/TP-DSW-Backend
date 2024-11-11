import {
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Collection,
  Rel,
  PrimaryKey,
} from "@mikro-orm/core";
import { BaseEntity } from "../shared/baseEntity.entity.js";
import { Level } from "./level.entity.js";
import { File } from "./file.entity.js";

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

  @OneToMany(() => File, (file) => file.unit)
  files = new Collection<File>(this);
}
