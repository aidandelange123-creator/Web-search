# Web Search AI v2.0

A modern web search application that searches across Bing, Google, and DuckDuckGo for real-time results with enhanced features and improved performance.

## Features

- **Multi-engine search**: Search across Bing, Google, and DuckDuckGo simultaneously
- **Search history**: Local storage-based search history with clear functionality
- **Responsive design**: Works on desktop, tablet, and mobile devices
- **Rate limiting**: Protection against excessive requests
- **Security**: Helmet.js for security headers
- **Logging**: Winston-based logging for debugging and monitoring
- **Performance optimization**: Optimized for slow connections with compression and caching
- **Error handling**: Graceful fallbacks when search engines fail

## Project Structure

```
/workspace/
├── backend/
│   └── src/
│       ├── server.js          # Frontend proxy server with security features
│       └── search-engine.js   # Backend search engine with scraping capabilities
├── frontend/
│   └── src/
│       ├── index.html         # Main HTML file
│       ├── script.js          # Enhanced frontend JavaScript
│       └── styles.css         # Responsive CSS styles
├── shared/                   # Shared utilities and constants
└── package.json              # Project dependencies and scripts
```

## New Features Added

1. **Google Search Support**: Added Google search engine scraping capability
2. **Search History**: Local storage-based search history with UI controls
3. **Enhanced Security**: Rate limiting, Helmet.js security headers, and CORS protection
4. **Logging**: Comprehensive Winston-based logging for both frontend and backend
5. **Responsive Layout**: Improved layout with search results and history in a side-by-side view
6. **Performance Improvements**: Better error handling, timeout management, and fallback mechanisms
7. **Additional Scripts**: Added development, testing, and linting scripts

## Installation

```bash
npm install
```

## Usage

### Development
```bash
# Run both frontend and backend in development mode
npm run dev

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

### Production
```bash
# Start the application
npm start
```

## API Endpoints

### Backend (Search Engine)
- `GET /search?q={query}&engine={bing|duckduckgo|google|all}` - Single search
- `GET /search/multi?q={query}` - Multi-engine search
- `GET /health` - Health check
- `POST /history` - Save search history
- `GET /history` - Get search history

### Frontend Proxy
- `GET /` - Main application
- `GET /health` - Health check
- `GET /api/status` - API status
- All `/api/*` routes are proxied to the backend

## Technologies Used

- **Backend**: Node.js, Express.js, Axios, Cheerio (for web scraping)
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Security**: Helmet.js, Rate Limiter Flexible
- **Logging**: Winston
- **Development**: Nodemon, Concurrently, ESLint, Prettier