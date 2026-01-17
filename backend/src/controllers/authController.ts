import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';
import crypto from 'crypto';

// Cookie opcije
// Cookie opcije
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'lax' | 'none' | 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dana
  path: '/',
};
// Token
const signToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

// ---------------------- REGISTER ----------------------
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, avatar } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Već imate profil sa ovom email adresom.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = userRepo.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      avatar: avatar || null,
    });

    await userRepo.save(user);

    const token = signToken(user.id);
    res.cookie('auth_token', token, cookieOptions);

    res.status(201).json({
      message: 'Uspešno ste se registrovali!',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- LOGIN ----------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Neispravan email ili lozinka' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: 'Neispravan email ili lozinka' });

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await userRepo.save(user);

    const token = signToken(user.id);
    res.cookie('auth_token', token, cookieOptions);

    res.json({
      message: 'Uspešno ste se prijavili!',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- LOGOUT ----------------------
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (userId) {
      const userRepo = AppDataSource.getRepository(User);
      await userRepo.update(userId, { isOnline: false, lastSeen: new Date() });
    }

    res.cookie('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });

    res.json({ message: 'Uspešno ste se odjavili!' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- GET ME ----------------------
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ message: 'Niste prijavljeni' });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
        isOnline: user.isOnline,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- FORGOT PASSWORD ----------------------
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) return res.json({ message: 'Ako nalog postoji, link za resetovanje je poslat na vaš email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1h

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await userRepo.save(user);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('Reset password link:', resetUrl);

    res.json({ message: 'Link za resetovanje lozinke je poslat na vaš email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- RESET PASSWORD ----------------------
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { resetPasswordToken: token } });

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Token je nevažeći ili je istekao.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await userRepo.save(user);

    res.json({ message: 'Lozinka je uspešno promenjena. Možete se prijaviti.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- CHANGE PASSWORD ----------------------
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Trenutna lozinka nije tačna.' });

    user.password = await bcrypt.hash(newPassword, 12);
    await userRepo.save(user);

    res.json({ message: 'Lozinka je uspešno promenjena.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};
