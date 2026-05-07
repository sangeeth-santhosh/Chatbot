# Chat API

Local Express, MongoDB, JWT, and Socket.IO backend for the real-time chat platform.

## Setup

```bash
npm install
npm run dev
```

The API runs only on:

```text
http://localhost:5000
```

## Environment

Create `api/.env` from `.env.example`:

```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/chatbot
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/chats`
- `POST /api/chats`
- `GET /api/chats/:roomId/messages`
- `POST /api/chats/:roomId/messages`
