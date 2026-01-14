import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './User';
import { Conversation } from './Conversation';
import { MessageReport } from './MessageReport';

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
}

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type!: MessageType;

  @Column({ type: 'text', nullable: true })
  fileUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  fileName!: string | null;

  @Column({ type: 'bigint', nullable: true })
  fileSize!: number | null;

  @Column({ type: 'boolean', default: false })
  isEdited!: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted!: boolean;

  @Column({ type: 'boolean', default: false })
  isPinned!: boolean;

  @Column({ type: 'uuid' })
  senderId!: string;

  @Column({ type: 'uuid' })
  conversationId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  editedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // ================= RELATIONS =================

  @ManyToOne(
    () => User,
    (user: User) => user.messages,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @ManyToOne(
    () => Conversation,
    (conversation: Conversation) => conversation.messages,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;

  @OneToMany(
    () => MessageReport,
    (report: MessageReport) => report.message
  )
  reports!: MessageReport[];
}