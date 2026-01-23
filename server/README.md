# Zenj Chat Server

Backend server for the Zenj Chat application built with Express.js, TypeScript, and MongoDB.

## Features

- User authentication with JWT
- Real-time messaging with Socket.IO
- Contact management
- Group chat support
- Message reactions and status tracking
- User profiles and settings
- Moment/Status feature with auto-deletion after 24 hours

## Prerequisites

- Node.js 18+
- MongoDB 5+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/zenj-chat
JWT_SECRET=your-secret-key-change-in-production
GOOGLE_API_KEY=your-google-api-key
CORS_ORIGIN=http://localhost:5173
```

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Building

Build the TypeScript project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Chat
- `GET /api/chat/:contactId` - Get messages for a contact
- `POST /api/chat/:contactId` - Send a message
- `PATCH /api/chat/:messageId/react` - React to a message
- `PATCH /api/chat/:messageId/read` - Mark message as read

### Contacts
- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Create new contact
- `PATCH /api/contacts/:contactId` - Update contact
- `DELETE /api/contacts/:contactId` - Delete contact
- `POST /api/contacts/group/create` - Create a group

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update user profile
- `GET /api/profile/moments/all` - Get all moments
- `POST /api/profile/moments/add` - Add a new moment

## WebSocket Events

- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `typing` - User is typing
- `stop-typing` - User stopped typing

## Architecture

```
server/
├── src/
│   ├── routes/          # API route handlers
│   ├── models/          # MongoDB models
│   ├── middleware/      # Express middleware
│   └── index.ts         # Server entry point
├── dist/                # Compiled JavaScript
└── package.json
```

## Environment Setup

### MongoDB Setup (Local)

Install MongoDB and start the service:

**Windows:**
```bash
mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Google Gemini API

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to `.env`

## License

MIT
