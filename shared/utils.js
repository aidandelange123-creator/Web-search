// Shared utilities for the Web Search AI project

// Function to validate search query
function validateQuery(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return { valid: false, error: 'Query is required and must be a non-empty string' };
  }

  if (query.trim().length > 255) {
    return { valid: false, error: 'Query is too long (max 255 characters)' };
  }

  return { valid: true };
}

// Function to sanitize search results
function sanitizeResults(results) {
  if (!results) return [];

  return results.map(result => ({
    title: result.title ? result.title.substring(0, 200) : '',
    url: result.url ? result.url.substring(0, 500) : '',
    snippet: result.snippet ? result.snippet.substring(0, 300) : ''
  }));
}

// Function to truncate text
function truncateText(text, maxLength = 160) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Function to format URL for display
function formatUrlForDisplay(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.hostname}${urlObj.pathname.substring(0, 20)}${urlObj.pathname.length > 20 ? '...' : ''}`;
  } catch {
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  }
}

// Function to get engine name from URL
function getEngineFromUrl(url) {
  if (url.includes('bing.com')) return 'Bing';
  if (url.includes('duckduckgo.com')) return 'DuckDuckGo';
  if (url.includes('google.com')) return 'Google';
  return 'Unknown';
}

// Function to generate unique ID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Function to calculate time difference in seconds
function timeDiffInSeconds(startTime) {
  return Math.round((Date.now() - startTime) / 1000);
}

module.exports = {
  validateQuery,
  sanitizeResults,
  truncateText,
  formatUrlForDisplay,
  getEngineFromUrl,
  generateId,
  timeDiffInSeconds
};