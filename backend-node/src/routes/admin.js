const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const jwt = require('jsonwebtoken');

// GET all dealers
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { is_admin: false },
      include: { dealer: true },
      orderBy: { created_at: 'desc' }
    });
    
    // Map to a cleaner format for the admin dashboard
    const formatted = users.map(u => ({
      id: u.id,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      is_active: u.is_active,
      created_at: u.created_at,
      dealer_id: u.dealer?.id,
      business_type: u.dealer?.business_type,
      phone: u.dealer?.phone,
      subscription_expires_at: u.dealer?.subscription_expires_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle subscription status manually
router.patch('/users/:id/subscription', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { is_active } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { is_active }
    });
    
    res.json({ success: true, is_active: user.is_active });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate an impersonation token
router.post('/impersonate', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const targetUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate a normal access token for the target user
    const token = jwt.sign(
      { userId: targetUser.id, username: targetUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '12h' } // Give it a long expiry for the impersonation session
    );

    res.json({ token, user: targetUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
