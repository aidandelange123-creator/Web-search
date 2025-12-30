# Web Search AI

A web search application that searches both Bing and DuckDuckGo for real-time results. The application is built with HTML, CSS, JavaScript, and TypeScript.

## Features

- Search across both Bing and DuckDuckGo simultaneously
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