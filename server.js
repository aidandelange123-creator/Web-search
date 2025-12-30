// Development server with proxy for API requests
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 8000;
const BACKEND_PORT = 3000;

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Proxy API requests to the backend service
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // Remove /api prefix when forwarding
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to http://localhost:${BACKEND_PORT}${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response from backend for ${req.url}: ${proxyRes.statusCode}`);
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Frontend server is running', timestamp: new Date().toISOString() });
});

// Catch-all handler to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on http://localhost:${PORT}`);
  console.log(`API requests will be proxied to http://localhost:${BACKEND_PORT}`);
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/ (serves index.html)`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  GET  http://localhost:${PORT}/api/* (proxied to backend)`);
});