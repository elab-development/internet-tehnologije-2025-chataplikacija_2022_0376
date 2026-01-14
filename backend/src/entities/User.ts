import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Message } from './Message';
import { MessageReport } from './MessageReport';
import { ConversationParticipant } from './ConversationParticipant';
import { Conversation } from './Conversation';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  username!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: false })
  isSuspended!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  suspensionEndDate!: Date | null;

  @Column({ type: 'text', nullable: true })
  suspensionReason!: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  isOnline!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // ================= RELATIONS =================

  @OneToMany(
    () => Message,
    (message: Message) => message.sender
  )
  messages!: Message[];

  @OneToMany(
    () => MessageReport,
    (report: MessageReport) => report.reporter
  )
  reportsMade!: MessageReport[];

  @OneToMany(
    () => MessageReport,
    (report: MessageReport) => report.reviewer
  )
  reportsReviewed!: MessageReport[];

  @OneToMany(
    () => ConversationParticipant,
    (participant: ConversationParticipant) => participant.user
  )
  participations!: ConversationParticipant[];

  @ManyToMany(
    () => Conversation,
    (conversation: Conversation) => conversation.moderators
  )
  moderatedConversations!: Conversation[];

  // ================= HELPERS =================

  get isActivelySuspended(): boolean {
    if (!this.isSuspended) return false;
    if (!this.suspensionEndDate) return true;
    return new Date() < this.suspensionEndDate;
  }

  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}