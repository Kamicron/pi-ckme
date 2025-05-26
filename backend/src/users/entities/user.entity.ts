import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  accessToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  password: string;
}
