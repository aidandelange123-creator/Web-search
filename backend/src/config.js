// Backend configuration file
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  backendPort: process.env.BACKEND_PORT || 3000,
  frontendPort: process.env.FRONTEND_PORT || 8000,
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimit: {
    points: process.env.RATE_LIMIT_POINTS || 50,
    duration: process.env.RATE_LIMIT_DURATION || 60, // in seconds
  },
  searchEngines: {
    bing: {
      enabled: process.env.BING_ENABLED !== 'false',
      timeout: process.env.BING_TIMEOUT || 8000,
    },
    duckduckgo: {
      enabled: process.env.DUCKDUCKGO_ENABLED !== 'false',
      timeout: process.env.DUCKDUCKGO_TIMEOUT || 8000,
    },
    google: {
      enabled: process.env.GOOGLE_ENABLED !== 'false',
      timeout: process.env.GOOGLE_TIMEOUT || 10000,
    }
  }
};

module.exports = config;