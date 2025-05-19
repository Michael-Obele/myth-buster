// Imports for SvelteKit server-side functionality and environment variables
import type { Actions } from './$types';
import { PERPLEXITY_API_KEY } from '$env/static/private';
import { building } from '$app/environment';

// Base URL for the Perplexity AI chat completions API
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// System prompt to guide the AI's behavior and response format
const SYSTEM_PROMPT = `You are a myth-busting expert who analyzes statements to determine their accuracy.

For each statement provided, follow these steps:
1. Analyze whether the statement is true, false, or inconclusive based on current evidence
2. Provide a detailed explanation of your verdict, with special emphasis on debunking if the statement is false
3. Include factual information that corrects any misconceptions
4. Cite reliable sources to support your explanation
5. If known, briefly explain the origin of this myth or misconception
6. If applicable, provide a related myth or misconception
7. If known, briefly explain why people believe this myth or misconception

Return your response as a JSON object with the following structure:
{
  "verdict": "true" | "false" | "inconclusive",
  "explanation": "A detailed explanation of why the statement is true, false, or inconclusive",
  "citations": [
    {
      "title": "Source title",
      "url": "URL to the source"
    }
  ],
  "mythOrigin": "Brief explanation of where this myth originated (if applicable)",
  "relatedMyth": "A related myth or misconception (if applicable)",
  "whyBelieved": "Brief explanation of why people believe this myth (if applicable)"
}

Always format your response as a JSON object within a markdown code block.`;

// Type definition for cached responses
type CachedResponse = {
	timestamp: number;
	response: any; // Store the full response object
	expiresAt: number; // Timestamp when the cache entry expires
};

/**
 * Type definition for the result of a myth verification.
 */
type MythVerificationResult = {
	success: boolean;
	cached?: boolean; // Only present if using cache
	myth?: string; // Present in success response
	error?: string; // Present in error response
	data?: {
		// Present in success or some error responses
		answer?: any; // Raw API response
		explanation: string;
		citations: { title: string; url: string }[];
		mythOrigin: string;
		relatedMyth: string; // New field
		whyBelieved: string; // New field
		verdict: 'true' | 'false' | 'inconclusive';
	};
};
// In-memory cache for storing AI responses
// Using a Map for efficient key-value storage
// The cache is not initialized during the SvelteKit build process
const responseCache: Map<string, CachedResponse> = !building ? new Map() : new Map();

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Retrieves a cached response if it exists and is still valid.
 * @param key The cache key (typically the lowercased, trimmed myth string).
 * @returns The cached response object or null if no valid entry is found.
 */
function getCachedResponse(key: string): any | null {
	const now = Date.now();
	const cachedData = responseCache.get(key);

	// If no data is found for the key, return null
	if (!cachedData) {
		return null;
	}

	// Check if the cache entry has expired
	if (now >= cachedData.expiresAt) {
		// Remove the expired cache entry
		responseCache.delete(key);
		return null;
	}

	// Return the valid cached response
	return cachedData.response;
}

/**
 * Caches a response with an expiration timestamp.
 * @param key The cache key (typically the lowercased, trimmed myth string).
 * @param response The response object to cache.
 */
function cacheResponse(key: string, response: any): void {
	const now = Date.now();
	responseCache.set(key, {
		timestamp: now,
		response,
		expiresAt: now + CACHE_EXPIRATION_MS
	});
}

// Import for SvelteKit's server-side load function type
import type { PageServerLoad } from './$types';

/**
 * Core logic for verifying a myth using the Perplexity API.
 * This function is called by both the load function and the verifyMyth action.
 * @param myth The myth string to verify.
 * @returns A structured response object containing the verification result.
 */
