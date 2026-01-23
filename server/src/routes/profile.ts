import express, { Response } from 'express';
import User from '../models/User.js';
import Moment from '../models/Moment.js';
import { AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.patch('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, bio, phone, avatar, settings } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;
    if (settings) updates.settings = settings;

    await User.update(updates, { where: { id: req.userId } });
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user.toJSON();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get moments
router.get('/moments/all', async (req: AuthRequest, res: Response) => {
  try {
    const moments = await Moment.findAll({ order: [['createdAt', 'DESC']] });
    res.json(moments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch moments' });
  }
});

// Add moment
router.post('/moments/add', async (req: AuthRequest, res: Response) => {
  try {
    const { content, mediaUrl, type = 'text' } = req.body;
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const moment = await Moment.create({
      userId: req.userId,
      userName: user.name,
      userAvatar: user.avatar,
      content,
      mediaUrl,
      type
    });

    res.status(201).json(moment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add moment' });
  }
});

export default router;
