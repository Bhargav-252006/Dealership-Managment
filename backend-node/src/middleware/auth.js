const jwt = require('jsonwebtoken');
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
    console.log(`[${timestamp}] [USER ${user.userId}] accessed ${req.method} ${req.originalUrl}`);
    if (['POST', 'PATCH', 'PUT'].includes(req.method) && Object.keys(req.body).length > 0) {
      console.log(`[USER ${user.userId}] BODY:`, req.body);
    }
    
    next();
  });
};

module.exports = authenticateToken;
