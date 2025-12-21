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
import { Chat } from './Chat';
import { MessageReport } from './MessageReport';

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  GIF = 'gif',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.sentMessages)
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @Column()
  senderId!: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chatId' })
  chat!: Chat;

  @Column()
  chatId!: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  type!: MessageType;

  @Column('text')
  content!: string;

  @Column({ nullable: true })
  fileUrl?: string;

  @Column({ nullable: true })
  fileName?: string;

  @Column({ default: false })
  isEdited!: boolean;

  @Column({ default: false })
  isDeleted!: boolean;

  @OneToMany(() => MessageReport, (report) => report.message)
  reports!: MessageReport[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
