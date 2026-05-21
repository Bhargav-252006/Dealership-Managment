const express = require('express');
const cors = require('cors');
require('dotenv').config();

// BigInt serialization fix
BigInt.prototype.toJSON = function () { return Number(this); };

const app = express();
app.use(cors());
app.use(express.json());

// Modular Routes
app.get('/', (req, res) => res.send('Dealership API is running! 🚀'));

app.get('/api/ping', async (req, res) => {
  try {
    await require('./utils/db').$queryRaw`SELECT 1`;
    res.status(200).send('pong');
  } catch (error) {
    res.status(500).send('db error');
  }
});
app.use('/api', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`[SERVER] Node Server running on port ${PORT}`);
  console.log(`[SERVER] DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
  console.log(`[SERVER] DIRECT_URL set: ${!!process.env.DIRECT_URL}`);
  console.log(`[SERVER] JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
});
