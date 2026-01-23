import express, { Response } from 'express';
import Contact from '../models/Contact.js';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all contacts for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const contacts = await Contact.findAll({ where: { userId: req.userId } });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Add a new contact
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, systemInstruction } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const contact = await Contact.create({
      userId: req.userId,
      name,
      phone: phone || '',
      systemInstruction: systemInstruction || 'You are a helpful assistant.',
      status: 'offline'
    });

    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Update contact
router.patch('/:contactId', async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params;
    const updates = req.body;

    const [affectedRows] = await Contact.update(updates, {
      where: { id: contactId, userId: req.userId }
    });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = await Contact.findByPk(contactId);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:contactId', async (req: AuthRequest, res: Response) => {
  try {
    const { contactId } = req.params;

    const deletedRows = await Contact.destroy({
      where: { id: contactId, userId: req.userId }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Create a group
router.post('/group/create', async (req: AuthRequest, res: Response) => {
  try {
    const { name, members } = req.body;

    if (!name || !Array.isArray(members)) {
      return res.status(400).json({ error: 'Name and members are required' });
    }

    const group = await Contact.create({
      userId: req.userId,
      name,
      isGroup: true,
      members: [...members, req.userId],
      ownerId: req.userId,
      adminIds: [req.userId],
      status: 'online'
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

export default router;
