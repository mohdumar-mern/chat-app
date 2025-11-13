import express from 'express'
import { protect } from '../middlewares/authMiddleware';
import Message from '../models/messageModel';
import Conversation from '../models/conversationModel';
const router = express.Router();


// GET /conversations/:id/messages
router.get('/:conversationId/messages', protect, async (req, res) => {
  const { conversationId } = req.params;
  const messages = await Message.find({ conversation: conversationId })
    .populate('sender', 'name email avatar')
    .sort('createdAt');
  res.json(messages);
});

export default router;