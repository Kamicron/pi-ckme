import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { FragmentType } from '../enums/fragment-type.enum';

@Entity('nickname_fragment')
@Index(['type', 'weight'])
@Index(['language', 'type'])
export class NicknameFragment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  value: string;

  @Column({
    type: 'enum',
    enum: FragmentType,
    default: FragmentType.CORE,
  })
  type: FragmentType;

  @Column({ default: 'en' })
  language: string;

  @Column({ type: 'int', default: 50 })
  weight: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'int', default: 0 })
  usageCount: number;
}
