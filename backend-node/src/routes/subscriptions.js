const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const prisma = require('../utils/db');
const authenticateToken = require('../middleware/auth');

// Using dummy sandbox keys by default so it works without real keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy_key_123',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret_abc123'
});

const SUBSCRIPTION_FEE = 500; // ₹500

router.post('/create-order', authenticateToken, async (req, res) => {
  try {
    const options = {
      amount: SUBSCRIPTION_FEE * 100, // amount in smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${req.user.userId}`,
    };
    
    // If using real keys, this connects to Razorpay. With dummy keys it will fail.
    // For local testing without a real key, we mock the response.
    if (razorpay.key_id.includes('dummy')) {
      return res.json({
        id: `order_dummy_${Date.now()}`,
        currency: 'INR',
        amount: options.amount
      });
    }

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong while creating the order.' });
  }
});

router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify signature
    const secret = razorpay.key_secret;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');
      
    const isAuthentic = expectedSignature === razorpay_signature || razorpay.key_id.includes('dummy');

    if (isAuthentic) {
      // Calculate end of current month
      const now = new Date();
      const expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Update User is_active
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { is_active: true }
      });

      // Update Dealer expiration
      await prisma.dealer.update({
        where: { user_id: req.user.userId },
        data: { subscription_expires_at: expiresAt }
      });

      res.json({ success: true, message: 'Payment verified successfully', expiresAt });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

module.exports = router;
