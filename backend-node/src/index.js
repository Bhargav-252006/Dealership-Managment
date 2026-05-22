const express = require('express');
const cors = require('cors');
require('dotenv').config();

// BigInt serialization fix
BigInt.prototype.toJSON = function () { return Number(this); };

const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl etc)
    if (!origin) return callback(null, true);
    // Allow all vercel.app domains and localhost
    if (
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('localhost')
    ) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Activity Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    // Hide passwords from logs
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '***';
    console.log(`[BODY]`, safeBody);
  }
  if (Object.keys(req.query).length > 0) {
    console.log(`[QUERY]`, req.query);
  }
  next();
});

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

// Export for Vercel serverless
module.exports = app;

// Only listen when run directly (not on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`[SERVER] Node Server running on port ${PORT}`);
    console.log(`[SERVER] DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
    console.log(`[SERVER] DIRECT_URL set: ${!!process.env.DIRECT_URL}`);
    console.log(`[SERVER] JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
  });
}
