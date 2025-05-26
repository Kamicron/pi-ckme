import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { NationalityEthnicityDistribution } from './nationality-ethnicity-distribution.entity';

@Entity('nationality')
export class Nationality {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nameEn: string;

    @Column()
    nameFr: string;

    @OneToMany(() => NationalityEthnicityDistribution, distribution => distribution.nationality)
    distributions: NationalityEthnicityDistribution[];
}
