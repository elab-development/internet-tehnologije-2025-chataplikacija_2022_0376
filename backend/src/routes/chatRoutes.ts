import { Router } from 'express';
import {
  createPrivateChat,
  createGroupChat,
  getUserChats,
  getChatById, 
  removeMemberFromGroup,
} from '../controllers/chatController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Sve rute ispod ove linije zahtevaju da korisnik bude ulogovan
router.use(authenticate);

// Putanja: GET /api/chats/ (Lista svih chatova korisnika)
router.get('/', getUserChats);

// Putanja: GET /api/chats/:id (Detalji jednog konkretnog chata)
// VAŽNO: Ova ruta mora biti OVDE da ne bi Express pomešao ':id' sa rečima 'private' ili 'group'
router.get('/:id', getChatById);

// Putanja: POST /api/chats/private
router.post('/private', createPrivateChat);

// Putanja: POST /api/chats/group
router.post('/group', createGroupChat);

// Putanja: DELETE /api/chats/group/member
router.delete('/group/member', authorize('moderator', 'admin'), removeMemberFromGroup);

export default router;