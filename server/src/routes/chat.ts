import express, { Response } from 'express';
import Message from '../models/Message.js';
import Contact from '../models/Contact.js';
import { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a conversation
router.get('/:contactId', async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params;
    const messages = await Message.findAll({
      where: { conversationId: contactId },
      order: [['createdAt', 'ASC']]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/:contactId', async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params;
    const { content, type = 'text', mediaUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Get user name
    const user = await import('../models/User.js').then(m => m.default.findByPk(req.userId));
    const senderName = user ? user.name : 'Unknown';

    const message = await Message.create({
      conversationId: contactId,
      senderId: req.userId,
      senderName,
      content,
      type,
      mediaUrl,
      status: 'sent'
    });

    // Update contact's last message
    await Contact.update(
      {
        lastMessageSnippet: content.slice(0, 40),
        lastMessageTime: Date.now()
      },
      { where: { id: contactId } }
    );

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// React to a message
router.patch('/:messageId/react', async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { emoji, userName } = req.body;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const reactions = { ...message.reactions };
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    if (!reactions[emoji].includes(userName)) {
      reactions[emoji].push(userName);
    }

    await Message.update({ reactions }, { where: { id: messageId } });
    const updatedMessage = await Message.findByPk(messageId);
    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to react to message' });
  }
});

// Mark message as read
router.patch('/:messageId/read', async (req: AuthRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    await Message.update({ status: 'read' }, { where: { id: messageId } });
    const message = await Message.findByPk(messageId);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update message' });
  }
});

export default router;
