import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User, UserRole, UserStatus } from '../../entities/User';
import bcrypt from 'bcryptjs';

export default class UserSeeder implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const userRepository = dataSource.getRepository(User);

        // 1. Provera da li već postoje korisnici da ne bi duplirali podatke
        const existingUsers = await userRepository.count();
        if (existingUsers > 0) {
            console.log('⏭️  Users already exist, skipping...');
            return;
        }

        // 2. Hash-ovanje šifre (bolje jednom ovde nego u petlji)
        const hashedPassword = await bcrypt.hash('password123', 12);

        // 3. Kreiranje niza korisnika koristeći UserRole enum
        const users = [
            {
                email: 'marko@gmail.com',
                password: hashedPassword,
                firstName: 'Marko',
                lastName: 'Petrović',
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                isOnline: false,
            },
            {
                email: 'ana@gmail.com',
                password: hashedPassword,
                firstName: 'Ana',
                lastName: 'Jovanović',
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                isOnline: false,
            },
            {
                email: 'petar@gmail.com',
                password: hashedPassword,
                firstName: 'Petar',
                lastName: 'Nikolić',
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                isOnline: false,
            },
            {
                email: 'admin@gmail.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'Adminović',
                role: UserRole.ADMIN,
                status: UserStatus.ACTIVE,
                isOnline: false,
            },
            {
                email: 'jovana@gmail.com',
                password: hashedPassword,
                firstName: 'Jovana',
                lastName: 'Marković',
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                isOnline: false,
            },
        ];

        // 4. Čuvanje u bazu
        try {
            await userRepository.save(users);
            console.log('✅ Users seeded successfully!');
        } catch (error) {
            console.error('❌ Error seeding users:', error);
        }
    }
}