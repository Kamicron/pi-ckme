import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('last_name')
export class LastName {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    ethnicityId: string;

    @ManyToOne('Ethnicity', 'lastNames')
    ethnicity: any;
}
