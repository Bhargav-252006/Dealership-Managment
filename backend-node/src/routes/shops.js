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
  const { location } = req.query;
  
  let where = { dealer_id: dealerId };
  if (location) where.location_id = Number(location);

  const shops = await prisma.shop.findMany({
    where,
    include: { location: true },
    orderBy: { shop_name: 'asc' }
  });

  res.json(shops.map(shop => ({
    id: shop.id,
    shop_name: shop.shop_name,
    owner_name: shop.owner_name,
    phone: shop.phone,
    address: shop.address,
    location: shop.location_id,
    location_name: shop.location?.name,
    created_at: shop.created_at
  })));
});

router.post('/', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const { shop_name, owner_name, phone, address, location } = req.body;
  const shop = await prisma.shop.create({
    data: {
      shop_name, owner_name, phone, address,
      dealer_id: dealerId,
      location_id: location ? Number(location) : null,
      created_at: new Date()
    }
  });
  res.status(201).json(shop);
});

router.patch('/:id', authenticateToken, async (req, res) => {
  const { shop_name, owner_name, phone, address, location } = req.body;
  const shop = await prisma.shop.update({
    where: { id: Number(req.params.id) },
    data: {
      shop_name, owner_name, phone, address,
      location_id: location ? Number(location) : null
    }
  });
  res.json(shop);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.shop.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: 'Cannot delete shop with existing orders' });
  }
});

module.exports = router;
