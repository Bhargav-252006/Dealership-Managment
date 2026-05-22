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
  const companies = await prisma.company.findMany({
    where: { dealer_id: dealerId },
    include: {
      products: { orderBy: { product_name: 'asc' } }
    },
    orderBy: { name: 'asc' }
  });

  res.json(companies.map(co => ({
    id: co.id,
    name: co.name,
    category: co.category,
    products: co.products.map(p => ({
      id: p.id,
      company: p.company_id,
      company_name: co.name,
      product_name: p.product_name,
      unit_size: p.unit_size,
      units_per_box: p.units_per_box,
      default_price: Number(p.default_price)
    }))
  })));
});

router.post('/', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const { name, category } = req.body;
  const co = await prisma.company.create({ data: { name, category, dealer_id: dealerId } });
  res.status(201).json(co);
});

router.patch('/:id', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const company = await prisma.company.findFirst({
    where: { id: Number(req.params.id), dealer_id: dealerId }
  });
  if (!company) return res.status(403).json({ error: 'Unauthorized' });

  const { name, category } = req.body;
  const co = await prisma.company.update({
    where: { id: Number(req.params.id) },
    data: { name, category }
  });
  res.json(co);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const company = await prisma.company.findFirst({
    where: { id: Number(req.params.id), dealer_id: dealerId }
  });
  if (!company) return res.status(403).json({ error: 'Unauthorized' });

  try {
    await prisma.company.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: 'Cannot delete company with existing orders' });
  }
});

module.exports = router;
