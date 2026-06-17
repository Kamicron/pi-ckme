import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { PatternType } from '../enums/pattern-type.enum';
import { NicknameStyle } from './nickname-style.entity';

@Entity('nickname_pattern')
@Index(['patternType', 'weight'])
@Index(['styleId'])
export class NicknamePattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: PatternType,
  })
  patternType: PatternType;

  @Column({ type: 'uuid', nullable: true })
  styleId: string;

  @ManyToOne(() => NicknameStyle, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'styleId' })
  style: NicknameStyle;

  @Column({ type: 'int', default: 50 })
  weight: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-json', nullable: true })
  minLengthByPart: number[];

  @Column({ type: 'simple-json', nullable: true })
  maxLengthByPart: number[];

  @Column({ type: 'text', nullable: true })
  description: string;
}
