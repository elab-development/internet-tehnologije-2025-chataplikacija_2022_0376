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
    OTHER = 'other',
  }
  
  export enum ReportStatus {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    RESOLVED = 'resolved',
    DISMISSED = 'dismissed',
  }
  
  @Entity('message_reports')
  export class MessageReport {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @ManyToOne(() => Message, (message) => message.reports)
    @JoinColumn({ name: 'messageId' })
    message!: Message;
  
    @Column()
    messageId!: string;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'reporterId' })
    reporter!: User;
  
    @Column()
    reporterId!: string;
  
    @Column({
      type: 'enum',
      enum: ReportReason,
    })
    reason!: ReportReason;
  
    @Column('text', { nullable: true })
    additionalComment?: string;
  
    @Column({
      type: 'enum',
      enum: ReportStatus,
      default: ReportStatus.PENDING,
    })
    status!: ReportStatus;
  
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'reviewedById' })
    reviewedBy?: User;
  
    @Column({ nullable: true })
    reviewedById?: string;
  
    @Column({ nullable: true })
    reviewNotes?: string;
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }
  