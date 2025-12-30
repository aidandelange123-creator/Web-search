// Backend service for real web search with bot functionality
// This service handles web scraping and search functionality server-side
// to avoid CORS issues and handle rate limiting

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Middleware to add delay between requests to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to scrape search results from Bing
async function scrapeBing(query) {
  try {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    
    // Add random delay to avoid rate limiting
    await delay(Math.random() * 2000 + 1000); // 1-3 second delay
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract search results from Bing
    $('.b_algo').each((index, element) => {
      if (results.length >= 10) return false; // Limit to 10 results
      
      const titleElement = $(element).find('h2 a');
      const urlElement = $(element).find('h2 a');
      const snippetElement = $(element).find('.b_caption p, .b_lineclamp2, .b_paractl');

      const title = titleElement.text().trim();
      const url = urlElement.attr('href') || '';
      const snippet = snippetElement.text().trim();

      if (title && url) {
        results.push({
          title: title,
          url: url,
          snippet: snippet || 'No description available'
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping Bing:', error);
    return [];
  }
}

// Function to scrape search results from DuckDuckGo
async function scrapeDuckDuckGo(query) {
  try {
    const url = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    // Add random delay to avoid rate limiting
    await delay(Math.random() * 2000 + 1000); // 1-3 second delay
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Extract search results from DuckDuckGo
    $('.result').each((index, element) => {
      if (results.length >= 10) return false; // Limit to 10 results
      
      const titleElement = $(element).find('.result__a');
      const urlElement = $(element).find('.result__a');
      const snippetElement = $(element).find('.result__snippet');

      const title = titleElement.text().trim();
      const url = urlElement.attr('href') || '';
      const snippet = snippetElement.text().trim();

      if (title && url) {
        results.push({
          title: title,
          url: url,
          snippet: snippet || 'No description available'
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping DuckDuckGo:', error);
    return [];
  }
}

// API endpoint for search
app.get('/api/search', async (req, res) => {
  try {
    const { query, engine } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    let results = [];

    if (engine === 'bing' || engine === 'all') {
      results = await scrapeBing(query);
    } else if (engine === 'duckduckgo') {
      results = await scrapeDuckDuckGo(query);
    } else {
      // Default to both if no specific engine is requested
      const [bingResults, duckduckgoResults] = await Promise.all([
        scrapeBing(query),
        scrapeDuckDuckGo(query)
      ]);
      
      results = {
        bing: bingResults,
        duckduckgo: duckduckgoResults
      };
    }

    res.json({ query, results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint for multiple engines
app.get('/api/search/multi', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Run both searches in parallel
    const [bingResults, duckduckgoResults] = await Promise.all([
      scrapeBing(query),
      scrapeDuckDuckGo(query)
    ]);

    res.json({ 
      query, 
      results: {
        bing: bingResults,
        duckduckgo: duckduckgoResults
      },
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Multi-search error:', error);
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