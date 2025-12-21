import { Router } from 'express';

import {

  register,

  login,

  logout,

  changePassword,

} from '../controllers/authController';

import {

  validateRegistration,

  validateLogin,

  handleValidationErrors,

} from '../utils/validation';

import { authenticate } from '../middleware/auth';

 

const router = Router();

 

router.post('/register', validateRegistration, handleValidationErrors, register);

router.post('/login', validateLogin, handleValidationErrors, login);

router.post('/logout', authenticate, logout);

router.post('/change-password', changePassword);

 

export default router;