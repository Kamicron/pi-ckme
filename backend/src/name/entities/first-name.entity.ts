import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Ethnicity } from '../../ethnicity/entities/ethnicity.entity';

@Entity('first_name')
export class FirstName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  ethnicityId: string;

  @Column()
  gender: 'male' | 'female';

  @ManyToOne(() => Ethnicity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ethnicityId' })
  ethnicity: Ethnicity;
}
