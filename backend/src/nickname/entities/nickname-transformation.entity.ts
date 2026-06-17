import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { TransformationType } from '../enums/transformation-type.enum';

@Entity('nickname_transformation')
@Index(['type', 'weight'])
export class NicknameTransformation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TransformationType,
  })
  type: TransformationType;

  @Column({ type: 'int', default: 50 })
  weight: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  parameters: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  applicablePatterns: string[];
}
