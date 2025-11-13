import express from 'express';
import { loginUser, registerUser } from '../controllers/authController.js';

const router = express.Router();
// import { protect } from '../middleware/authMiddleware.js';

// User Registration Route
router.route('/register').post(registerUser);
// User Login Route
router.route('/login').post(loginUser);



export default router;