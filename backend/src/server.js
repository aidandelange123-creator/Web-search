// Enhanced development server with proxy for API requests
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('rate-limiter-flexible');
const winston = require('winston');
const config = require('./config');

// Import our security system
const securitySystem = require('../../security');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'frontend-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
const PORT = config.frontendPort;
const BACKEND_PORT = config.backendPort;

// Apply our multi-layer security system
app.use(securitySystem.getMiddleware());

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const opts = {
  points: config.rateLimit.points, // Number of points
  duration: config.rateLimit.duration, // Per duration seconds
};
const limiter = new rateLimit.RateLimiterMemory(opts);

const rateLimiterMiddleware = (req, res, next) => {
  limiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send('Too Many Requests');
    });
};

app.use(rateLimiterMiddleware);

// Enable compression to reduce payload size for slow connections
app.use(compression());

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory with cache optimization
app.use(express.static(path.join(__dirname, '../../frontend/src'), {
  maxAge: '1d', // Cache static assets for 1 day
  etag: true, // Enable ETag caching
}));

// Proxy API requests to the backend service
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    logger.info(`Proxying ${req.method} ${req.url} to http://localhost:${BACKEND_PORT}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info(`Received response from backend for ${req.url}: ${proxyRes.statusCode}`);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Frontend server is running', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API endpoints for frontend
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Catch-all handler to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/src/index.html'));
});

app.listen(PORT, () => {
  logger.info(`Frontend server running on http://localhost:${PORT}`);
  logger.info(`API requests will be proxied to http://localhost:${BACKEND_PORT}`);
  logger.info('Endpoints:');
  logger.info(`  GET  http://localhost:${PORT}/ (serves index.html)`);
  logger.info(`  GET  http://localhost:${PORT}/health`);
  logger.info(`  GET  http://localhost:${PORT}/api/status`);
  logger.info(`  GET  http://localhost:${PORT}/api/* (proxied to backend)`);
});

module.exports = app;