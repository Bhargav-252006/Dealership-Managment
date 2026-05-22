const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authenticateToken = require('../middleware/auth');

const getDealerId = async (userId) => {
  const dealer = await prisma.dealer.findUnique({ where: { user_id: userId } });
  return dealer?.id;
};

router.post('/', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const { company, product_name, unit_size, default_price } = req.body;
  
  // Security check: ensure company belongs to this dealer
  const co = await prisma.company.findFirst({ where: { id: Number(company), dealer_id: dealerId } });
  if (!co) return res.status(403).json({ error: 'Unauthorized company' });

  const p = await prisma.product.create({
    data: {
      company_id: Number(company),
      product_name,
      unit_size,
      default_price: default_price || 0
    }
  });
  res.status(201).json(p);
});

router.patch('/:id', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  // Verify product belongs to dealer
  const product = await prisma.product.findFirst({
    where: { id: Number(req.params.id), company: { dealer_id: dealerId } }
  });
  if (!product) return res.status(403).json({ error: 'Unauthorized product' });

  const { product_name, unit_size, units_per_box, default_price } = req.body;
  const p = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { product_name, unit_size, units_per_box, default_price }
  });
  res.json(p);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const dealerId = await getDealerId(req.user.userId);
  const product = await prisma.product.findFirst({
    where: { id: Number(req.params.id), company: { dealer_id: dealerId } }
  });
  if (!product) return res.status(403).json({ error: 'Unauthorized product' });

  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: 'Cannot delete product with existing orders' });
  }
});

module.exports = router;
