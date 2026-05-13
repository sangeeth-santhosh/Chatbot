import {
  createChat,
  createMessage,
  getAdminChats,
  getChatById,
  getMessages,
  getUserChats,
  markChatAsRead,
} from '../services/chatService.js';

async function emitAdminUpdate(io) {
  const chats = await getAdminChats();
  io.to('admin').emit('chat_updated', { chats });
}

async function emitUserUpdate(io, userId) {
  const chats = await getUserChats(userId);
  io.to(`user:${userId}`).emit('chat_updated', { chats });
}

async function markActiveRecipientRead(io, chatId, sender, chat) {
  const activeSockets = await io.in(`chat:${chatId}`).fetchSockets();

  if (sender.role === 'user') {
    const activeAdmin = activeSockets.find((activeSocket) => activeSocket.data.user?.role === 'admin');
    if (activeAdmin?.data.user) {
      await markChatAsRead(chatId, activeAdmin.data.user);
    }

    return;
  }

  const activeUser = activeSockets.find((activeSocket) => (
    activeSocket.data.user?.role === 'user'
    && activeSocket.data.user._id.toString() === chat.userId
  ));

  if (activeUser?.data.user) {
    await markChatAsRead(chatId, activeUser.data.user);
  }
}

function emitError(socket, error) {
  socket.emit('socket:error', {
    message: error.message || 'Something went wrong.',
    code: error.code || 'SOCKET_ERROR',
  });
}

async function emitInitialChats(socket, user) {
  if (user.role === 'admin') {
    const chats = await getAdminChats();
    socket.emit('chat_updated', { chats });
    return;
  }

  const chats = await getUserChats(user._id);
  socket.emit('chat_updated', { chats });
}

export function registerChatSocket(io) {
  io.on('connection', async (socket) => {
    const user = socket.data.user;
    const personalChannel = user.role === 'admin' ? 'admin' : `user:${user._id.toString()}`;

    socket.join(personalChannel);
    io.to('admin').emit('user_online', {
      userId: user._id.toString(),
      userName: user.name,
      role: user.role,
    });

    socket.emit('socket:ready', {
      user: user.toSafeObject(),
    });

    emitInitialChats(socket, user).catch((error) => emitError(socket, error));

    socket.on('create_chat', async (payload, ack) => {
      try {
        const chat = await createChat(user._id, payload);
        socket.data.activeChat = chat.id;
        socket.join(`chat:${chat.id}`);
        await emitAdminUpdate(io);
        await emitUserUpdate(io, user._id.toString());
        const messages = [];
        ack?.({ ok: true, chat, messages });
      } catch (error) {
        emitError(socket, error);
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on('select_chat', async (payload, ack) => {
      try {
        const chatId = payload.chatId;
        const chat = await getChatById(chatId, user);
        const messages = await getMessages(chatId, user);

        await markChatAsRead(chatId, user);

        if (socket.data.activeChat && socket.data.activeChat !== chatId) {
          socket.leave(`chat:${socket.data.activeChat}`);
        }
        socket.data.activeChat = chatId;
        socket.join(`chat:${chatId}`);

        if (user.role === 'admin') {
          await emitAdminUpdate(io);
        } else {
          await emitUserUpdate(io, user._id.toString());
        }

        ack?.({ ok: true, chat, messages });
      } catch (error) {
        emitError(socket, error);
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const chatId = payload.chatId;
        const message = await createMessage(chatId, user, payload);

        io.to(`chat:${chatId}`).emit('receive_message', { message });

        const chat = await getChatById(chatId);
        await markActiveRecipientRead(io, chatId, user, chat);

        if (user.role === 'admin') {
          await emitAdminUpdate(io);
          await emitUserUpdate(io, chat.userId);
        } else {
          await emitUserUpdate(io, user._id.toString());
          await emitAdminUpdate(io);
        }

        ack?.({ ok: true, message });
      } catch (error) {
        emitError(socket, error);
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on('typing_start', (payload) => {
      const chatId = payload.chatId;
      socket.to(`chat:${chatId}`).emit('typing_start', {
        chatId,
        user: user.toSafeObject(),
      });
    });

    socket.on('typing_stop', (payload) => {
      const chatId = payload.chatId;
      socket.to(`chat:${chatId}`).emit('typing_stop', {
        chatId,
        userId: user._id.toString(),
      });
    });

    socket.on('disconnect', async () => {
      io.to('admin').emit('user_offline', {
        userId: user._id.toString(),
        userName: user.name,
        role: user.role,
      });

      socket.to(`user:${user._id.toString()}`).emit('user_offline', {
        userId: user._id.toString(),
        userName: user.name,
        role: user.role,
      });
    });
  });
}
