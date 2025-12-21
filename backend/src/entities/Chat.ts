import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Message } from './Message';
  import { ChatMembership } from './ChatMembership';
  
  export enum ChatType {
    PRIVATE = 'private',
    GROUP = 'group',
  }
  
  @Entity('chats')
  export class Chat {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column({
      type: 'enum',
      enum: ChatType,
    })
    type!: ChatType;
  
    @Column({ nullable: true })
    name?: string;
  
    @Column({ nullable: true })
    description?: string;
  
    @Column({ nullable: true })
    groupImage?: string;
  
    @OneToMany(() => Message, (message) => message.chat)
    messages!: Message[];
  
    @OneToMany(() => ChatMembership, (membership) => membership.chat)
    memberships!: ChatMembership[];
  
    @CreateDateColumn()
    createdAt!: Date;
  
    @UpdateDateColumn()
    updatedAt!: Date;
  }
  