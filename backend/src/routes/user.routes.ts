import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticateToken);

router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.updatePassword);

export default router;

 