// backend/middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

const planGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many plan generation requests from this IP'
});

module.exports = { planGenerationLimiter };
