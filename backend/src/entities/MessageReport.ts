import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './Message';
import { User } from './User';

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  VIOLENCE = 'violence',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Entity({ name: 'message_reports' })
export class MessageReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ReportReason,
    default: ReportReason.OTHER,
  })
  reason!: ReportReason;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status!: ReportStatus;

  @Column({ type: 'uuid' })
  messageId!: string;

  @Column({ type: 'uuid' })
  reporterId!: string;

  @Column({ type: 'uuid', nullable: true })
  reviewerId!: string | null;

  @Column({ type: 'text', nullable: true })
  reviewComment!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // ================= RELATIONS =================

  @ManyToOne(
    () => Message,
    (message: Message) => message.reports,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'messageId' })
  message!: Message;

  @ManyToOne(
    () => User,
    (user: User) => user.reportsMade,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'reporterId' })
  reporter!: User;

  @ManyToOne(
    () => User,
    (user: User) => user.reportsReviewed,
    { onDelete: 'SET NULL' }
  )
  @JoinColumn({ name: 'reviewerId' })
  reviewer!: User | null;
}