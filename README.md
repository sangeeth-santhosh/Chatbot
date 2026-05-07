# MERN Real-Time Human Chat

A production-oriented MERN chat platform with JWT authentication, MongoDB persistence, Express APIs, and Socket.IO realtime rooms.

## Structure

```text
root/
├── api/
├── ui/
└── README.md
```

## Requirements

- Node.js 20+
- MongoDB connection string

## Backend

```bash
cd api
npm install
```

Set the MongoDB URI in `api/.env`:

```bash
MONGO_URI=your_mongodb_connection_string
```

Start the API:

```bash
npm run dev
```

The backend runs locally on `http://localhost:5000`.

Production API URL:

```text
https://chatbot-api-sangeeth-santhosh.onrender.com
```

## Frontend

```bash
cd ui
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

## GitHub Pages

The production frontend is built from `ui/` into the root `docs/` folder.
Configure GitHub Pages to deploy from `main` branch and `/docs` folder.

Live URL:

```text
https://sangeeth-santhosh.github.io/Chatbot/
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

## Environment

Backend configuration lives in `api/.env`.

```bash
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=local_chat_platform_jwt_secret_8f3f6c5a0b2d49d4
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Optional frontend overrides:

```bash
VITE_API_URL=https://chatbot-api-sangeeth-santhosh.onrender.com/api
VITE_SOCKET_URL=https://chatbot-api-sangeeth-santhosh.onrender.com
```

## Render Backend Deployment

The root `render.yaml` defines the production backend service. Create a Render Blueprint from this repository and provide:

```text
MONGO_URI=your_mongodb_connection_string
```

Render generates `JWT_SECRET` automatically and deploys the API from `api/`.
