# Web Search AI

A web search application that searches both Bing and DuckDuckGo for real-time results using real web scraping bots.

## Features

- Real web search functionality using actual search engines
- Bot-based search that scrapes live results from Bing and DuckDuckGo
- Multi-engine search support (Bing and DuckDuckGo)
- Responsive web interface
- CORS-safe search through backend proxy
- Rate limiting and proper request headers to respect search engine policies

## Improvements and Bug Fixes

- **Real Search Bots**: Implemented actual web scraping bots that fetch live results from search engines
- **Backend Service**: Added a backend service to handle web scraping and avoid CORS issues
- **Rate Limiting**: Added delays between requests to respect search engine rate limits
- **Error Handling**: Improved error handling and fallback mechanisms
- **Proxy Setup**: Implemented proxy server to route API requests safely
- **Better Result Parsing**: Enhanced result extraction from search engine HTML
- **Performance Optimization**: Improved loading indicators and async handling

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the backend service (in one terminal):
   ```bash
   npm run backend
   ```

3. In another terminal, start the frontend server:
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:8000`

## Architecture

- `real-search.js`: Frontend JavaScript with bot-based search functionality
- `search-backend.js`: Backend service that handles web scraping
- `server.js`: Frontend server with API proxy
- `index.html`: Main HTML interface
- `styles.css`: Styling for the application

## API Endpoints

- `GET /api/search?q={query}&engine={bing|duckduckgo|all}` - Search with specific engine
- `GET /api/search/multi?q={query}` - Search with both engines
- `GET /health` - Health check endpoint

## Technical Details

The application uses a two-server architecture:
1. Frontend server (port 8000) - serves the UI and proxies API requests
2. Backend service (port 3000) - handles web scraping and search functionality

This approach allows the application to:
- Bypass CORS restrictions
- Handle rate limiting appropriately
- Implement proper request headers to mimic real browsers
- Provide reliable search results from actual search engines
- Toggle between search engines
- Responsive design that works on all devices
- Clean, modern UI with loading indicators
- Real-time search results display

## How to Use

1. Open `index.html` in your web browser
2. Enter your search query in the input field
3. Select which search engines to use (Bing and/or DuckDuckGo)
4. Click the "Search" button
5. View results from each search engine in separate panels

## Technical Implementation

The application consists of:

- `index.html` - Main HTML structure
- `styles.css` - Styling and layout
- `script.js` - Compiled JavaScript functionality
- `script.tsx` - Original TypeScript source code

Note: The current implementation uses mock data to simulate search results. In a production environment, you would need to implement actual API calls to Bing and DuckDuckGo search services.

## API Integration Notes

For a real implementation, you would need:

- Bing Search API key from Microsoft Azure Cognitive Services
- DuckDuckGo Instant Answer API (or web scraping solution respecting their terms)

## Browser Compatibility

The application uses modern JavaScript features (async/await, fetch API) and should work in all modern browsers (Chrome, Firefox, Safari, Edge).

## License

This project is available under the MIT License (see LICENSE file).