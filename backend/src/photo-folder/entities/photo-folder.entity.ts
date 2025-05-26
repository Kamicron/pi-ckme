import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Ethnicity } from '../../ethnicity/entities/ethnicity.entity';

@Entity('photo_folder')
export class PhotoFolder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    folderId: string;

    @Column()
    gender: string;

    @Column()
    ageGroup: string;

    @Column({ nullable: true })
    ethnicityId: string;

    @ManyToOne('Ethnicity', 'photoFolders')
    ethnicity: any;
}
