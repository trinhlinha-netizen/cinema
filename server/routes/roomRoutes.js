import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { validateRoomPayload } from '../validators/member1Validator.js';

const router = Router();

router.get('/', getRooms);
router.get('/:id', getRoomById);

router.post('/', verifyToken, requireRole('admin'), validateRoomPayload, createRoom);
router.put('/:id', verifyToken, requireRole('admin'), validateRoomPayload, updateRoom);
router.delete('/:id', verifyToken, requireRole('admin'), deleteRoom);

export default router;
