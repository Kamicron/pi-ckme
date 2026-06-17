import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { NicknameStyle as NicknameStyleEnum } from '../enums/nickname-style.enum';

@Entity('nickname_style')
@Index(['style', 'weight'])
export class NicknameStyle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NicknameStyleEnum,
  })
  style: NicknameStyleEnum;

  @Column({ type: 'int', default: 50 })
  weight: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  allowedPatterns: string[];

  @Column({ type: 'simple-json', nullable: true })
  preferredTransformations: string[];
}
