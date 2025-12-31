// Enhanced backend service for real web search with bot functionality
// This service handles web scraping and search functionality server-side
// to avoid CORS issues and handle rate limiting with optimizations for slow connections

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('rate-limiter-flexible');
const winston = require('winston');
const moment = require('moment');
const config = require('./config');

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'search-backend' },
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
const PORT = config.port;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

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

// Configure axios with optimized settings for slow connections
const axiosConfig = {
  timeout: 10000, // 10 second timeout instead of default
  maxRedirects: 3, // Limit redirects to reduce time
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate', // Enable compression
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  }
};

// Optimized delay function with shorter delays for slow connections
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to scrape search results from Bing with optimized settings for slow connections
async function scrapeBing(query) {
  try {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    
    // Reduce delay for slow connections to avoid hanging
    await delay(Math.random() * 1000 + 500); // 0.5-1.5 second delay instead of 1-3
    
    const response = await axios.get(url, {
      ...axiosConfig,
      timeout: 8000 // Slightly shorter timeout for Bing
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract search results from Bing with optimized selector
    $('.b_algo').each((index, element) => {
      if (results.length >= 8) return false; // Limit to 8 results instead of 10 for faster response
      
      const titleElement = $(element).find('h2 a');
      const urlElement = $(element).find('h2 a');
      const snippetElement = $(element).find('.b_caption p, .b_lineclamp2, .b_paractl');

      const title = titleElement.text().trim();
      const url = urlElement.attr('href') || '';
      const snippet = snippetElement.text().trim();

      if (title && url) {
        results.push({
          title: title.substring(0, 120), // Limit title length
          url: url.substring(0, 500), // Limit URL length
          snippet: snippet.substring(0, 200) || 'No description available' // Limit snippet length
        });
      }
    });

    logger.info(`Bing search for "${query}" returned ${results.length} results`);
    return results;
  } catch (error) {
    logger.error(`Error scraping Bing: ${error.message}`);
    return [];
  }
}

// Function to scrape search results from DuckDuckGo with optimized settings for slow connections
async function scrapeDuckDuckGo(query) {
  try {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    // Reduce delay for slow connections to avoid hanging
    await delay(Math.random() * 1000 + 500); // 0.5-1.5 second delay instead of 1-3
    
    const response = await axios.get(url, {
      ...axiosConfig,
      timeout: 8000 // Slightly shorter timeout for DuckDuckGo
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract search results from DuckDuckGo with optimized selector
    $('.result').each((index, element) => {
      if (results.length >= 8) return false; // Limit to 8 results instead of 10 for faster response
      
      const titleElement = $(element).find('.result__a');
      const urlElement = $(element).find('.result__a');
      const snippetElement = $(element).find('.result__snippet');

      const title = titleElement.text().trim();
      const url = urlElement.attr('href') || '';
      const snippet = snippetElement.text().trim();

      if (title && url) {
        results.push({
          title: title.substring(0, 120), // Limit title length
          url: url.substring(0, 500), // Limit URL length
          snippet: snippet.substring(0, 200) || 'No description available' // Limit snippet length
        });
      }
    });

    logger.info(`DuckDuckGo search for "${query}" returned ${results.length} results`);
    return results;
  } catch (error) {
    logger.error(`Error scraping DuckDuckGo: ${error.message}`);
    return [];
  }
}

// Function to scrape Google search results (additional feature)
async function scrapeGoogle(query) {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    await delay(Math.random() * 1500 + 1000); // Slightly longer delay for Google to avoid blocking
    
    const response = await axios.get(url, {
      ...axiosConfig,
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract search results from Google
    $('div.g').each((index, element) => {
      if (results.length >= 8) return false; // Limit results
      
      const titleElement = $(element).find('h3');
      const urlElement = $(element).find('a');
      const snippetElement = $(element).find('.VwiC3b, .s3v9rd');

      const title = titleElement.text().trim();
      const url = urlElement.attr('href') || '';
      const snippet = snippetElement.text().trim();

      if (title && url) {
        results.push({
          title: title.substring(0, 120),
          url: url.substring(0, 500),
          snippet: snippet.substring(0, 200) || 'No description available'
        });
      }
    });

    logger.info(`Google search for "${query}" returned ${results.length} results`);
    return results;
  } catch (error) {
    logger.error(`Error scraping Google: ${error.message}`);
    return [];
  }
}

// API endpoint for search with optimizations for slow connections
app.get('/search', async (req, res) => {
  try {
    const { q: query, engine } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    let results = [];

    // Set a timeout for the entire request to prevent hanging on slow connections
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    if (engine === 'bing') {
      results = await Promise.race([scrapeBing(query), timeoutPromise]);
    } else if (engine === 'duckduckgo') {
      results = await Promise.race([scrapeDuckDuckGo(query), timeoutPromise]);
    } else if (engine === 'google') {
      results = await Promise.race([scrapeGoogle(query), timeoutPromise]);
    } else {
      // Default to all engines if no specific engine is requested
      // Use optimized parallel execution with timeout
      const bingPromise = Promise.race([scrapeBing(query), timeoutPromise]);
      const duckduckgoPromise = Promise.race([scrapeDuckDuckGo(query), timeoutPromise]);
      const googlePromise = Promise.race([scrapeGoogle(query), timeoutPromise]);
      
      const [bingResults, duckduckgoResults, googleResults] = await Promise.allSettled([
        bingPromise,
        duckduckgoPromise,
        googlePromise
      ]);
      
      results = {
        bing: bingResults.status === 'fulfilled' ? bingResults.value : [],
        duckduckgo: duckduckgoResults.status === 'fulfilled' ? duckduckgoResults.value : [],
        google: googleResults.status === 'fulfilled' ? googleResults.value : []
      };
    }

    res.json({ query, results, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error(`Search error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint for multiple engines with optimizations for slow connections
app.get('/search/multi', async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Set a timeout for the entire request to prevent hanging on slow connections
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    // Run searches in parallel with timeout protection
    const bingPromise = Promise.race([scrapeBing(query), timeoutPromise]);
    const duckduckgoPromise = Promise.race([scrapeDuckDuckGo(query), timeoutPromise]);
    const googlePromise = Promise.race([scrapeGoogle(query), timeoutPromise]);
    
    const [bingResults, duckduckgoResults, googleResults] = await Promise.allSettled([
      bingPromise,
      duckduckgoPromise,
      googlePromise
    ]);

    res.json({ 
      query, 
      results: {
        bing: bingResults.status === 'fulfilled' ? bingResults.value : [],
        duckduckgo: duckduckgoResults.status === 'fulfilled' ? duckduckgoResults.value : [],
        google: googleResults.status === 'fulfilled' ? googleResults.value : []
      },
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    logger.error(`Multi-search error: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0'
  });
});

// History endpoint - new feature to track search history
const searchHistory = [];

app.post('/history', (req, res) => {
  const { query, results, engine } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  const historyEntry = {
    id: Date.now().toString(),
    query,
    engine: engine || 'all',
    resultsCount: results ? (Array.isArray(results) ? results.length : Object.values(results).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 0), 0)) : 0,
    timestamp: new Date().toISOString()
  };
  
  searchHistory.unshift(historyEntry); // Add to beginning of array
  
  // Keep only last 100 searches
  if (searchHistory.length > 100) {
    searchHistory.pop();
  }
  
  res.status(201).json({ message: 'History saved', id: historyEntry.id });
});

app.get('/history', (req, res) => {
  res.json({ history: searchHistory });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Search backend server is running on port ${PORT}`);
  logger.info(`API endpoints:`);
  logger.info(`  GET /search?q={query}&engine={bing|duckduckgo|google|all}`);
  logger.info(`  GET /search/multi?q={query}`);
  logger.info(`  GET /health`);
  logger.info(`  POST /history`);
  logger.info(`  GET /history`);
});

module.exports = app;