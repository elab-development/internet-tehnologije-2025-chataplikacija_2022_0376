import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';
import { config } from 'dotenv';
import path from 'path';

// Učitaj env varijable
config();

// Kreiraj DataSource
const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'chatapp',
    entities: [path.join(__dirname, '../entities/*.{ts,js}')],
    synchronize: false,
});

async function seed() {
    try {
        console.log('📦 Connecting to database...');
        await AppDataSource.initialize();
        console.log('✅ Database connected!\n');

        await runSeeders(AppDataSource, {
            seeds: [path.join(__dirname, 'seeds/MainSeeder.{ts,js}')],
        });

        await AppDataSource.destroy();
        console.log('\n✅ Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();