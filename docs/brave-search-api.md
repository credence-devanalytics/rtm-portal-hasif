# Brave Search API Documentation

## Overview

The Brave Web Search API is a REST API that allows developers to query Brave Search and retrieve search results from the web. It provides access to Brave's privacy-focused search engine capabilities, enabling integration of search functionality into applications, tools, and services.

### Key Features
- **Privacy-focused search** with user privacy protection
- **Multiple result types**: web, news, videos, locations, and infoboxes
- **Customizable search parameters** including location, language, and freshness
- **Rate limiting and quota management** for fair usage
- **RESTful API design** for easy integration

## Getting Started

### Authentication

To use the Brave Search API, you need an API key:

1. Visit the [Brave API Dashboard](https://api-dashboard.search.brave.com/)
2. Navigate to the "API Keys" section
3. Generate a new API key
4. Include the key in your requests using the `X-Subscription-Token` header

### Endpoint

**Base URL**: `https://api.search.brave.com/res/v1/web/search`

### Basic Request

```bash
curl -X GET "https://api.search.brave.com/res/v1/web/search?q=your+query" \
  -H "X-Subscription-Token: YOUR_API_KEY" \
  -H "Accept: application/json"
```

## API Reference

### Request Headers

#### Required Headers

| Header | Description | Example |
|--------|-------------|---------|
| `X-Subscription-Token` | Your API key for authentication | `X-Subscription-Token: your-api-key-here` |

#### Optional Headers

| Header | Description | Example |
|--------|-------------|---------|
| `Accept` | Response format preference | `Accept: application/json` |
| `Accept-Encoding` | Compression preferences | `Accept-Encoding: gzip, deflate` |
| `Api-Version` | API version (if applicable) | `Api-Version: v1` |
| `Cache-Control` | Cache control directives | `Cache-Control: no-cache` |
| `User-Agent` | Client identification | `User-Agent: MyApp/1.0` |
| `X-Loc-Lat` | Latitude for location-based results | `X-Loc-Lat: 37.7749` |
| `X-Loc-Long` | Longitude for location-based results | `X-Loc-Long: -122.4194` |

### Query Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `q` | Yes | Search query string | `q=brave+browser` |
| `country` | No | Country code for regional results | `country=US` |
| `search_lang` | No | Language of search results | `search_lang=en` |
| `ui_lang` | No | UI language for responses | `ui_lang=en` |
| `count` | No | Number of results (default: 20, max: 50) | `count=10` |
| `offset` | No | Pagination offset | `offset=20` |
| `safesearch` | No | Safe search level (off, moderate, strict) | `safesearch=moderate` |
| `freshness` | No | Result recency (pd, pw, pm, py) | `freshness=pw` |
| `result_filter` | No | Filter result types | `result_filter=news,web` |
| `spellcheck` | No | Enable spell checking | `spellcheck=true` |
| `text_decorations` | No | Enable text decorations | `text_decorations=true` |

#### Freshness Values
- `pd`: Past day
- `pw`: Past week
- `pm`: Past month
- `py`: Past year

#### Safesearch Values
- `off`: No filtering
- `moderate`: Moderate filtering
- `strict`: Strict filtering

### Response Structure

The API returns a JSON response with the following structure:

```json
{
  "type": "search",
  "query": {
    "original": "original query",
    "transformed": "processed query"
  },
  "web": {
    "results": [
      {
        "title": "Result title",
        "url": "https://example.com",
        "description": "Result description",
        "age": "2 days ago",
        "language": "en",
        "family_friendly": true,
        "type": "web",
        "meta": {
          "favicon": {
            "url": "https://example.com/favicon.ico"
          }
        }
      }
    ]
  },
  "news": {
    "results": [...]
  },
  "videos": {
    "results": [...]
  },
  "locations": {
    "results": [...]
  },
  "infobox": {
    "results": [...]
  }
}
```

### Response Headers

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Total request limit for the time window |
| `X-RateLimit-Remaining` | Remaining requests in current time window |
| `X-RateLimit-Reset` | Time when the rate limit resets (Unix timestamp) |

## Code Examples

### Basic Search Example

```javascript
const apiKey = 'YOUR_API_KEY';
const query = 'artificial intelligence trends';

async function searchBrave(query) {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Subscription-Token': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Usage
searchBrave(query)
  .then(results => {
    console.log('Search results:', results.web.results);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Advanced Search with Filters

```javascript
async function advancedSearch(query, options = {}) {
  const params = new URLSearchParams({
    q: query,
    count: options.count || 20,
    freshness: options.freshness || 'pw',
    safesearch: options.safesearch || 'moderate',
    result_filter: options.resultFilter || 'web,news',
    country: options.country || 'US',
    search_lang: options.language || 'en'
  });

  const url = `https://api.search.brave.com/res/v1/web/search?${params}`;

  const response = await fetch(url, {
    headers: {
      'X-Subscription-Token': apiKey,
      'Accept': 'application/json'
    }
  });

  return response.json();
}
```

### Example: Finding Trending Artists This Week

```javascript
async function findTrendingArtistsThisWeek() {
  const query = 'trending artists music popular new releases this week';

  const searchOptions = {
    freshness: 'pw', // Past week
    count: 20,
    resultFilter: 'news,web',
    country: 'US',
    safesearch: 'moderate'
  };

  try {
    const results = await advancedSearch(query, searchOptions);

    // Process results to identify trending artists
    const trendingArtists = [];

    // Combine web and news results
    const allResults = [
      ...(results.web?.results || []),
      ...(results.news?.results || [])
    ];

    // Extract artist mentions and analyze trends
    for (const result of allResults) {
      // Look for patterns that indicate trending artists
      const title = result.title.toLowerCase();
      const description = result.description.toLowerCase();

      // Keywords that might indicate trending artists
      const trendingKeywords = [
        'trending', 'viral', 'breakout', 'rising', 'popular',
        'chart', 'billboard', 'spotify', 'music', 'artist'
      ];

      const hasTrendingKeywords = trendingKeywords.some(keyword =>
        title.includes(keyword) || description.includes(keyword)
      );

      if (hasTrendingKeywords) {
        trendingArtists.push({
          title: result.title,
          url: result.url,
          description: result.description,
          age: result.age,
          source: result.type
        });
      }
    }

    // Sort by relevance (you might want to implement more sophisticated sorting)
    const sortedArtists = trendingArtists.sort((a, b) => {
      // Prioritize recent results and news sources
      const scoreA = (a.source === 'news' ? 2 : 1) +
                     (a.age && a.age.includes('hour') ? 2 : 1);
      const scoreB = (b.source === 'news' ? 2 : 1) +
                     (b.age && b.age.includes('hour') ? 2 : 1);
      return scoreB - scoreA;
    });

    return {
      query: query,
      totalResults: sortedArtists.length,
      trendingArtists: sortedArtists.slice(0, 10), // Top 10
      searchMetadata: {
        freshest: 'pw',
        totalAvailable: allResults.length,
        sources: ['web', 'news']
      }
    };

  } catch (error) {
    console.error('Failed to find trending artists:', error);
    throw error;
  }
}

// Usage example
findTrendingArtistsThisWeek()
  .then(analysis => {
    console.log('Trending Artists This Week:');
    console.log(`Found ${analysis.totalResults} trending results`);

    analysis.trendingArtists.forEach((artist, index) => {
      console.log(`\n${index + 1}. ${artist.title}`);
      console.log(`   ${artist.description}`);
      console.log(`   Age: ${artist.age} | Source: ${artist.source}`);
      console.log(`   URL: ${artist.url}`);
    });
  })
  .catch(error => {
    console.error('Error analyzing trending artists:', error);
  });
```

### Python Example

```python
import requests
import json
from urllib.parse import urlencode

class BraveSearchAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.search.brave.com/res/v1/web/search"

    def search(self, query, **kwargs):
        params = {'q': query}
        params.update(kwargs)

        headers = {
            'X-Subscription-Token': self.api_key,
            'Accept': 'application/json'
        }

        response = requests.get(
            self.base_url,
            params=params,
            headers=headers
        )

        response.raise_for_status()
        return response.json()

    def find_trending_topics(self, topic, timeframe='pw'):
        query = f"trending {topic} popular latest"

        results = self.search(
            query,
            freshness=timeframe,
            count=20,
            result_filter='news,web'
        )

        # Process and analyze results
        trending_items = []

        for result in results.get('web', {}).get('results', []):
            if any(keyword in result['title'].lower()
                   for keyword in ['trending', 'popular', 'viral']):
                trending_items.append({
                    'title': result['title'],
                    'url': result['url'],
                    'description': result['description'],
                    'age': result.get('age', 'Unknown')
                })

        return trending_items

# Usage
api = BraveSearchAPI('YOUR_API_KEY')
trending_artists = api.find_trending_topics('music artists')
print(json.dumps(trending_artists, indent=2))
```

## Error Handling

### Common HTTP Status Codes

| Status Code | Description | Action |
|-------------|-------------|--------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Check query parameters and syntax |
| 401 | Unauthorized | Verify API key is valid |
| 429 | Too Many Requests | Implement rate limiting, check `X-RateLimit-Reset` |
| 500 | Internal Server Error | Try again later or contact support |

### Rate Limiting

Monitor these response headers to manage rate limits:

```javascript
function checkRateLimits(response) {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  console.log(`Rate limit: ${remaining}/${limit} requests remaining`);
  console.log(`Rate limit resets at: ${new Date(reset * 1000).toLocaleString()}`);

  if (remaining < 5) {
    console.warn('Approaching rate limit. Consider implementing backoff.');
  }
}
```

## Best Practices

### 1. Efficient Query Construction
- Use specific, targeted queries
- Leverage the `freshness` parameter for time-sensitive searches
- Apply `result_filter` to only retrieve needed result types

### 2. Rate Limit Management
- Monitor `X-RateLimit-*` headers
- Implement exponential backoff for rate-limited requests
- Cache results when appropriate to reduce API calls

### 3. Error Handling
- Always check HTTP status codes
- Implement retry logic for transient failures
- Log errors with sufficient context for debugging

### 4. Performance Optimization
- Use appropriate `count` values to avoid over-fetching
- Implement pagination with `offset` for large result sets
- Consider compression with `Accept-Encoding: gzip`

### 5. Security
- Store API keys securely (environment variables, secret management)
- Never expose API keys in client-side code
- Use HTTPS for all API requests

### 6. Data Processing
- Validate response structure before processing
- Handle missing or null fields gracefully
- Consider the age/freshness of results in your application logic

## Integration Tips

### Setting Up Environment Variables

```bash
# .env file
BRAVE_API_KEY=your_api_key_here
BRAVE_API_BASE_URL=https://api.search.brave.com/res/v1/web/search
```

### Sample Project Structure

```
src/
├── api/
│   └── brave-search.js      # API client implementation
├── services/
│   └── search-service.js    # Business logic
└── utils/
    └── rate-limiter.js      # Rate limiting utilities
```

### Testing Your Integration

```javascript
// Test function to verify API connectivity
async function testBraveAPI() {
  try {
    const result = await searchBrave('test query');
    console.log('✅ API test successful');
    console.log(`Found ${result.web?.results?.length || 0} web results`);
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    return false;
  }
}
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check that your API key is correct
   - Ensure the key is passed in the `X-Subscription-Token` header

2. **429 Too Many Requests**
   - Implement proper rate limiting
   - Check the `X-RateLimit-Reset` header to know when you can make requests again

3. **Empty Results**
   - Verify your query syntax
   - Try different parameters like `freshness` or `country`
   - Check if your query is too restrictive

4. **Slow Responses**
   - Reduce the `count` parameter
   - Use `result_filter` to limit result types
   - Implement proper caching

### Getting Support

- Check the [Brave API Dashboard](https://api-dashboard.search.brave.com/) for updates
- Review the official documentation for any API changes
- Monitor rate limit headers to understand usage patterns

This documentation provides a comprehensive guide for integrating the Brave Search API into your applications. The API offers powerful search capabilities with privacy-focused results, making it suitable for various use cases from basic search functionality to complex trend analysis.