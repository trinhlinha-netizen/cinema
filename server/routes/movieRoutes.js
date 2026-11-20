import { Router } from 'express';
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} from '../controllers/movieController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { validateMoviePayload } from '../validators/member1Validator.js';

const router = Router();

// Public (Guest / Member)
router.get('/', getMovies);
router.get('/:id', getMovieById);

// Admin only
router.post('/', verifyToken, requireRole('admin'), validateMoviePayload, createMovie);
router.put('/:id', verifyToken, requireRole('admin'), validateMoviePayload, updateMovie);
router.delete('/:id', verifyToken, requireRole('admin'), deleteMovie);

export default router;
