import {
  createChat,
  createMessage,
  getMessages,
  joinChat,
  leaveChat,
  listChats,
} from '../services/chatService.js';

async function emitChats(io) {
  io.emit('chats:update', { chats: await listChats() });
}

function emitError(socket, error) {
  socket.emit('socket:error', {
    message: error.message || 'Something went wrong.',
    code: error.code || 'SOCKET_ERROR',
  });
}

export function registerChatSocket(io) {
  io.on('connection', async (socket) => {
    socket.emit('socket:ready', {
      user: socket.data.user.toSafeObject(),
    });
    socket.emit('chats:update', { chats: await listChats() });

    socket.on('create_chat', async (payload, ack) => {
      try {
        const chat = await createChat(socket.data.user._id, payload);
        socket.join(chat.id);
        socket.data.activeRooms.add(chat.id);
        await emitChats(io);
        ack?.({ ok: true, chat });
      } catch (error) {
        emitError(socket, error);
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on('join_chat', async (payload, ack) => {
      try {
        const chat = await joinChat(payload.roomId, socket.data.user._id);
        socket.join(chat.id);
        socket.data.activeRooms.add(chat.id);
        socket.to(chat.id).emit('participant:joined', {
          roomId: chat.id,
          user: socket.data.user.toSafeObject(),
        });
        await emitChats(io);
        ack?.({ ok: true, chat, messages: await getMessages(chat.id) });
      } catch (error) {
        emitError(socket, error);
        ack?.({ ok: false, error: error.message, code: error.code });
      }
    });

    socket.on('leave_chat', async (payload, ack) => {
      try {
        const roomId = payload.roomId;
        const chat = await leaveChat(roomId, socket.data.user._id);
        socket.leave(roomId);
        socket.data.activeRooms.delete(roomId);
        socket.to(roomId).emit('participant:left', {
          roomId,
          userId: socket.data.user._id.toString(),
        });
        await emitChats(io);
        ack?.({ ok: true, chat });
      } catch (error) {
        emitError(socket, error);
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const message = await createMessage(payload.roomId, socket.data.user._id, payload);
        io.to(payload.roomId).emit('message:new', { message });
        await emitChats(io);
        ack?.({ ok: true, message });
      } catch (error) {
        emitError(socket, error);
        ack?.({ ok: false, error: error.message });
      }
    });

    socket.on('typing_start', (payload) => {
      socket.to(payload.roomId).emit('typing:start', {
        roomId: payload.roomId,
        user: socket.data.user.toSafeObject(),
      });
    });

    socket.on('typing_stop', (payload) => {
      socket.to(payload.roomId).emit('typing:stop', {
        roomId: payload.roomId,
        userId: socket.data.user._id.toString(),
      });
    });

    socket.on('disconnect', async () => {
      const rooms = Array.from(socket.data.activeRooms || []);

      await Promise.all(
        rooms.map(async (roomId) => {
          await leaveChat(roomId, socket.data.user._id);
          socket.to(roomId).emit('participant:left', {
            roomId,
            userId: socket.data.user._id.toString(),
          });
        }),
      );

      await emitChats(io);
    });
  });
}
