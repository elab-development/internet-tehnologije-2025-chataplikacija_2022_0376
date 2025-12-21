import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from './User';
  import { Chat } from './Chat';
  
  export enum MemberRole {
    MEMBER = 'member',
    MODERATOR = 'moderator',
    ADMIN = 'admin',
  }
  
  @Entity('chat_memberships')
  export class ChatMembership {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @ManyToOne(() => User, (user) => user.chatMemberships)
    @JoinColumn({ name: 'userId' })
    user!: User;
  
    @Column()
    userId!: string;
  
    @ManyToOne(() => Chat, (chat) => chat.memberships)
    @JoinColumn({ name: 'chatId' })
    chat!: Chat;
  
    @Column()
    chatId!: string;
  
    @Column({
      type: 'enum',
      enum: MemberRole,
      default: MemberRole.MEMBER,
    })
    role!: MemberRole;
  
    @Column({ default: false })
    isMuted!: boolean;
  
    @CreateDateColumn()
    joinedAt!: Date;
  }
  