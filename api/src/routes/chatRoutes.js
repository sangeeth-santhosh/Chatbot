import { Router } from 'express';
import {
  createChatController,
  createMessageController,
  getChatsController,
  getMessagesController,
} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.route('/').get(getChatsController).post(createChatController);
router.route('/:roomId/messages').get(getMessagesController).post(createMessageController);

export default router;
