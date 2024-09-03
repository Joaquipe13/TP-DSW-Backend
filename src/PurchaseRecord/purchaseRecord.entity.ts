import { Cascade, Entity, OneToMany, Property, DateTimeType, ManyToOne, Rel} from '@mikro-orm/core';
import {BaseEntity} from '../shared/baseEntity.entity.js';
import { User } from '../user/user.entity.js';
@Entity()
export abstract class PurchaseRecord extends BaseEntity {

    @Property()
    totalAmount!: number

    @Property({type: DateTimeType})
    purchaseAt = new Date()
    
    @ManyToOne(() => User, {
    nullable: false })
    user!: Rel<User> 
   
}