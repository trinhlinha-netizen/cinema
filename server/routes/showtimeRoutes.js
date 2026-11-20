import { Router } from 'express';
import {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  generateShowtimes,
  updateShowtime,
  deleteShowtime
} from '../controllers/showtimeController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { validateShowtimePayload } from '../validators/member1Validator.js';

const router = Router();

router.get('/', getShowtimes);
router.get('/:id', getShowtimeById);

router.post('/', verifyToken, requireRole('admin'), validateShowtimePayload, createShowtime);
router.post('/generate', verifyToken, requireRole('admin'), generateShowtimes);
router.put('/:id', verifyToken, requireRole('admin'), validateShowtimePayload, updateShowtime);
router.delete('/:id', verifyToken, requireRole('admin'), deleteShowtime);

export default router;
