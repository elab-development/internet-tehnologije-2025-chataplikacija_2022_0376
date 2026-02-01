import { Router } from 'express';
import {
    register, login, logout, getMe,
    forgotPassword, resetPassword, changePassword,
    getAllUsers, updateUserStatus
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegistration, validateLogin, handleValidationErrors } from '../utils/validation';

const router = Router();

router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/admin/users', getAllUsers); 
router.patch('/admin/users/:id/status', updateUserStatus);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePassword);

export default router;