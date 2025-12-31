// Optimized backend service for real web search with bot functionality
// This service handles web scraping and search functionality server-side
// to avoid CORS issues and handle rate limiting with optimizations for slow connections

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

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

    return results;
  } catch (error) {
    console.error('Error scraping Bing:', error.message);
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

    return results;
  } catch (error) {
    console.error('Error scraping DuckDuckGo:', error.message);
    return [];
  }
}

// API endpoint for search with optimizations for slow connections
app.get('/api/search', async (req, res) => {
  try {
    const { query, engine } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    let results = [];

    // Set a timeout for the entire request to prevent hanging on slow connections
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    if (engine === 'bing' || engine === 'all') {
      // Use Promise.race to prevent hanging requests
      results = await Promise.race([scrapeBing(query), timeoutPromise]);
    } else if (engine === 'duckduckgo') {
      results = await Promise.race([scrapeDuckDuckGo(query), timeoutPromise]);
    } else {
      // Default to both if no specific engine is requested
      // Use optimized parallel execution with timeout
      const bingPromise = Promise.race([scrapeBing(query), timeoutPromise]);
      const duckduckgoPromise = Promise.race([scrapeDuckDuckGo(query), timeoutPromise]);
      
      const [bingResults, duckduckgoResults] = await Promise.allSettled([
        bingPromise,
        duckduckgoPromise
      ]);
      
      results = {
        bing: bingResults.status === 'fulfilled' ? bingResults.value : [],
        duckduckgo: duckduckgoResults.status === 'fulfilled' ? duckduckgoResults.value : []
      };
    }

    res.json({ query, results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint for multiple engines with optimizations for slow connections
app.get('/api/search/multi', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Set a timeout for the entire request to prevent hanging on slow connections
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000)
    );

    // Run both searches in parallel with timeout protection
    const bingPromise = Promise.race([scrapeBing(query), timeoutPromise]);
    const duckduckgoPromise = Promise.race([scrapeDuckDuckGo(query), timeoutPromise]);
    
    const [bingResults, duckduckgoResults] = await Promise.allSettled([
      bingPromise,
      duckduckgoPromise
    ]);

    res.json({ 
      query, 
      results: {
        bing: bingResults.status === 'fulfilled' ? bingResults.value : [],
        duckduckgo: duckduckgoResults.status === 'fulfilled' ? duckduckgoResults.value : []
      },
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Multi-search error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Search backend server is running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET /api/search?q={query}&engine={bing|duckduckgo|all}`);
  console.log(`  GET /api/search/multi?q={query}`);
  console.log(`  GET /health`);
});

module.exports = app;