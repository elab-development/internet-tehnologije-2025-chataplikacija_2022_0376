// routes/authRoutes.ts
import { Router } from 'express';
import {
    register,
    login,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    changePassword,
    getAllUsers,        // ✅ Dodato
    updateUserStatus,   // ✅ Dodato
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegistration, validateLogin, handleValidationErrors } from '../utils/validation';

const router = Router();

// Javne rute
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Zaštićene rute
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePassword);

// ✅ Admin rute
router.get('/users', authenticate, getAllUsers);
router.post('/users/status', authenticate, updateUserStatus);

export default router;