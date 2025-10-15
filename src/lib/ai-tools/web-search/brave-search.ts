// TypeScript interfaces for Brave Search API responses
export interface BraveSearchResult {
	title: string;
	url: string;
	description: string;
	age?: string;
	language: string;
	family_friendly: boolean;
	type: string;
	meta?: {
		favicon?: {
			url: string;
		};
	};
}

export interface BraveSearchResponse {
	type: string;
	query: {
		original: string;
		transformed: string;
	};
	web?: {
		results: BraveSearchResult[];
	};
	news?: {
		results: BraveSearchResult[];
	};
	videos?: {
		results: BraveSearchResult[];
	};
	locations?: {
		results: any[];
	};
	infobox?: {
		results: any[];
	};
}

export interface BraveSearchOptions {
	count?: number;
	country?: string;
	search_lang?: string;
	ui_lang?: string;
	safesearch?: 'off' | 'moderate' | 'strict';
	freshness?: 'pd' | 'pw' | 'pm' | 'py';
	result_filter?: string;
	spellcheck?: boolean;
	text_decorations?: boolean;
}

export interface BraveSearchError {
	status: number;
	message: string;
	details?: string;
}

export class BraveSearchAPI {
	private apiKey: string;
	private baseUrl: string;

	// Static/shared rate limiting across all instances
	private static lastRequestTime = 0;
	private static readonly minRequestInterval = 1100; // 1.1 seconds to be safe (API allows 1 req/sec)
	private static requestQueue: Promise<void> = Promise.resolve();

	constructor(apiKey: string) {
		this.apiKey = apiKey;
		this.baseUrl = 'https://api.search.brave.com/res/v1/web/search';
	}

	private static async waitForRateLimit(): Promise<void> {
		// Chain requests to ensure they're serialized
		BraveSearchAPI.requestQueue = BraveSearchAPI.requestQueue.then(async () => {
			const now = Date.now();
			const timeSinceLastRequest = now - BraveSearchAPI.lastRequestTime;

			if (timeSinceLastRequest < BraveSearchAPI.minRequestInterval) {
				const waitTime = BraveSearchAPI.minRequestInterval - timeSinceLastRequest;
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}

			BraveSearchAPI.lastRequestTime = Date.now();
		});

		await BraveSearchAPI.requestQueue;
	}

	async search(query: string, options: BraveSearchOptions = {}): Promise<BraveSearchResponse> {
		// Wait to respect rate limit (1 request per second) - using static method
		await BraveSearchAPI.waitForRateLimit();

		const params = new URLSearchParams({
			q: query,
			count: options.count?.toString() || '20',
			...(options.country && { country: options.country }),
			...(options.search_lang && { search_lang: options.search_lang }),
			...(options.ui_lang && { ui_lang: options.ui_lang }),
			...(options.safesearch && { safesearch: options.safesearch }),
			...(options.freshness && { freshness: options.freshness }),
			...(options.result_filter && { result_filter: options.result_filter }),
			...(options.spellcheck !== undefined && { spellcheck: options.spellcheck.toString() }),
			...(options.text_decorations !== undefined && { text_decorations: options.text_decorations.toString() }),
		});

		const url = `${this.baseUrl}?${params}`;

		try {
			const response = await fetch(url, {
				headers: {
					'X-Subscription-Token': this.apiKey,
					'Accept': 'application/json',
					'User-Agent': 'RTM-Portal/1.0',
				},
			});

			if (!response.ok) {
				if (response.status === 429) {
					throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return data as BraveSearchResponse;
		} catch (error) {
			console.error('Brave Search API error:', error);
			throw error;
		}
	}

	async getRateLimitInfo() {
		// This would be implemented if needed to check rate limits
		// For now, we'll rely on the headers from search responses
		return null;
	}
}

export function createBraveSearchClient(): BraveSearchAPI {
	const apiKey = process.env.BRAVE_API_KEY;

	if (!apiKey) {
		throw new Error('BRAVE_API_KEY environment variable is not set');
	}

	return new BraveSearchAPI(apiKey);
}