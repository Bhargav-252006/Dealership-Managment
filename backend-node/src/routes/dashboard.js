const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authenticateToken = require('../middleware/auth');

const getDealerId = async (userId) => {
  const dealer = await prisma.dealer.findUnique({ where: { user_id: userId } });
  return dealer?.id;
};

router.get('/', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const total_shops = await prisma.shop.count({ where: { dealer_id: dealerId } });
  
  const orders_today = await prisma.order.count({
    where: {
      dealer_id: dealerId,
      order_date: { gte: startOfDay }
    }
  });

  const pending_deliveries = 0;
  const delivered = 0;

  const recent_orders = await prisma.order.findMany({
    where: { dealer_id: dealerId },
    orderBy: { created_at: 'desc' },
    take: 5,
    include: {
      shop: { include: { location: true } },
      items: true
    }
  });

  const recent_data = recent_orders.map(order => {
    const total = order.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    return {
      id: order.id,
      shop_name: order.shop.shop_name,
      location_name: order.shop.location?.name,
      order_date: order.order_date.toISOString().split('T')[0],
      total_amount: total.toFixed(2),
      items: []
    };
  });

  res.json({ total_shops, orders_today, pending_deliveries, delivered, recent_orders: recent_data });
});

module.exports = router;
