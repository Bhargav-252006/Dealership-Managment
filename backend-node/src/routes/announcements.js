const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authenticateToken = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// GET all announcements (dealers and admins)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json(announcements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create a new announcement (admin only)
router.post('/', authenticateToken, adminAuth, async (req, res) => {
  const { title, message } = req.body;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  try {
    const announcement = await prisma.$transaction(async (tx) => {
      // 1. Create announcement
      const ann = await tx.announcement.create({
        data: { title, message }
      });

      // 2. Find all dealers
      const dealers = await tx.dealer.findMany();

      // 3. Create notifications for each dealer
      if (dealers.length > 0) {
        await tx.notification.createMany({
          data: dealers.map(d => ({
            dealer_id: d.id,
            title: `📢 New Announcement: ${title}`,
            message: message.substring(0, 100) + (message.length > 100 ? '...' : '')
          }))
        });
      }

      return ann;
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
