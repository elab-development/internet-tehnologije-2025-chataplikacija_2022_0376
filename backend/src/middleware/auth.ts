import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import { AppDataSource } from '../config/database';

import { User, UserStatus } from '../entities/User';

 

export interface AuthRequest extends Request {

  user?: User;

}

 

export const authenticate = async (

  req: AuthRequest,

  res: Response,

  next: NextFunction

) => {

  try {

    const token = req.headers.authorization?.split(' ')[1];

 

    if (!token) {

      return res.status(401).json({ message: 'Authentication required' });

    }

 

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: decoded.userId } });

 

    if (!user) {

      return res.status(401).json({ message: 'User not found' });

    }

 

    if (user.status === UserStatus.SUSPENDED && user.suspendedUntil) {

      if (new Date() < user.suspendedUntil) {

        return res.status(403).json({

          message: 'Account suspended',

          suspendedUntil: user.suspendedUntil,

          reason: user.suspensionReason,

        });

      } else {

        // Suspension expired, reactivate

        user.status = UserStatus.ACTIVE;

        user.suspendedUntil = undefined;

        user.suspensionReason = undefined;

        await userRepository.save(user);

      }

    }

 

    if (user.status === UserStatus.BANNED) {

      return res.status(403).json({ message: 'Account banned' });

    }

 

    req.user = user;

    next();

  } catch (error) {

    return res.status(401).json({ message: 'Invalid token' });

  }

};

 

export const authorize = (...roles: string[]) => {

  return (req: AuthRequest, res: Response, next: NextFunction) => {

    if (!req.user) {

      return res.status(401).json({ message: 'Authentication required' });

    }

 

    if (!roles.includes(req.user.role)) {

      return res.status(403).json({ message: 'Insufficient permissions' });

    }

 

    next();

  };

};