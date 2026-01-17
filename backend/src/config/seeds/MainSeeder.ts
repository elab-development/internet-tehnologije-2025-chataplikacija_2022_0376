import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import UserSeeder from './UserSeeder';
import ChatSeeder from './ChatSeeder';

export default class MainSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        console.log('🌱 Starting database seeding...\n');

        // Pokreni seedere redom
        const userSeeder = new UserSeeder();
        await userSeeder.run(dataSource, factoryManager);

        const chatSeeder = new ChatSeeder();
        await chatSeeder.run(dataSource, factoryManager);

        console.log('\n🎉 Database seeding completed!');
    }
}