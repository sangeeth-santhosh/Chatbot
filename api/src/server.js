import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDatabase } from './config/db.js';
import env from './config/env.js';
import { socketAuth } from './socket/authSocket.js';
import { registerChatSocket } from './socket/chatSocket.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrls,
    credentials: true,
  },
});

io.use(socketAuth);
registerChatSocket(io);
app.set('io', io);

async function start() {
  await connectDatabase();

  server.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API:', error.message);
  process.exit(1);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
