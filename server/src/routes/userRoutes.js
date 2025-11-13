import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import { getUsers } from '../controllers/userController.js';

const router = express.Router();


// GET /users
router.route('/users').get(protect, getUsers)

export default router;
