# MERN Real-Time Human Chat

Local-only MERN chat platform with JWT authentication, MongoDB persistence, Express APIs, and Socket.IO realtime rooms.

## Structure

```text
root/
|-- api/
|-- ui/
`-- README.md
```

## Requirements

- Node.js 20+
- MongoDB running locally or an accessible MongoDB URI for local development

## Backend

```bash
cd api
npm install
npm run dev
```

The backend runs only on:

```text
http://localhost:5000
```

Backend configuration lives in `api/.env`:

```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/chatbot
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Frontend

```bash
cd ui
npm install
npm run dev
```

The frontend runs only on:

```text
http://localhost:5173
```

The frontend calls the local backend at:

```text
http://localhost:5000
```

## Features

- Email-only login and registration
- JWT protected routes and APIs
- Persistent auth state on refresh
- Realtime chat room creation
- Atomic room joins to prevent more than two participants
- Available and occupied room status sync
- Realtime messages, participant names, and typing indicators
- Disconnect cleanup for occupied rooms
- Helmet, CORS, rate limiting, validation, and centralized API errors
