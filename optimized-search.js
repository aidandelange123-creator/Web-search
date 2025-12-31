// Optimized search class for faster performance on slower connections
class WebSearchAI {
  constructor() {
    this.searchForm = document.getElementById('search-form');
    this.searchQueryInput = document.getElementById('search-query');
    this.searchBingCheckbox = document.getElementById('search-bing');
    this.searchDuckDuckGoCheckbox = document.getElementById('search-duckduckgo');
    this.searchButton = document.getElementById('search-button');
    this.loadingElement = document.getElementById('loading');
    this.resultsContainer = document.getElementById('results-container');

    // Debounce search to prevent excessive requests
    this.debounceTimer = null;
    this.initEventListeners();
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
  }

  async performSearch() {
    const query = this.searchQueryInput.value.trim();
    if (!query) {
      alert('Please enter a search query');
      return;
    }

    const searchBing = this.searchBingCheckbox.checked;
    const searchDuckDuckGo = this.searchDuckDuckGoCheckbox.checked;

    if (!searchBing && !searchDuckDuckGo) {
      alert('Please select at least one search engine');
      return;
    }

    // Show loading
    this.showLoading();

    try {
      // Use Promise.race to get results faster - return whichever search engine responds first
      const results = {};

      // Start both searches in parallel but with timeout to prevent hanging
      const searchPromises = [];
      
      if (searchBing) {
        searchPromises.push(
          Promise.race([
            this.searchWithBot(query, 'bing'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Bing timeout')), 8000))
          ])
          .then(bingResults => ({ bing: bingResults }))
          .catch(error => {
            console.warn('Bing search failed:', error.message);
            return { bing: [] };
          })
        );
      }

      if (searchDuckDuckGo) {
        searchPromises.push(
          Promise.race([
            this.searchWithBot(query, 'duckduckgo'),
            new Promise((_, reject) => setTimeout(() => reject(new Error('DuckDuckGo timeout')), 8000))
          ])
          .then(ddgResults => ({ duckduckgo: ddgResults }))
          .catch(error => {
            console.warn('DuckDuckGo search failed:', error.message);
            return { duckduckgo: [] };
          })
        );
      }

      // Wait for both searches to complete (or fail)
      const searchResults = await Promise.all(searchPromises);
      
      // Combine results
      searchResults.forEach(result => {
        Object.assign(results, result);
      });

      this.displayResults(results);
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
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&engine=${engine}`, {
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
      return Array.isArray(data.results) ? data.results : data.results[engine] || [];
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error(`${engine} search timed out`);
        throw new Error(`${engine} timeout`);
      }
      
      console.error(`${engine} bot search error:`, error);
      
      // Fallback to mock results if API fails
      if (engine === 'bing') {
        return [
          {
            title: `Bing Results for: ${query}`,
            url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
            snippet: `This is a fallback result from Bing for the query "${query}". The search bot encountered an error but is providing example results.`
          }
        ];
      } else {
        return [
          {
            title: `DuckDuckGo Results for: ${query}`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            snippet: `This is a fallback result from DuckDuckGo for the query "${query}". The search bot encountered an error but is providing example results.`
          }
        ];
      }
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

    if ((!results.bing || results.bing.length === 0) && 
        (!results.duckduckgo || results.duckduckgo.length === 0)) {
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
    icon.innerHTML = engine === 'Bing' ? '🔍' : '🦆';
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
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WebSearchAI();
});