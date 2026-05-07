# Chat API

Production-oriented Express, MongoDB, JWT, and Socket.IO backend for the real-time chat platform.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Update `.env`:

   ```bash
   MONGO_URI=your_mongodb_connection_string
   ```

3. Start the API:

   ```bash
   npm run dev
   ```

The API runs locally on `http://localhost:5000`.

Production service:

```text
https://chatbot-api-sangeeth-santhosh.onrender.com
```

For Render, use the root `render.yaml` Blueprint and provide `MONGO_URI` when prompted.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/chats`
- `POST /api/chats`
- `GET /api/chats/:roomId/messages`
- `POST /api/chats/:roomId/messages`
