const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // Contains userId
    
    // User Activity Log
    const timestamp = new Date().toISOString();
    const identifier = user.username ? user.username : `ID:${user.userId}`;
    console.log(`[${timestamp}] [USER ${identifier}] accessed ${req.method} ${req.originalUrl}`);
    if (['POST', 'PATCH', 'PUT'].includes(req.method) && Object.keys(req.body).length > 0) {
      console.log(`[USER ${identifier}] BODY:`, req.body);
    }
    
    // Check subscription status
    prisma.user.findUnique({ where: { id: user.userId } }).then(dbUser => {
      if (!dbUser) return res.sendStatus(401);
      
      const exemptRoutes = ['/me', '/export-csv', '/create-order', '/verify'];
      const isExempt = exemptRoutes.some(route => req.originalUrl.includes(route));
      
      if (!dbUser.is_active && !isExempt) {
        return res.status(402).json({ error: 'Subscription expired. Payment required.' });
      }
      
      next();
    }).catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
  });
};

module.exports = authenticateToken;
