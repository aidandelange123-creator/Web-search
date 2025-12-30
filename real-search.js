// Define interfaces (converted to JavaScript)
// Main search class with real API integration and bot-based search
class WebSearchAI {
  constructor() {
    this.searchForm = document.getElementById('search-form');
    this.searchQueryInput = document.getElementById('search-query');
    this.searchBingCheckbox = document.getElementById('search-bing');
    this.searchDuckDuckGoCheckbox = document.getElementById('search-duckduckgo');
    this.searchButton = document.getElementById('search-button');
    this.loadingElement = document.getElementById('loading');
    this.resultsContainer = document.getElementById('results-container');

    this.initEventListeners();
  }

  initEventListeners() {
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.performSearch();
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
      const results = {};

      if (searchBing) {
        results.bing = await this.searchWithBot(query, 'bing');
      }

      if (searchDuckDuckGo) {
        results.duckduckgo = await this.searchWithBot(query, 'duckduckgo');
      }

      this.displayResults(results);
    } catch (error) {
      console.error('Search error:', error);
      this.displayError('An error occurred while searching. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  async searchBing(query) {
    // Using the Bing Search API with a proxy to avoid CORS issues
    // In production, you would need to implement server-side proxy or use proper API
    try {
      // For demo purposes, we'll use the DuckDuckGo API which is more permissive
      // In a real implementation, you would use the actual Bing Search API
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      
      if (!response.ok) {
        throw new Error(`Bing API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data to match our expected format
      const results = [];
      
      // Add the main result if available
      if (data.AbstractText) {
        results.push({
          title: data.Heading || `Bing Results for: ${query}`,
          url: data.AbstractURL || `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
          snippet: data.AbstractText
        });
      }
      
      // Add related topics if available
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 2).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.substring(0, 60) + (topic.Text.length > 60 ? '...' : ''),
              url: topic.FirstURL,
              snippet: topic.Text
            });
          }
        });
      }
      
      // If we don't have any results from the API, return mock results
      if (results.length === 0) {
        results.push({
          title: `Bing Results for: ${query}`,
          url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
          snippet: `This is a simulated result from Bing for the query "${query}". The Bing Search API would return actual search results with titles, URLs, and snippets.`
        });
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return results;
    } catch (error) {
      console.error('Bing search error:', error);
      return [];
    }
  }

  async searchDuckDuckGo(query) {
    // DuckDuckGo does not have an official public API that returns structured results
    // We can use the Instant Answer API for some queries, but it's limited
    // For full search results, we'll implement a custom search bot
    try {
      // Using DuckDuckGo Instant Answer API (limited results)
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      
      if (!response.ok) {
        throw new Error(`DuckDuckGo API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process the data to match our expected format
      const results = [];
      
      // Add the main result if available
      if (data.AbstractText) {
        results.push({
          title: data.Heading || `DuckDuckGo Results for: ${query}`,
          url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: data.AbstractText
        });
      }
      
      // Add related topics if available
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.slice(0, 2).forEach(topic => {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.substring(0, 60) + (topic.Text.length > 60 ? '...' : ''),
              url: topic.FirstURL,
              snippet: topic.Text
            });
          }
        });
      }
      
      // If we don't have any results from the API, return mock results
      if (results.length === 0) {
        results.push({
          title: `DuckDuckGo Results for: ${query}`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: `This is a simulated result from DuckDuckGo for the query "${query}". The DuckDuckGo Instant Answer API provided limited results, so here are some example results.`
        });
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      return results;
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      // Fallback to mock results if API fails
      return [
        {
          title: `DuckDuckGo Results for: ${query}`,
          url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: `Error retrieving results from DuckDuckGo API. This is a fallback result for the query "${query}".`
        }
      ];
    }
  }

  // New bot-based search implementation for real web search
  async searchWithBot(query, engine) {
    // Create a custom search bot that fetches results from our backend service
    // This avoids CORS issues and allows for proper web scraping
    
    try {
      // Call our backend service to perform the search
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&engine=${engine}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Return the search results from the backend
      return Array.isArray(data.results) ? data.results : data.results[engine] || [];
    } catch (error) {
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
    url.textContent = result.url;

    const snippet = document.createElement('p');
    snippet.className = 'result-snippet';
    snippet.textContent = result.snippet;

    resultDiv.appendChild(title);
    resultDiv.appendChild(url);
    resultDiv.appendChild(snippet);

    return resultDiv;
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