async function verifyMythLogic(myth: string): Promise<MythVerificationResult> {
	// Validate the myth input (basic check, more robust validation might be needed)
	if (typeof myth !== 'string' || !myth.trim()) {
		// Although the load function handles the initial check,
		// this provides a safeguard if called directly with invalid input.
		return { success: false, error: 'Myth is required.' };
	}

	console.log('Verifying myth:', myth);

	// Retrieve the API key from environment variables
	const apiKey = PERPLEXITY_API_KEY;
	console.log('Using API Key:', apiKey ? '[REDACTED]' : 'MISSING');

	// Check if the API key is available
	if (!apiKey) {
		console.error('Missing Perplexity API key on server.');
		return {
			success: false,
			error: 'Missing Perplexity API key on server.',
			data: {
				verdict: 'inconclusive',
				explanation: 'Server configuration error: API key is missing.',
				citations: [],
				mythOrigin: '',
				relatedMyth: '',
				whyBelieved: ''
			}
		};
	}

	// Generate a cache key from the myth string
	const cacheKey = myth.trim().toLowerCase();

	// Check if a cached response exists and is valid for this myth
	const cachedResponse = getCachedResponse(cacheKey);

	// If a valid cached response is found, return it immediately
	if (cachedResponse) {
		console.log('Using cached response for myth');
		// Return the cached response, explicitly setting 'cached' flag to true
		return {
			...cachedResponse,
			cached: true
		};
	}

	// Prepare the payload for the Perplexity API request
	const payload = {
		model: 'sonar', // Specify the AI model to use
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT }, // Include the system prompt
			{ role: 'user', content: myth } // Include the user's myth statement
		]
	};
	console.log('Payload to Perplexity:', JSON.stringify(payload, null, 2));

	try {
		// Make the POST request to the Perplexity API
		const resp = await fetch(PERPLEXITY_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${apiKey}` // Include the API key in the Authorization header
			},
			body: JSON.stringify(payload) // Send the payload as a JSON string
		});

		console.log('Perplexity API status:', resp.status);

		// Check if the API response indicates an error
		if (!resp.ok) {
			console.error(`API returned error status: ${resp.status}`);

			// Return a structured error response for the frontend
			return {
				success: false,
				error: `API returned status ${resp.status}`,
				data: {
					verdict: 'inconclusive',
					explanation:
						'Unable to verify this myth due to an API error. Please try again later or contact support if the issue persists.',
					citations: [],
					mythOrigin: '',
					relatedMyth: '', // Include new fields in error response
					whyBelieved: '' // Include new fields in error response
				}
			};
		}

		// Parse the JSON response from the API
		let answer;
		try {
			answer = await resp.json();
		} catch (jsonError) {
			console.error('Failed to parse JSON response:', jsonError);

			// Return a structured error response for JSON parsing issues
			return {
				success: false,
				error: 'Invalid response from API',
				data: {
					verdict: 'inconclusive',
					explanation:
						'Unable to verify this myth due to an error processing the response. Please try again later.',
					citations: [],
					mythOrigin: '',
					relatedMyth: '', // Include new fields in error response
					whyBelieved: '' // Include new fields in error response
				}
			};
		}

		console.log('Perplexity API response:', JSON.stringify(answer, null, 2));

		// Process the API response to extract and format the data for the frontend
		let verdict: 'true' | 'false' | 'inconclusive' = 'inconclusive';
		let explanation = '';
		let citations = [];
		let mythOrigin = '';
		let relatedMyth = ''; // Initialize new field
		let whyBelieved = ''; // Initialize new field

		try {
			// Extract the main content and citations from the API response
			const content = answer.choices?.[0]?.message?.content;
			console.log('Raw content from Perplexity:', content);
			console.log('Citations from Perplexity:', answer.citations);

			// Format citations provided directly by the API
			const apiCitations =
				answer.citations?.map((url: string, index: number) => ({
					title: `Source ${index + 1}`,
					url
				})) || [];

			// If content exists, attempt to parse the embedded JSON
			if (content) {
				const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
				if (jsonMatch && jsonMatch[1]) {
					const parsedContent = JSON.parse(jsonMatch[1]);
					console.log('Parsed content:', parsedContent);

					// Extract verdict, explanation, myth origin, related myth, and why believed from parsed JSON
					if (parsedContent.verdict === true || parsedContent.verdict === 'true') {
						verdict = 'true';
					} else if (parsedContent.verdict === false || parsedContent.verdict === 'false') {
						verdict = 'false';
					}

					explanation = parsedContent.explanation || '';
					mythOrigin = parsedContent.mythOrigin || '';
					relatedMyth = parsedContent.relatedMyth || ''; // Extract new field
					whyBelieved = parsedContent.whyBelieved || ''; // Extract new field

					// Get citations from the parsed JSON content
					const jsonCitations = parsedContent.citations || [];

					// Merge citations from both API and parsed JSON, removing duplicates by URL
					const citationMap = new Map();

					// Add JSON citations first (they may have titles)
					jsonCitations.forEach((citation: { title: string; url: string }) => {
						citationMap.set(citation.url, citation);
					});

					// Then add API citations, but only if not already in the map
					apiCitations.forEach((citation: { title: string; url: string }) => {
						if (!citationMap.has(citation.url)) {
							citationMap.set(citation.url, citation);
						}
					});

					citations = Array.from(citationMap.values());
				}
			}
		} catch (error) {
			console.error('Error extracting content:', error);
		}

		console.log('Final verdict being sent to frontend:', verdict);

		// Structure the final response data for the frontend
		const responseData = {
			success: true,
			cached: false, // Indicate this is not from cache
			myth, // Include the original myth
			data: {
				answer, // Include the raw API response (optional, for debugging/completeness)
				explanation,
				citations,
				mythOrigin,
				relatedMyth, // Include new field
				whyBelieved, // Include new field
				verdict
			}
		};

		// Cache the successful response
		cacheResponse(cacheKey, responseData);

		console.log('Returning response data:', responseData);

		// Return the structured response data
		return responseData;
	} catch (err) {
		console.error('Failed to contact Perplexity API:', err);
		// Return a structured error response for API contact failure
		return {
			success: false,
			error: 'Failed to contact Perplexity API',
			data: {
				verdict: 'inconclusive',
				explanation:
					'Unable to verify this myth due to an error contacting the API. Please try again later or contact support if the issue persists.',
				citations: [],
				mythOrigin: '',
				relatedMyth: '', // Include new fields in error response
				whyBelieved: '' // Include new fields in error response
			}
		};
	}
}

// The load function runs on the server before the page is rendered.
// It's used here to check for a 'myth' query parameter and potentially
// fetch and return myth verification data directly on page load.
export const load: PageServerLoad = async ({ url }): Promise<MythVerificationResult | {}> => {
	const myth = url.searchParams.get('myth');

	// If a myth query parameter exists, verify the myth and return the result
	if (myth) {
		console.log('Myth found in URL, verifying:', myth);
		return await verifyMythLogic(myth);
	}

	// If no myth query parameter, return an empty object
	return {};
};

// SvelteKit actions for handling form submissions (POST requests)
export const actions: Actions = {
	// Action to verify a myth using the Perplexity API
	verifyMyth: async ({
		request
	}): Promise<MythVerificationResult | { status: number; body: { error: string } }> => {
		// Extract form data from the request
		const data = await request.formData();
		const myth = data.get('myth');

		// Validate the myth input
		if (typeof myth !== 'string' || !myth.trim()) {
			return { status: 400, body: { error: 'Myth is required.' } };
		}

		console.log('Received myth for action:', myth);

		// Call the core myth verification logic
		return await verifyMythLogic(myth);
	},

	// Action to reset the form data (used for clearing input)
	reset: async () => {
		console.log('Reset action called - clearing form data');
		responseCache.clear(); // Clear the cache
		return { success: true };
	},

	// Action to clear the in-memory response cache
	clearCache: () => {
		console.log('Clearing response cache');
		responseCache.clear(); // Clear all entries from the cache Map
		return { success: true, message: 'Cache cleared successfully' };
	}
};
