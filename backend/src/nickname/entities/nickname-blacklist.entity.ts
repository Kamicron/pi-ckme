import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

export enum BlacklistSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('nickname_blacklist')
@Index(['pattern'])
@Index(['severity'])
export class NicknameBlacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pattern: string;

  @Column({
    type: 'enum',
    enum: BlacklistSeverity,
    default: BlacklistSeverity.MEDIUM,
  })
  severity: BlacklistSeverity;

  @Column({ default: true })
  isRegex: boolean;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'int', default: 0 })
  matchCount: number;
}
