import { Router } from 'express';
import {
  createChatController,
  getChatController,
  getMessagesController,
  listChatsController,
  markChatReadController,
} from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.route('/').get(listChatsController).post(createChatController);
router.get('/:chatId', getChatController);
router.get('/:chatId/messages', getMessagesController);
router.put('/:chatId/read', markChatReadController);

export default router;
