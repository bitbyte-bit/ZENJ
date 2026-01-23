import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './database.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import contactRoutes from './routes/contacts.js';
import profileRoutes from './routes/profile.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/contacts', authenticateToken, contactRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (contactId: string) => {
    socket.join(`chat-${contactId}`);
  });

  socket.on('leave-chat', (contactId: string) => {
    socket.leave(`chat-${contactId}`);
  });

  socket.on('typing', (contactId: string) => {
    socket.to(`chat-${contactId}`).emit('user-typing', { userId: socket.id });
  });

  socket.on('stop-typing', (contactId: string) => {
    socket.to(`chat-${contactId}`).emit('user-stopped-typing', { userId: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '5000', 10);
(async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`\n✓ Zenj Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
})();

export { io };
