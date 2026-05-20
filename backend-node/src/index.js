const express = require('express');
const cors = require('cors');
require('dotenv').config();

// BigInt serialization fix
BigInt.prototype.toJSON = function () { return Number(this); };

const app = express();
app.use(cors());
app.use(express.json());

// Modular Routes
app.use('/api', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Node Server running on port ${PORT}`);
});
