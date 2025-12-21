
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const userRepository = AppDataSource.getRepository(User);

        // Check if user exists
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Već imate profil.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        await userRepository.save(user);
        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            {
                expiresIn: process.env.JWT_EXPIRES_IN as any
            }
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

        // Find user
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Neispravan email ili lozinka' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Neispravan email ili lozinka' });
        }

        // Update online status
        user.isOnline = true;
        user.lastSeen = new Date();
        await userRepository.save(user);


        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            {
                expiresIn: process.env.JWT_EXPIRES_IN as any
            }
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

                status: user.status,

            },

        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


export const logout = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId; // pretpostavka da middleware ovde stavlja podatke
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

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({
                message: 'Na emailu koji ste uneli ne postoji registrovan profil.',
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await userRepository.save(user);
        res.json({ message: 'Lozinka uspešno promenjena.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};