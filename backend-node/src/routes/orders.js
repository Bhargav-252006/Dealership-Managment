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
  const { status, location, shop } = req.query;

  let where = { dealer_id: dealerId };
  if (status) where.status = status;
  if (shop) where.shop_id = Number(shop);
  if (location) where.shop = { location_id: Number(location) };

  const orders = await prisma.order.findMany({
    where,
    include: {
      shop: { include: { location: true } },
      items: { include: { product: { include: { company: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });

  res.json(orders.map(order => {
    const items = order.items.map(item => ({
      id: item.id,
      product: item.product_id,
      product_name: item.product.product_name,
      unit_size: item.product.unit_size,
      company_name: item.product.company.name,
      quantity: item.quantity,
      price: Number(item.price),
      subtotal: (Number(item.quantity) * Number(item.price)).toFixed(2)
    }));
    
    const total_amount = items.reduce((sum, item) => sum + Number(item.subtotal), 0).toFixed(2);

    return {
      id: order.id,
      shop: order.shop_id,
      shop_name: order.shop.shop_name,
      location_name: order.shop.location?.name,
      order_date: order.order_date.toISOString().split('T')[0],
      notes: order.notes,
      total_amount,
      items,
      created_at: order.created_at
    };
  }));
});

router.post('/', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const { shop, notes, items } = req.body;
  const now = new Date();

  const order = await prisma.order.create({
    data: {
      dealer_id: dealerId,
      shop_id: Number(shop),
      notes: notes || '',
      order_date: now,
      created_at: now,
      updated_at: now,
      items: {
        create: items.map(i => ({
          product_id: Number(i.product),
          quantity: i.quantity,
          price: i.price
        }))
      }
    },
    include: {
      shop: { include: { location: true } },
      items: { include: { product: { include: { company: true } } } }
    }
  });

  res.status(201).json({
    id: order.id,
    shop_name: order.shop.shop_name,
    location_name: order.shop.location?.name,
    total_amount: order.items.reduce((sum, i) => sum + (Number(i.quantity) * Number(i.price)), 0)
  });
});

router.get('/export-csv', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const orders = await prisma.order.findMany({
    where: { dealer_id: dealerId },
    include: {
      shop: { include: { location: true } },
      items: { include: { product: { include: { company: true } } } }
    },
    orderBy: { created_at: 'desc' }
  });

  let csvRows = ['Order ID,Date,Shop Name,Location,Product,Company,Size,Qty,Rate,Subtotal'];
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const subtotal = (Number(item.quantity) * Number(item.price)).toFixed(2);
      const row = [
        order.id,
        order.order_date.toISOString().split('T')[0],
        `"${order.shop.shop_name}"`,
        `"${order.shop.location?.name || ''}"`,
        `"${item.product.product_name}"`,
        `"${item.product.company.name}"`,
        `"${item.product.unit_size}"`,
        item.quantity,
        item.price,
        subtotal
      ];
      csvRows.push(row.join(','));
    });
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="orders_history.csv"');
  res.send(csvRows.join('\n'));
});

// Status update endpoint removed - status feature removed


module.exports = router;
