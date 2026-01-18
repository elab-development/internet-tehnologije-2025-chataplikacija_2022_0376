import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User, UserStatus } from '../entities/User';
import crypto from 'crypto';

// ✅ Cookie opcije - SECURE MORA BITI FALSE za localhost!
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('🍪 [COOKIE] Environment:', process.env.NODE_ENV);
  console.log('🍪 [COOKIE] Is production:', isProduction);
  
  const options = {
    httpOnly: false,
    secure: false, // ✅ UVEK FALSE za localhost developm ent
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dana
    path: '/',
  };
  
  console.log('🍪 [COOKIE] Options:', options);
  return options;
};

// Token generation
const signToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
};

// ---------------------- REGISTER ----------------------
export const register = async (req: Request, res: Response) => {
  try {
    console.log('📝 [REGISTER] Request received');
    console.log('📝 [REGISTER] Body:', {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    const { email, password, firstName, lastName, avatar } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ [REGISTER] User already exists:', email);
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
    console.log('✅ [REGISTER] User created:', user.id);

    // Generate token
    const token = signToken(user.id);
    console.log('🔑 [REGISTER] Token generated:', token.substring(0, 30) + '...');

    // Set cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);
    
    console.log('🍪 [REGISTER] Calling res.cookie() with:', {
      name: 'auth_token',
      token: token.substring(0, 30) + '...',
      options: cookieOptions
    });

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };

    console.log('✅ [REGISTER] Sending success response');

    res.status(201).json({
      message: 'Uspešno ste se registrovali!',
      user: userData,
    });

    // Log nakon slanja response-a
    console.log('📤 [REGISTER] Response sent, headers:', res.getHeaders());
  } catch (error: any) {
    console.error('❌ [REGISTER] Error:', error.message);
    console.error('❌ [REGISTER] Stack:', error.stack);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- LOGIN ----------------------
export const login = async (req: Request, res: Response) => {
  try {
    console.log('🔐 [LOGIN] Request received');
    console.log('🔐 [LOGIN] Email:', req.body.email);

    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      console.log('❌ [LOGIN] User not found:', email);
      return res.status(401).json({ message: 'Neispravan email ili lozinka' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ [LOGIN] Invalid password for:', email);
      return res.status(401).json({ message: 'Neispravan email ili lozinka' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await userRepo.save(user);
    console.log('✅ [LOGIN] User online status updated');

    // Generate token
    const token = signToken(user.id);
    console.log('🔑 [LOGIN] Token generated:', token.substring(0, 30) + '...');

    // Set cookie
    const cookieOptions = getCookieOptions();
    res.cookie('auth_token', token, cookieOptions);
    
    console.log('🍪 [LOGIN] Calling res.cookie() with:', {
      name: 'auth_token',
      token: token.substring(0, 30) + '...',
      options: cookieOptions
    });

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
      createdAt: user.createdAt,
    };

    console.log('✅ [LOGIN] Sending success response');

    res.json({
      message: 'Uspešno ste se prijavili!',
      user: userData,
    });

    console.log('📤 [LOGIN] Response sent, headers:', res.getHeaders());
  } catch (error: any) {
    console.error('❌ [LOGIN] Error:', error.message);
    console.error('❌ [LOGIN] Stack:', error.stack);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- LOGOUT ----------------------
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    console.log('👋 [LOGOUT] Request for user:', userId);

    if (userId) {
      const userRepo = AppDataSource.getRepository(User);
      await userRepo.update(userId, { isOnline: false, lastSeen: new Date() });
    }

    res.cookie('auth_token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });

    console.log('✅ [LOGOUT] Cookie cleared');

    res.json({ message: 'Uspešno ste se odjavili!' });
  } catch (error: any) {
    console.error('❌ [LOGOUT] Error:', error.message);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- GET ME ----------------------
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    console.log('👤 [GET ME] Request for user:', userId);

    if (!userId) {
      console.log('❌ [GET ME] No userId in request');
      return res.status(401).json({ message: 'Niste prijavljeni' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      console.log('❌ [GET ME] User not found:', userId);
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    console.log('✅ [GET ME] User found:', user.email);

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
  } catch (error: any) {
    console.error('❌ [GET ME] Error:', error.message);
    res.status(500).json({ message: 'Greška na serveru' });
  }
};

// ---------------------- FORGOT PASSWORD ----------------------
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return res.json({ message: 'Ako nalog postoji, link za resetovanje je poslat na vaš email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1h

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await userRepo.save(user);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log('🔗 Reset password link:', resetUrl);

    res.json({ message: 'Link za resetovanje lozinke je poslat na vaš email.' });
  } catch (error: any) {
    console.error('❌ [FORGOT PASSWORD] Error:', error.message);
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
  } catch (error: any) {
    console.error('❌ [RESET PASSWORD] Error:', error.message);
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
    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Trenutna lozinka nije tačna.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await userRepo.save(user);

    res.json({ message: 'Lozinka je uspešno promenjena.' });
  } catch (error: any) {
    console.error('❌ [CHANGE PASSWORD] Error:', error.message);
    res.status(500).json({ message: 'Greška na serveru' });
  }

};

// Dodaj ove funkcije na kraj authController.ts

// ---------------------- ADMIN: GET ALL USERS ----------------------
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    // Uzimamo sve korisnike, sortirane tako da admini budu na vrhu
    const users = await userRepo.find({
      order: { createdAt: 'DESC' }
    });

    // Mapiramo podatke da ne šaljemo lozinke
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      suspendedUntil: user.suspendedUntil,
      isOnline: user.isOnline,
      createdAt: user.createdAt
    }));

    res.json(safeUsers);
  } catch (error: any) {
    console.error('❌ [ADMIN GET USERS] Error:', error.message);
    res.status(500).json({ message: 'Greška pri učitavanju korisnika' });
  }
};

// ---------------------- ADMIN: UPDATE USER STATUS ----------------------
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, suspendedUntil, suspensionReason } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'Korisnik nije pronađen' });
    }

    // Sprečavamo da admin suspenduje samog sebe ili druge admine (opciono)
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Ne možete menjati status admin nalogu' });
    }

    user.status = status;
    user.suspendedUntil = suspendedUntil ? new Date(suspendedUntil) : undefined;
    user.suspensionReason = suspensionReason || null;

    await userRepo.save(user);

    res.json({ message: 'Status korisnika je ažuriran', user });
  } catch (error: any) {
    console.error('❌ [ADMIN UPDATE STATUS] Error:', error.message);
    res.status(500).json({ message: 'Greška pri ažuriranju statusa' });
  }
};
