import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../entities/User';
import { Chat, ChatType } from '../../entities/Chat'; // Uvezi ChatType ovde
import { ChatMembership } from '../../entities/ChatMembership';
import { Message, MessageType } from '../../entities/Message';

export default class ChatSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const userRepository = dataSource.getRepository(User);
        const chatRepository = dataSource.getRepository(Chat);
        const membershipRepository = dataSource.getRepository(ChatMembership);
        const messageRepository = dataSource.getRepository(Message);

        const users = await userRepository.find();
        const marko = users.find(u => u.email === 'marko@gmail.com');
        const ana = users.find(u => u.email === 'ana@gmail.com');

        if (!marko || !ana) return;

        // --- PRIVATNI CHAT ---
        // Koristimo ChatType.PRIVATE umesto 'private'
        const privateChat = chatRepository.create({
            type: ChatType.PRIVATE 
        });
        
        // Moramo sačekati da se chat sačuva da bismo dobili njegov ID
        const savedChat = await chatRepository.save(privateChat);

        // --- MEMBERSHIPS ---
        await membershipRepository.save([
            { chatId: savedChat.id, userId: marko.id },
            { chatId: savedChat.id, userId: ana.id },
        ]);

        // --- PORUKE ---
        await messageRepository.save([
            {
                chatId: savedChat.id,
                senderId: marko.id,
                content: 'Zdravo Ana!',
                type: MessageType.TEXT
            }
        ]);

        console.log('✅ Chat seeded successfully!');
    }
}