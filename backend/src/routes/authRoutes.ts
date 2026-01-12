import { Router } from 'express';
import {
  register,
  login,
  logout,
  changePassword,
  forgotPassword, // Dodajemo ovo
  resetPassword,  // Dodajemo ovo
} from '../controllers/authController';
import {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} from '../utils/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Javne rute (ne zahtevaju login)
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);

// Rute za oporavak lozinke (takođe javne)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Zaštićene rute (zahtevaju login)
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, changePassword);

export default router;