const prisma = require('../utils/db');

async function activityLogger(req, res, next) {
  // Call next middleware/route first
  next();

  // Run the logging logic asynchronously after the route has been handled
  const isMutating = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method);
  const isAuthOrLog = req.originalUrl.includes('/token') || 
                      req.originalUrl.includes('/register') || 
                      req.originalUrl.includes('/activity-logs') ||
                      req.originalUrl.includes('/analytics');

  if (req.user && isMutating && !isAuthOrLog) {
    try {
      let details = '';
      if (req.method !== 'DELETE') {
        const bodyCopy = { ...req.body };
        // Redact sensitive info
        if (bodyCopy.password) bodyCopy.password = '***';
        details = JSON.stringify(bodyCopy);
      } else {
        details = `Deleted resource at ${req.originalUrl}`;
      }

      const actionMap = {
        POST: 'Created',
        PATCH: 'Updated',
        PUT: 'Updated',
        DELETE: 'Deleted'
      };

      // Determine clean action name, e.g. "Created Shops" -> "Created Shop"
      const pathParts = req.originalUrl.split('?')[0].split('/');
      const resource = pathParts[2] || 'Resource'; // e.g. /api/shops -> shops
      let cleanResource = resource.charAt(0).toUpperCase() + resource.slice(1);
      
      // Basic singularization
      if (cleanResource.endsWith('s')) {
        cleanResource = cleanResource.slice(0, -1);
      }
      
      const actionName = `${actionMap[req.method]} ${cleanResource}`;

      await prisma.activityLog.create({
        data: {
          user_id: req.user.userId,
          action: actionName,
          details: details.substring(0, 500)
        }
      });
    } catch (err) {
      console.error('[ActivityLogger Error]:', err.message);
    }
  }
}

module.exports = activityLogger;
