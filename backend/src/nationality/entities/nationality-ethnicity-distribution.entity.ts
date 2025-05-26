import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('nationality_ethnicity_distribution')
export class NationalityEthnicityDistribution {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nationalityId: string;

    @Column()
    ethnicityId: string;

    @Column()
    percentage: number;

    @ManyToOne('Nationality', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'nationalityId', referencedColumnName: 'id' })
    nationality: any;

    @ManyToOne('Ethnicity', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ethnicityId', referencedColumnName: 'id' })
    ethnicity: any;
}
