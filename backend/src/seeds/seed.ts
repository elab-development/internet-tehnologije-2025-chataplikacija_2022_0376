import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { Conversation, ConversationType } from '../entities/Conversation';
import { ConversationParticipant } from '../entities/ConversationParticipant';
import { Message, MessageType } from '../entities/Message';
import { hashPassword } from '../utils/password.util';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    // Clear existing data
    await AppDataSource.query('TRUNCATE users, conversations, messages, conversation_participants, message_reports CASCADE');
    console.log('🗑️  Cleared existing data');

    const userRepository = AppDataSource.getRepository(User);
    const conversationRepository = AppDataSource.getRepository(Conversation);
    const participantRepository = AppDataSource.getRepository(ConversationParticipant);
    const messageRepository = AppDataSource.getRepository(Message);

    // Create Users
    console.log('👥 Creating users...');
    
    const admin = userRepository.create({
      email: 'admin@chat.com',
      username: 'Admin',
      password: await hashPassword('Admin123!'),
      role: UserRole.ADMIN,
      isOnline: true,
    });
    await userRepository.save(admin);

    const moderator = userRepository.create({
      email: 'moderator@chat.com',
      username: 'Moderator',
      password: await hashPassword('Mod123!'),
      role: UserRole.MODERATOR,
      isOnline: true,
    });
    await userRepository.save(moderator);

    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = userRepository.create({
        email: `user${i}@chat.com`,
        username: `User${i}`,
        password: await hashPassword('User123!'),
        role: UserRole.USER,
        isOnline: i % 2 === 0,
      });
      await userRepository.save(user);
      users.push(user);
    }

    console.log(`✅ Created ${users.length + 2} users`);

    // Create Private Conversations
    console.log('💬 Creating private conversations...');
    
    const privateConv1 = conversationRepository.create({
      type: ConversationType.PRIVATE,
      createdBy: users[0].id,
    });
    await conversationRepository.save(privateConv1);

    await participantRepository.save([
      participantRepository.create({
        userId: users[0].id,
        conversationId: privateConv1.id,
      }),
      participantRepository.create({
        userId: users[1].id,
        conversationId: privateConv1.id,
      }),
    ]);

    // Create messages for private conversation
    const messages1 = [
      messageRepository.create({
        content: 'Hey! How are you?',
        senderId: users[0].id,
        conversationId: privateConv1.id,
        type: MessageType.TEXT,
      }),
      messageRepository.create({
        content: 'I\'m doing great! Thanks for asking.',
        senderId: users[1].id,
        conversationId: privateConv1.id,
        type: MessageType.TEXT,
      }),
      messageRepository.create({
        content: 'Want to grab coffee later?',
        senderId: users[0].id,
        conversationId: privateConv1.id,
        type: MessageType.TEXT,
      }),
    ];
    await messageRepository.save(messages1);

    // Create Group Conversation
    console.log('👥 Creating group conversation...');
    
    const groupConv = conversationRepository.create({
      type: ConversationType.GROUP,
      name: 'Team Chat',
      description: 'Main team discussion group',
      createdBy: admin.id,
    });
    await conversationRepository.save(groupConv);

    const groupParticipants = [admin, moderator, ...users.slice(0, 3)].map(
      (user) =>
        participantRepository.create({
          userId: user.id,
          conversationId: groupConv.id,
        })
    );
    await participantRepository.save(groupParticipants);

    // Create messages for group conversation
    const groupMessages = [
      messageRepository.create({
        content: 'Welcome everyone to the team chat!',
        senderId: admin.id,
        conversationId: groupConv.id,
        type: MessageType.TEXT,
      }),
      messageRepository.create({
        content: 'Thanks! Happy to be here.',
        senderId: users[0].id,
        conversationId: groupConv.id,
        type: MessageType.TEXT,
      }),
      messageRepository.create({
        content: 'Let\'s make this a great collaboration!',
        senderId: moderator.id,
        conversationId: groupConv.id,
        type: MessageType.TEXT,
      }),
      messageRepository.create({
        content: 'Agreed! Looking forward to working with everyone.',
        senderId: users[1].id,
        conversationId: groupConv.id,
        type: MessageType.TEXT,
      }),
    ];
    await messageRepository.save(groupMessages);

    // Create another group
    const projectGroup = conversationRepository.create({
      type: ConversationType.GROUP,
      name: 'Project Alpha',
      description: 'Discussion for Project Alpha',
      createdBy: moderator.id,
    });
    await conversationRepository.save(projectGroup);

    const projectParticipants = [moderator, ...users.slice(2, 5)].map(
      (user) =>
        participantRepository.create({
          userId: user.id,
          conversationId: projectGroup.id,
        })
    );
    await participantRepository.save(projectParticipants);

    const projectMessages = [
      messageRepository.create({
        content: 'Let\'s discuss the project timeline.',
        senderId: moderator.id,
        conversationId: projectGroup.id,
        type: MessageType.TEXT,
      }),
      messageRepository.create({
        content: 'I think we can complete phase 1 by next week.',
        senderId: users[2].id,
        conversationId: projectGroup.id,
        type: MessageType.TEXT,
      }),
    ];
    await messageRepository.save(projectMessages);

    console.log('✅ Created 3 conversations with messages');

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👥 Users: ${users.length + 2} (1 admin, 1 moderator, ${users.length} regular users)`);
    console.log(`   💬 Conversations: 3 (1 private, 2 groups)`);
    console.log(`   📝 Messages: ${messages1.length + groupMessages.length + projectMessages.length}`);
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@chat.com / Admin123!');
    console.log('   Moderator: moderator@chat.com / Mod123!');
    console.log('   Users: user1@chat.com to user5@chat.com / User123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

// Run seeder
seed()
  .then(() => {
    console.log('\n✅ Seeder completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  });