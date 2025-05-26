import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Ethnicity } from '../../ethnicity/entities/ethnicity.entity';

@Entity('first_name')
export class FirstName {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    gender: string;

    @Column({ nullable: true })
    ethnicityId: string;

    @ManyToOne('Ethnicity', 'firstNames')
    ethnicity: any;
}
