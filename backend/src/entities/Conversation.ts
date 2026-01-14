import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from './Message';
import { ConversationParticipant } from './ConversationParticipant';
import { User } from './User';

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.PRIVATE,
  })
  type!: ConversationType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl!: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  // ================= RELATIONS =================

  @OneToMany(
    () => Message,
    (message: Message) => message.conversation
  )
  messages!: Message[];

  @OneToMany(
    () => ConversationParticipant,
    (participant: ConversationParticipant) => participant.conversation
  )
  participants!: ConversationParticipant[];

  @ManyToMany(
    () => User,
    (user: User) => user.moderatedConversations
  )
  @JoinTable({
    name: 'conversation_moderators',
    joinColumn: {
      name: 'conversationId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
  })
  moderators!: User[];
}

