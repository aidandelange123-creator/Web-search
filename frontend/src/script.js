// Enhanced search class with additional features and improved performance
class WebSearchAI {
  constructor() {
    this.searchForm = document.getElementById('search-form');
    this.searchQueryInput = document.getElementById('search-query');
    this.searchBingCheckbox = document.getElementById('search-bing');
    this.searchDuckDuckGoCheckbox = document.getElementById('search-duckduckgo');
    this.searchGoogleCheckbox = document.getElementById('search-google'); // New feature
    this.searchButton = document.getElementById('search-button');
    this.loadingElement = document.getElementById('loading');
    this.resultsContainer = document.getElementById('results-container');
    this.searchHistoryContainer = document.getElementById('search-history'); // New feature
    this.clearHistoryButton = document.getElementById('clear-history'); // New feature

    // Initialize search history
    this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    
    // Debounce search to prevent excessive requests
    this.debounceTimer = null;
    this.initEventListeners();
    this.displaySearchHistory();
  }

  initEventListeners() {
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.performSearch();
    });

    // Add input debouncing to prevent too many requests while typing
    this.searchQueryInput.addEventListener('input', (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (e.target.value.trim().length > 2) {
          // Optionally implement search suggestions here
        }
      }, 500);
    });

    // Add event listener for clear history button
    if (this.clearHistoryButton) {
      this.clearHistoryButton.addEventListener('click', () => {
        this.clearSearchHistory();
      });
    }
  }

  async performSearch() {
    const query = this.searchQueryInput.value.trim();
    if (!query) {
      alert('Please enter a search query');
      return;
    }

    const searchBing = this.searchBingCheckbox.checked;
    const searchDuckDuckGo = this.searchDuckDuckGoCheckbox.checked;
    const searchGoogle = this.searchGoogleCheckbox ? this.searchGoogleCheckbox.checked : false; // New feature

    if (!searchBing && !searchDuckDuckGo && !searchGoogle) {
      alert('Please select at least one search engine');
      return;
    }

    // Show loading
    this.showLoading();

    try {
      // Determine which engines to search
      let engine = 'all';
      if (searchBing && !searchDuckDuckGo && !searchGoogle) {
        engine = 'bing';
      } else if (!searchBing && searchDuckDuckGo && !searchGoogle) {
        engine = 'duckduckgo';
      } else if (!searchBing && !searchDuckDuckGo && searchGoogle) {
        engine = 'google';
      }

      // Use Promise.race to get results faster - return whichever search engine responds first
      const results = {};

      // Start search with timeout to prevent hanging
      const searchPromises = [];
      
      const searchUrl = engine === 'all' ? `/api/search/multi?q=${encodeURIComponent(query)}` : `/api/search?q=${encodeURIComponent(query)}&engine=${engine}`;
      
      const searchResults = await this.searchWithBot(query, engine);
      
      // Add to search history
      this.addToSearchHistory(query, searchResults, engine);
      
      this.displayResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      this.displayError('An error occurred while searching. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  // Optimized bot-based search implementation with timeout and fallback
  async searchWithBot(query, engine) {
    try {
      // Use fetch with timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const searchUrl = engine === 'all' ? `/api/search/multi?q=${encodeURIComponent(query)}` : `/api/search?q=${encodeURIComponent(query)}&engine=${engine}`;
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the search results from the backend
      return data.results || data;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`Search timed out`);
        throw new Error(`Search timeout`);
      }
      
      console.error(`Search error:`, error);
      
      // Fallback to mock results if API fails
      return {
        bing: [
          {
            title: `Bing Results for: ${query}`,
            url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
            snippet: `This is a fallback result from Bing for the query "${query}". The search bot encountered an error but is providing example results.`
          }
        ],
        duckduckgo: [
          {
            title: `DuckDuckGo Results for: ${query}`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            snippet: `This is a fallback result from DuckDuckGo for the query "${query}". The search bot encountered an error but is providing example results.`
          }
        ],
        google: [
          {
            title: `Google Results for: ${query}`,
            url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
            snippet: `This is a fallback result from Google for the query "${query}". The search bot encountered an error but is providing example results.`
          }
        ]
      };
    }
  }

  displayResults(results) {
    this.resultsContainer.innerHTML = '';

    if (results.bing !== undefined) {
      this.renderSearchEngineResults('Bing', results.bing);
    }

    if (results.duckduckgo !== undefined) {
      this.renderSearchEngineResults('DuckDuckGo', results.duckduckgo);
    }

    if (results.google !== undefined) { // New feature
      this.renderSearchEngineResults('Google', results.google);
    }

    if ((!results.bing || results.bing.length === 0) && 
        (!results.duckduckgo || results.duckduckgo.length === 0) &&
        (!results.google || results.google.length === 0)) {
      this.resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
    }
  }

  renderSearchEngineResults(engine, results) {
    const engineResultsDiv = document.createElement('div');
    engineResultsDiv.className = 'search-engine-results';

    const header = document.createElement('div');
    header.className = `${engine.toLowerCase()}-header`;
    header.classList.add('search-engine-header');
    
    const icon = document.createElement('div');
    if (engine === 'Bing') {
      icon.innerHTML = '🔍';
    } else if (engine === 'DuckDuckGo') {
      icon.innerHTML = '🦆';
    } else if (engine === 'Google') { // New feature
      icon.innerHTML = '🔍';
    }
    icon.style.fontSize = '1.5rem';
    
    const title = document.createElement('h2');
    title.className = 'search-engine-title';
    title.textContent = `${engine} Results`;
    
    header.appendChild(icon);
    header.appendChild(title);
    engineResultsDiv.appendChild(header);

    if (results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = `No results found on ${engine}`;
      engineResultsDiv.appendChild(noResults);
    } else {
      results.forEach(result => {
        const resultElement = this.createResultElement(result);
        engineResultsDiv.appendChild(resultElement);
      });
    }

    this.resultsContainer.appendChild(engineResultsDiv);
  }

  createResultElement(result) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'result-item';

    const title = document.createElement('a');
    title.className = 'result-title';
    title.href = result.url;
    title.textContent = result.title;
    title.target = '_blank';
    title.rel = 'noopener';

    const url = document.createElement('span');
    url.className = 'result-url';
    url.textContent = this.truncateUrl(result.url);

    const snippet = document.createElement('p');
    snippet.className = 'result-snippet';
    snippet.textContent = this.truncateText(result.snippet, 160);

    resultDiv.appendChild(title);
    resultDiv.appendChild(url);
    resultDiv.appendChild(snippet);

    return resultDiv;
  }

  // Helper to truncate URLs for better display on slow connections
  truncateUrl(url) {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname.substring(0, 20)}${urlObj.pathname.length > 20 ? '...' : ''}`;
    } catch {
      return url.length > 50 ? url.substring(0, 50) + '...' : url;
    }
  }

  // Helper to truncate text for faster rendering
  truncateText(text, maxLength = 160) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  displayError(message) {
    this.resultsContainer.innerHTML = `<div class="no-results">${message}</div>`;
  }

  showLoading() {
    this.loadingElement.classList.remove('hidden');
  }

  hideLoading() {
    this.loadingElement.classList.add('hidden');
  }

  // New feature: Search history management
  addToSearchHistory(query, results, engine) {
    const historyEntry = {
      id: Date.now().toString(),
      query,
      engine,
      timestamp: new Date().toISOString(),
      resultsCount: Object.values(results).reduce((acc, val) => acc + (Array.isArray(val) ? val.length : 0), 0)
    };

    this.searchHistory.unshift(historyEntry); // Add to beginning of array

    // Keep only last 20 searches
    if (this.searchHistory.length > 20) {
      this.searchHistory = this.searchHistory.slice(0, 20);
    }

    // Save to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));

    // Update the UI
    this.displaySearchHistory();
  }

  displaySearchHistory() {
    if (!this.searchHistoryContainer) return;

    this.searchHistoryContainer.innerHTML = '';

    if (this.searchHistory.length === 0) {
      this.searchHistoryContainer.innerHTML = '<div class="no-history">No search history</div>';
      return;
    }

    const historyTitle = document.createElement('h3');
    historyTitle.textContent = 'Recent Searches';
    historyTitle.className = 'history-title';
    this.searchHistoryContainer.appendChild(historyTitle);

    this.searchHistory.forEach((entry, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const queryLink = document.createElement('a');
      queryLink.href = '#';
      queryLink.textContent = entry.query;
      queryLink.title = `Searched on ${entry.engine} - ${entry.resultsCount} results`;
      queryLink.onclick = (e) => {
        e.preventDefault();
        this.searchQueryInput.value = entry.query;
        this.performSearch();
      };
      
      const timestamp = document.createElement('span');
      timestamp.className = 'history-timestamp';
      timestamp.textContent = new Date(entry.timestamp).toLocaleTimeString();
      
      historyItem.appendChild(queryLink);
      historyItem.appendChild(timestamp);
      this.searchHistoryContainer.appendChild(historyItem);
    });
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
    this.displaySearchHistory();
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WebSearchAI();
});