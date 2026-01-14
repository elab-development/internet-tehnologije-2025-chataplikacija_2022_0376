import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Conversation } from './Conversation';

@Entity({ name: 'conversation_participants' })
export class ConversationParticipant {
  @PrimaryColumn('uuid')
  userId!: string;

  @PrimaryColumn('uuid')
  conversationId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastReadAt!: Date | null;

  @Column({ type: 'boolean', default: false })
  isMuted!: boolean;

  @Column({ type: 'boolean', default: false })
  isPinned!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  joinedAt!: Date;

  // ================= RELATIONS =================

  @ManyToOne(
    () => User,
    (user: User) => user.participations,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(
    () => Conversation,
    (conversation: Conversation) => conversation.participants,
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'conversationId' })
  conversation!: Conversation;
}