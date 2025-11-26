import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from 'typeorm';

@Entity('users')
@Index('users_email_unique', ['email'], { unique: true })
@Index('users_is_superuser_idx', ['is_superuser'])
@Index('users_last_access_idx', ['last_access'])
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: number;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 128 })
  password!: string;

  @Column({ type: 'boolean', default: false })
  is_superuser!: boolean;

  @Column({ type: 'datetime', nullable: true })
  last_login?: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  last_access!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date;
}