import { AppDataSource } from '../config/database';
import { User, UserRole } from '../entities/User';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateTokenPair } from '../utils/jwt.util';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create new user
    const user = this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      username: data.username,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if suspended
    if (user.isActivelySuspended) {
      throw new Error(`Account suspended until ${user.suspensionEndDate}`);
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update online status
    user.isOnline = true;
    user.lastSeenAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, tokens };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.isOnline = false;
      user.lastSeenAt = new Date();
      await this.userRepository.save(user);
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}