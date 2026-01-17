import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.auth_token;

    // fallback na Authorization header
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Niste prijavljeni. Molimo prijavite se.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });

    if (!user) return res.status(401).json({ message: 'Korisnik nije pronađen' });

    if (user.status === UserStatus.SUSPENDED && user.suspendedUntil && new Date() < user.suspendedUntil) {
      return res.status(403).json({ message: 'Nalog je suspendovan', suspendedUntil: user.suspendedUntil });
    }

    if (user.status === UserStatus.BANNED) return res.status(403).json({ message: 'Nalog je banovan' });

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('auth_token');
    return res.status(401).json({ message: 'Sesija je istekla. Molimo prijavite se ponovo.' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Potrebna je prijava' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Nemate dozvolu za ovu akciju' });
    next();
  };
};
