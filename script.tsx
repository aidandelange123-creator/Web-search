// Define TypeScript interfaces
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResults {
  bing?: SearchResult[];
  duckduckgo?: SearchResult[];
}

// Main search class
class WebSearchAI {
  private searchForm: HTMLFormElement;
  private searchQueryInput: HTMLInputElement;
  private searchBingCheckbox: HTMLInputElement;
  private searchDuckDuckGoCheckbox: HTMLInputElement;
  private searchButton: HTMLButtonElement;
  private loadingElement: HTMLElement;
  private resultsContainer: HTMLElement;

  constructor() {
    this.searchForm = document.getElementById('search-form') as HTMLFormElement;
    this.searchQueryInput = document.getElementById('search-query') as HTMLInputElement;
    this.searchBingCheckbox = document.getElementById('search-bing') as HTMLInputElement;
    this.searchDuckDuckGoCheckbox = document.getElementById('search-duckduckgo') as HTMLInputElement;
    this.searchButton = document.getElementById('search-button') as HTMLButtonElement;
    this.loadingElement = document.getElementById('loading') as HTMLElement;
    this.resultsContainer = document.getElementById('results-container') as HTMLElement;

    this.initEventListeners();
  }

  private initEventListeners(): void {
    this.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.performSearch();
    });
  }

  private async performSearch(): Promise<void> {
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
      const results: SearchResults = {};

      if (searchBing) {
        results.bing = await this.searchBing(query);
      }

      if (searchDuckDuckGo) {
        results.duckduckgo = await this.searchDuckDuckGo(query);
      }

      this.displayResults(results);
    } catch (error) {
      console.error('Search error:', error);
      this.displayError('An error occurred while searching. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  private async searchBing(query: string): Promise<SearchResult[]> {
    // Note: In a real implementation, this would call the Bing Search API
    // For demonstration purposes, we'll simulate results
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is a simulation - in a real app you would use the Bing Search API
      // with a proper API key
      return this.mockSearchResults('Bing');
    } catch (error) {
      console.error('Bing search error:', error);
      return [];
    }
  }

  private async searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    // Note: In a real implementation, this would use DuckDuckGo's API
    // For demonstration purposes, we'll simulate results
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // This is a simulation - in a real app you would use DuckDuckGo's API
      return this.mockSearchResults('DuckDuckGo');
    } catch (error) {
      console.error('DuckDuckGo search error:', error);
      return [];
    }
  }

  private mockSearchResults(engine: string): SearchResult[] {
    // Mock results for demonstration
    return [
      {
        title: `Example Result 1 from ${engine}`,
        url: `https://${engine.toLowerCase()}.com/result1`,
        snippet: `This is a sample search result from ${engine}. It demonstrates how the search results would appear in the interface.`
      },
      {
        title: `Example Result 2 from ${engine}`,
        url: `https://${engine.toLowerCase()}.com/result2`,
        snippet: `Another example result showing the layout and design of the search results from ${engine}.`
      },
      {
        title: `Example Result 3 from ${engine}`,
        url: `https://${engine.toLowerCase()}.com/result3`,
        snippet: `A third example search result from ${engine} to show how multiple results are displayed.`
      }
    ];
  }

  private displayResults(results: SearchResults): void {
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

  private renderSearchEngineResults(engine: string, results: SearchResult[]): void {
    const engineResultsDiv = document.createElement('div');
    engineResultsDiv.className = 'search-engine-results';

    const header = document.createElement('div');
    header.className = `search-engine-header ${engine.toLowerCase()}-header`;
    
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

  private createResultElement(result: SearchResult): HTMLElement {
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

  private displayError(message: string): void {
    this.resultsContainer.innerHTML = `<div class="no-results">${message}</div>`;
  }

  private showLoading(): void {
    this.loadingElement.classList.remove('hidden');
  }

  private hideLoading(): void {
    this.loadingElement.classList.add('hidden');
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WebSearchAI();
});