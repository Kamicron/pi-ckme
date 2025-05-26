import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('ethnicity')
export class Ethnicity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    codeKey: string;

    @Column()
    nameEn: string;

    @Column()
    nameFr: string;

    @OneToMany('FirstName', 'ethnicity')
    firstNames: any[];

    @OneToMany('LastName', 'ethnicity')
    lastNames: any[];

    @OneToMany('Nationality', 'ethnicity')
    nationalities: any[];

    @OneToMany('PhotoFolder', 'ethnicity')
    photoFolders: any[];
}
