const NodeCache = require('node-cache');

// Create cache instance with TTL (Time To Live)
const cache = new NodeCache({ 
  stdTTL: process.env.CACHE_TTL || 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance
});

// Cache middleware
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Create cache key from request
    const key = `${req.method}:${req.originalUrl}`;
    
    // Check if cached version exists
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      // Set cache headers
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `public, max-age=${duration}`);
      return res.json(cachedResponse);
    }
    
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(body) {
      // Cache the response
      cache.set(key, body, duration);
      
      // Set cache headers
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${duration}`);
      
      // Call original json method
      originalJson.call(this, body);
    };
    
    next();
  };
};

// Cache stats endpoint
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    stats: cache.getStats(),
    memory: process.memoryUsage()
  };
};

// Clear cache function
const clearCache = (pattern) => {
  if (pattern) {
    const keys = cache.keys().filter(key => key.includes(pattern));
    cache.del(keys);
    return keys.length;
  } else {
    cache.flushAll();
    return 'all';
  }
};

module.exports = {
  cache,
  cacheMiddleware,
  getCacheStats,
  clearCache
};
