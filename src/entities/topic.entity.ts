import {
  Cascade,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Collection,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/baseEntity.entity.js';
import { Course } from './index.js';

@Entity()
export class Topic extends BaseEntity {
  @Property({ nullable: false, unique: true })
  description!: string;

  @ManyToMany(() => Course, (course: Course) => course.topics, {})
  courses = new Collection<Course>(this);
}
