import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { NotFoundError } from '../middleware/error.middleware';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.find({
        select: ['id', 'email', 'username', 'role', 'isOnline', 'avatarUrl', 'createdAt'],
      });

      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  };

  getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({
        where: { id },
        select: ['id', 'email', 'username', 'role', 'isOnline', 'avatarUrl', 'createdAt'],
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.status(200).json({ user });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch user' });
      }
    }
  };

  searchUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const users = await this.userRepository
        .createQueryBuilder('user')
        .select(['user.id', 'user.username', 'user.email', 'user.avatarUrl', 'user.isOnline'])
        .where('LOWER(user.username) LIKE LOWER(:query)', {
          query: `%${query}%`,
        })
        .orWhere('LOWER(user.email) LIKE LOWER(:query)', {
          query: `%${query}%`,
        })
        .take(20)
        .getMany();

      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ error: 'Failed to search users' });
    }
  };

  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { username, avatarUrl } = req.body;

      const user = await this.userRepository.findOne({
        where: { id: req.userId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (username) {
        user.username = username;
      }

      if (avatarUrl !== undefined) {
        user.avatarUrl = avatarUrl;
      }

      await this.userRepository.save(user);

      res.status(200).json({
        message: 'Profile updated successfully',
        user: user.toJSON(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update profile' });
      }
    }
  };

  updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new password are required' });
        return;
      }

      const user = await this.userRepository.findOne({
        where: { id: req.userId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await this.userRepository.save(user);

      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update password' });
      }
    }
  };
}