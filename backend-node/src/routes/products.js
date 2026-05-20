const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  const { company, product_name, unit_size, default_price } = req.body;
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
  const { product_name, unit_size, units_per_box, default_price } = req.body;
  const p = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: { product_name, unit_size, units_per_box, default_price }
  });
  res.json(p);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: 'Cannot delete product with existing orders' });
  }
});

module.exports = router;
