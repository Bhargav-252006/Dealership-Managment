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
  const locations = await prisma.location.findMany({
    where: { dealer_id: dealerId },
    include: { _count: { select: { shops: true } } },
    orderBy: { name: 'asc' }
  });
  
  res.json(locations.map(loc => ({
    id: loc.id,
    name: loc.name,
    shop_count: loc._count.shops
  })));
});

router.post('/', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const { name } = req.body;
  const loc = await prisma.location.create({
    data: { name, dealer_id: dealerId }
  });
  res.status(201).json(loc);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  await prisma.location.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

module.exports = router;
