# Brave Search Tool

This directory contains the Brave Search API implementation for the AI Social Media chat feature.

## Files

- `brave-search.ts` - Main Brave Search API client with TypeScript interfaces
- `test-brave-search.ts` - Test utility for the Brave Search functionality
- `README.md` - This documentation file

## Usage

The Brave Search tool is integrated into the AI Social Media chat route and can be used by asking the AI to search the web for current information.

### Environment Setup

You need to set the `BRAVE_API_KEY` environment variable in your `.env` file:

```env
BRAVE_API_KEY=your_brave_search_api_key_here
```

### Tool Parameters

The Brave Search tool accepts the following parameters:

- `query` (required): The search query string
- `freshness` (optional): Result freshness - `pd` (past day), `pw` (past week), `pm` (past month), `py` (past year)
- `count` (optional): Number of results to return (1-20, default: 10)
- `result_filter` (optional): Filter result types (web, news, videos, locations, infobox)

### Example Usage

Users can ask the AI things like:

- "Search for the latest news about artificial intelligence"
- "What are the current trends in web development from the past week?"
- "Find recent articles about climate change from the past month"
- "Search for information about the latest technology releases"

The AI will automatically use the Brave Search tool to find current information and display the results in a card format.

## Implementation Details

### API Client

The `BraveSearchAPI` class handles:
- HTTP requests to the Brave Search API
- Authentication via X-Subscription-Token header
- Error handling and response processing
- TypeScript interfaces for type safety

### Tool Integration

The tool is integrated into the social media chat route (`src/app/(ai)/api/chat/social-media/route.ts`) with:
- Zod schema validation for input parameters
- Loading states during search execution
- Automatic result summarization using GPT-4o-mini
- Error handling for API failures

### Response Processing

Search results are:
1. Combined from web and news sources
2. Processed to extract the most relevant information
3. Summarized using AI to provide concise insights
4. Displayed in the chat interface as a card

## Error Handling

The tool handles various error scenarios:
- Missing API key environment variable
- API rate limiting
- Network failures
- Empty search results
- Invalid search parameters

## Testing

To test the Brave Search functionality:

```bash
# Run from a server-side context
node -e "import('./src/lib/ai-tools/web-search/test-brave-search.js').then(m => m.default())"
```

Note: Testing requires a valid `BRAVE_API_KEY` environment variable and server-side execution.