import { Response } from 'express';

import { AuthRequest } from '../middleware/auth';

import { AppDataSource } from '../config/database';

import { User } from '../entities/User';

 

export const getAllUsers = async (req: AuthRequest, res: Response) => {

  try {

    const currentUserId = req.user!.id;

    const userRepository = AppDataSource.getRepository(User);

 

    // Dobijanje svih korisnika osim trenutnog

    const users = await userRepository.find({

      where: {},

      select: ['id', 'email', 'firstName', 'lastName', 'isOnline', 'lastSeen', 'profilePicture'],

    });

 

    // Filtriranje trenutnog korisnika

    const filteredUsers = users.filter((user) => user.id !== currentUserId);

 

    res.json(filteredUsers);

  } catch (error) {

    console.error('Get users error:', error);

    res.status(500).json({ message: 'Server error' });

  }

};