const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authenticateToken = require('../middleware/auth');

const getDealerId = async (userId) => {
  const dealer = await prisma.dealer.findUnique({ where: { user_id: userId } });
  return dealer?.id;
};

// GET notifications for the current dealer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const dealerId = await getDealerId(req.user.userId);
    if (!dealerId) return res.status(404).json({ error: 'Dealer not found' });

    const notifications = await prisma.notification.findMany({
      where: { dealer_id: dealerId },
      orderBy: { created_at: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH mark all notifications as read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    const dealerId = await getDealerId(req.user.userId);
    if (!dealerId) return res.status(404).json({ error: 'Dealer not found' });

    await prisma.notification.updateMany({
      where: { dealer_id: dealerId, is_read: false },
      data: { is_read: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH mark a notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const dealerId = await getDealerId(req.user.userId);
    if (!dealerId) return res.status(404).json({ error: 'Dealer not found' });

    const notifId = Number(req.params.id);
    
    const notification = await prisma.notification.updateMany({
      where: { id: notifId, dealer_id: dealerId },
      data: { is_read: true }
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
