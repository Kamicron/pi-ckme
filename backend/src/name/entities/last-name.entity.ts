import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Ethnicity } from '../../ethnicity/entities/ethnicity.entity';

@Entity('last_name')
export class LastName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  ethnicityId: string;

  @ManyToOne(() => Ethnicity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ethnicityId' })
  ethnicity: Ethnicity;
}
