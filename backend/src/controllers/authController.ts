import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import crypto from 'crypto'; 

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Već imate profil.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        await userRepository.save(user);
        
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN as any }
        );

        res.status(201).json({
            message: 'Uspešno ste se registrovali!',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Neispravan email ili lozinka' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Neispravan email ili lozinka' });
        }

        user.isOnline = true;
        user.lastSeen = new Date();
        await userRepository.save(user);

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES_IN as any }
        );

        res.json({
            message: 'Uspešno ste ulogovani!',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId; 
        const userRepository = AppDataSource.getRepository(User);

        await userRepository.update(userId, {
            isOnline: false,
            lastSeen: new Date()
        });

        res.json({ message: 'Successfully logged out' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// RESET LOZINKE 
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Korisnik sa tim emailom ne postoji.' });
        }

        // Generisanje tokena koji traje npr. 1 sat
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1h od sada

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;
        await userRepository.save(user);

        // OVDE IDE SLANJE MEJLA 
        console.log(`Email poslat na ${email}. Token: ${resetToken}`);
        // Link koji šalješ: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

        res.json({ message: 'Link za resetovanje lozinke je poslat na vaš email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
};

//  Postavljanje nove lozinke
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({ 
            where: { 
                resetPasswordToken: token
            } 
        });

        if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
            return res.status(400).json({ message: 'Token je nevažeći ili je istekao.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined; 
        user.resetPasswordExpires = undefined;
        await userRepository.save(user);

        res.json({ message: 'Lozinka je uspešno promenjena.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId; 
        const { oldPassword, newPassword } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'Korisnik nije pronađen.' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Stara lozinka nije tačna.' });

        user.password = await bcrypt.hash(newPassword, 10);
        await userRepository.save(user);

        res.json({ message: 'Lozinka uspešno promenjena.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};