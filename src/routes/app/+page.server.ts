// Imports for SvelteKit server-side functionality and environment variables
import type { Actions } from './$types';
// @ts-expect-error editor error
import { PERPLEXITY_API_KEY } from '$env/static/private';
import { building } from '$app/environment';
import type {
	MythVerificationResult,
	LensResult,
	SourceAnalysisResult,
	SynthesisResult
} from '$lib/types'; // Import from shared types

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
	console.log(`[getCachedResponse] Key: "${key}", Found in cache map: ${!!cachedData}`);

	// If no data is found for the key, return null
	if (!cachedData) {
		return null;
	}

	console.log(`[getCachedResponse] Key: "${key}", Now: ${now}, ExpiresAt: ${cachedData.expiresAt}, IsExpired: ${now >= cachedData.expiresAt}`);
	// Check if the cache entry has expired
	if (now >= cachedData.expiresAt) {
		// Remove the expired cache entry
		responseCache.delete(key);
		console.log(`[getCachedResponse] Key: "${key}", Deleted expired entry.`);
		return null;
	}

	// Return the valid cached response
	console.log(`[getCachedResponse] Key: "${key}", Returning valid cached response.`);
	return cachedData.response;
}

/**
 * Caches a response with an expiration timestamp.
 * @param key The cache key (typically the lowercased, trimmed myth string).
 * @param response The response object to cache.
 */
function cacheResponse(key: string, response: any): void {
	const now = Date.now();
	const expiresAt = now + CACHE_EXPIRATION_MS;
	responseCache.set(key, {
		timestamp: now,
		response,
		expiresAt
	});
	console.log(`[cacheResponse] Caching response for key: "${key}", ExpiresAt: ${expiresAt}`);
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
	console.log('[verifyMythLogic] Attempting to get from cache with key:', cacheKey);

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

	// Action to research a myth from a specific lens/perspective
	researchLens: async ({ request }) => {
		const data = await request.formData();
		const mythStatement = data.get('mythStatement');
		const lensType = data.get('lensType');
		const lensName = data.get('lensName');
		const customQuery = data.get('customQuery');

		console.log('[researchLens] Action started. Received data:', { mythStatement, lensType, lensName, customQuery });

		if (typeof mythStatement !== 'string' || !mythStatement.trim()) {
			console.error('[researchLens] Error: Myth statement is required.');
			return { success: false, error: 'Myth statement is required.' };
		}

		if (typeof lensType !== 'string' || !lensType.trim()) {
			console.error('[researchLens] Error: Lens type is required.');
			return { success: false, error: 'Lens type is required.' };
		}

		if (typeof lensName !== 'string' || !lensName.trim()) {
			console.error('[researchLens] Error: Lens name is required.');
			return { success: false, error: 'Lens name is required.' };
		}

		console.log('[researchLens] Researching myth from lens:', lensType, lensName);

		const apiKey = PERPLEXITY_API_KEY;
		if (!apiKey) {
			console.error('[researchLens] Error: Missing Perplexity API key on server.');
			return { success: false, error: 'Missing Perplexity API key on server.' };
		}
		console.log('[researchLens] Perplexity API key found.');

		// Construct lens-specific prompt
		let lensPrompt = '';
		if (lensType === 'custom' && customQuery) {
			lensPrompt = `Analyze the myth "${mythStatement}" from this specific perspective: ${customQuery}. Provide detailed analysis and cite relevant sources.`;
		} else {
			const lensPrompts = {
				historical: `Examine the myth "${mythStatement}" from a historical perspective. Analyze its origins, how it developed over time, and the historical context that may have influenced its creation or spread.`,
				scientific: `Analyze the myth "${mythStatement}" from a scientific standpoint. Examine the evidence, methodologies, and scientific consensus related to this claim.`,
				cultural: `Explore the myth "${mythStatement}" from a cultural and social perspective. How does this belief vary across different cultures and societies?`,
				psychological: `Investigate the myth "${mythStatement}" from a psychological perspective. What cognitive biases, mental processes, or psychological factors contribute to belief in this myth?`,
				economic: `Examine the myth "${mythStatement}" from an economic perspective. Are there financial interests, market forces, or economic factors that influence this belief?`,
				political: `Analyze the myth "${mythStatement}" from a political perspective. How might political ideologies, power structures, or governance relate to this belief?`
			};
			lensPrompt = lensPrompts[lensType as keyof typeof lensPrompts] || lensPrompts.scientific;
		}
		console.log('[researchLens] Constructed lensPrompt:', lensPrompt);

		const payload = {
			model: 'sonar',
			messages: [
				{
					role: 'system',
					content: `You are an expert researcher analyzing myths and claims from specific perspectives.

					Provide a detailed analysis that includes:
					1. Key insights from this perspective
					2. Supporting evidence with proper citations
					3. Any contradictory evidence
					4. Nuanced conclusions

					Format your response as JSON:
					{
						"explanation": "Detailed analysis from this perspective",
						"keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
						"citations": [{"title": "Source title", "url": "URL"}]
					}`
				},
				{
					role: 'user',
					content: lensPrompt
				}
			]
		};
		console.log('[researchLens] API Payload:', JSON.stringify(payload, null, 2));

		try {
			console.log('[researchLens] Sending request to Perplexity API...');
			const resp = await fetch(PERPLEXITY_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`
				},
				body: JSON.stringify(payload)
			});
			console.log('[researchLens] API Response Status:', resp.status, resp.statusText);

			if (!resp.ok) {
				const errorText = await resp.text();
				console.error(`[researchLens] Error: API returned status ${resp.status}. Response: ${errorText}`);
				return { success: false, error: `API returned status ${resp.status}` };
			}

			const answer = await resp.json();
			console.log('[researchLens] API Response JSON:', JSON.stringify(answer, null, 2));
			const content = answer.choices?.[0]?.message?.content;
			console.log('[researchLens] API Response Content:', content);

			let explanation = '';
			let keyInsights: string[] = [];
			let parsedContentCitations: { title: string; url: string }[] = [];

			if (content) {
				console.log('[researchLens] Raw API content:', content);
				let parsedData = null;

				// Attempt 1: Check for ```json ... ``` block
				try {
					const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
					if (jsonMatch && jsonMatch[1]) {
						parsedData = JSON.parse(jsonMatch[1]);
						console.log('[researchLens] Successfully parsed from ```json block.');
					}
				} catch (e) {
					console.warn('[researchLens] Failed to parse from ```json block, will try direct parse.', e);
				}

				// Attempt 2: Try parsing the whole content as JSON if not successful above
				if (!parsedData) {
					try {
						parsedData = JSON.parse(content);
						console.log('[researchLens] Successfully parsed direct content string.');
					} catch (e) {
						console.log('[researchLens] Direct content string is not JSON. Treating as plain text explanation.');
						// No error, content will be used as plain text if parsedData remains null
					}
				}

				// Now, process parsedData or use content as fallback
				if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
					if (typeof parsedData.explanation === 'string') {
						explanation = parsedData.explanation;
					} else {
						// If parsedData is an object but .explanation isn't a string,
						// this implies the API returned a JSON structure we weren't fully expecting for the explanation.
						// We should not use the whole 'content' string if 'content' was the JSON that 'parsedData' came from.
						// Instead, if 'explanation' is missing or not a string, it's better to have an empty explanation
						// or a specific message, rather than potentially re-printing the whole JSON object.
						console.warn('[researchLens] Parsed data is missing a string "explanation" field or it was not a string. Content was:', content, 'Parsed data:', parsedData);
						explanation = ''; // Default to empty or a message like "Explanation not available in expected format."
					}
					
					keyInsights = Array.isArray(parsedData.keyInsights) ? parsedData.keyInsights.filter(item => typeof item === 'string') : [];
					parsedContentCitations = Array.isArray(parsedData.citations) ? parsedData.citations.filter(c => c && typeof c.title === 'string' && typeof c.url === 'string') : [];
					
					console.log('[researchLens] Extracted from parsed data:', { explanation, keyInsights, "parsedContentCitations_COUNT": parsedContentCitations.length });

				} else if (typeof content === 'string') {
					// content is not parsable JSON (or was an empty JSON object like {}), treat as plain text explanation
					explanation = content;
					keyInsights = []; 
					parsedContentCitations = []; 
					console.log('[researchLens] Using content as plain text explanation.');
				} else {
					console.error('[researchLens] API content was not a string or a usable JSON object.');
					explanation = 'Error: Could not process API response content.';
					keyInsights = [];
					parsedContentCitations = [];
				}
			} else {
				explanation = 'No content received from API.';
			}

			// API-provided citations (outside the message content)
			const apiCitations = answer.citations?.map((url: string, index: number) => ({
				title: `Source ${index + 1}`, 
				url
			})) || [];
			console.log('[researchLens] API-provided citations (answer.citations):', apiCitations);

			// Merge citations
			const citationMap = new Map<string, { title: string; url: string }>();
			parsedContentCitations.forEach((citation) => {
				if(citation.url) citationMap.set(citation.url, citation);
			});
			apiCitations.forEach((citation: { title: string; url: string }) => {
				if (citation.url && !citationMap.has(citation.url)) {
					citationMap.set(citation.url, citation);
				}
			});
			const finalCitations = Array.from(citationMap.values());
			console.log('[researchLens] Merged final citations:', finalCitations);

			const resultData = {
				success: true,
				lensId: lensType,
				result: {
					explanation,
					keyInsights,
					citations: finalCitations
				}
			};
			console.log('[researchLens] Returning successful result:', JSON.stringify(resultData, null, 2));
			return resultData;
		} catch (err) {
			console.error('[researchLens] Failed to research lens:', err);
			return { success: false, error: 'Failed to contact API for lens research' };
		}
	},
	analyzeSource: async ({ request }) => {
		const data = await request.formData();
		const sourceUrl = data.get('sourceUrl');
		const sourceName = data.get('sourceName');
		const mythContext = data.get('mythContext');
		const analysisType = data.get('analysisType');
		const customQuery = data.get('customQuery');

		if (typeof sourceUrl !== 'string' || !sourceUrl.trim()) {
			return { success: false, error: 'Source URL is required.' };
		}

		if (typeof mythContext !== 'string' || !mythContext.trim()) {
			return { success: false, error: 'Myth context is required.' };
		}

		console.log('Analyzing source:', sourceUrl, 'for myth:', mythContext);

		const apiKey = PERPLEXITY_API_KEY;
		if (!apiKey) {
			return { success: false, error: 'Missing Perplexity API key on server.' };
		}

		// Construct analysis prompt based on type
		let analysisPrompt = '';
		if (analysisType === 'custom' && customQuery) {
			analysisPrompt = `Analyze the source at ${sourceUrl} in the context of the myth "${mythContext}". ${customQuery}`;
		} else {
			const analysisTypes = {
				reliability: `Evaluate the reliability and credibility of the source at ${sourceUrl} in relation to the myth "${mythContext}". Consider the author's expertise, publication venue, peer review status, and potential biases.`,
				methodology: `Examine the methodology used in the source at ${sourceUrl} related to the myth "${mythContext}". Analyze the research methods, sample sizes, experimental design, and whether conclusions are supported by the data.`,
				contradictions: `Find evidence that contradicts or challenges the claims made in the source at ${sourceUrl} about the myth "${mythContext}". Look for conflicting studies, opposing viewpoints, or limitations in the source's claims.`,
				corroboration: `Find additional sources and evidence that support or corroborate the claims made in the source at ${sourceUrl} about the myth "${mythContext}". Look for independent verification and consensus.`
			};
			analysisPrompt =
				analysisTypes[analysisType as keyof typeof analysisTypes] || analysisTypes.reliability;
		}

		const payload = {
			model: 'sonar',
			messages: [
				{
					role: 'system',
					content: `You are an expert source analyst evaluating information quality and reliability.

					Provide a detailed analysis formatted as JSON:
					{
						"analysis": "Main analysis of the source",
						"reliability": "Assessment of source reliability (if applicable)",
						"methodology": "Evaluation of research methods (if applicable)",
						"corroborating": ["Supporting source 1", "Supporting source 2"],
						"contradicting": ["Contradicting source 1", "Contradicting source 2"]
					}`
				},
				{
					role: 'user',
					content: analysisPrompt
				}
			]
		};

		try {
			const resp = await fetch(PERPLEXITY_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`
				},
				body: JSON.stringify(payload)
			});

			if (!resp.ok) {
				return { success: false, error: `API returned status ${resp.status}` };
			}

			const answer = await resp.json();
			const content = answer.choices?.[0]?.message?.content;

			let analysis = '';
			let reliability = '';
			let methodology = '';
			let corroborating: string[] = [];
			let contradicting: string[] = [];

			if (content) {
				try {
					const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
					if (jsonMatch && jsonMatch[1]) {
						const parsed = JSON.parse(jsonMatch[1]);
						analysis = parsed.analysis || '';
						reliability = parsed.reliability || '';
						methodology = parsed.methodology || '';
						corroborating = parsed.corroborating || [];
						contradicting = parsed.contradicting || [];
					} else {
						analysis = content;
					}
				} catch (error) {
					analysis = content;
				}
			}

			return {
				success: true,
				result: {
					analysis,
					reliability,
					methodology,
					corroborating,
					contradicting
				}
			};
		} catch (err) {
			console.error('Failed to analyze source:', err);
			return { success: false, error: 'Failed to contact API for source analysis' };
		}
	},

	// Action to synthesize insights from multiple research angles
	synthesizeInsights: async ({ request }) => {
		const data = await request.formData();
		const mythStatement = data.get('mythStatement');
		const lensResultsJson = data.get('lensResults');

		if (typeof mythStatement !== 'string' || !mythStatement.trim()) {
			return { success: false, error: 'Myth statement is required.' };
		}

		if (typeof lensResultsJson !== 'string' || !lensResultsJson.trim()) {
			return { success: false, error: 'Lens results are required.' };
		}

		let lensResults: LensResult[] = [];
		try {
			lensResults = JSON.parse(lensResultsJson);
		} catch (error) {
			return { success: false, error: 'Invalid lens results format.' };
		}

		if (lensResults.length < 2) {
			return { success: false, error: 'At least 2 research angles are needed for synthesis.' };
		}

		console.log(
			'Synthesizing insights for myth:',
			mythStatement,
			'from',
			lensResults.length,
			'lenses'
		);

		const apiKey = PERPLEXITY_API_KEY;
		if (!apiKey) {
			return { success: false, error: 'Missing Perplexity API key on server.' };
		}

		// Construct synthesis prompt
		const lensData = lensResults.map((lens) => ({
			perspective: lens.name,
			insights: lens.result?.keyInsights || [],
			explanation: lens.result?.explanation || ''
		}));

		const synthesisPrompt = `Given the myth "${mythStatement}", analyze the following research findings from different perspectives:

${lensData
	.map(
		(lens) => `
**${lens.perspective} Perspective:**
Key Insights: ${lens.insights.join(', ')}
Analysis: ${lens.explanation}
`
	)
	.join('\n')}

Provide a comprehensive synthesis that identifies:
1. Overarching themes that emerge across perspectives
2. Key connections between different viewpoints
3. Notable contradictions or tensions
4. An overall insight that integrates all perspectives

Format as JSON:
{
	"overallInsight": "Comprehensive summary integrating all perspectives",
	"themes": [
		{"title": "Theme 1", "description": "Description of theme"},
		{"title": "Theme 2", "description": "Description of theme"}
	],
	"connections": ["Connection 1", "Connection 2"],
	"contradictions": ["Contradiction 1", "Contradiction 2"]
}`;

		const payload = {
			model: 'sonar',
			messages: [
				{
					role: 'system',
					content:
						'You are an expert research synthesizer who integrates findings from multiple perspectives to generate comprehensive insights. Focus on identifying patterns, themes, and connections across different analytical approaches.'
				},
				{
					role: 'user',
					content: synthesisPrompt
				}
			]
		};

		try {
			const resp = await fetch(PERPLEXITY_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`
				},
				body: JSON.stringify(payload)
			});

			if (!resp.ok) {
				return { success: false, error: `API returned status ${resp.status}` };
			}

			const answer = await resp.json();
			const content = answer.choices?.[0]?.message?.content;

			let overallInsight = '';
			let themes: Array<{ title: string; description: string }> = [];
			let connections: string[] = [];
			let contradictions: string[] = [];

			if (content) {
				console.log('[synthesizeInsights] Raw API content:', content);
				let parsedData = null;

				// Attempt 1: Check for ```json ... ``` block
				try {
					const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
					if (jsonMatch && jsonMatch[1]) {
						parsedData = JSON.parse(jsonMatch[1]);
						console.log('[synthesizeInsights] Successfully parsed from ```json block.');
					}
				} catch (e) {
					console.warn('[synthesizeInsights] Failed to parse from ```json block, will try direct parse.', e);
				}

				// Attempt 2: Try parsing the whole content as JSON if not successful above
				if (!parsedData) {
					try {
						parsedData = JSON.parse(content);
						console.log('[synthesizeInsights] Successfully parsed direct content string.');
					} catch (e) {
						console.log('[synthesizeInsights] Direct content string is not JSON. Treating as plain text for overallInsight or error.');
					}
				}

				// Now, process parsedData or use content as fallback
				if (parsedData && typeof parsedData === 'object' && parsedData !== null) {
					overallInsight = typeof parsedData.overallInsight === 'string' ? parsedData.overallInsight : '';
					themes = Array.isArray(parsedData.themes) ? parsedData.themes.filter(
						(t: any) => t && typeof t.title === 'string' && typeof t.description === 'string'
					) : [];
					connections = Array.isArray(parsedData.connections) ? parsedData.connections.filter(item => typeof item === 'string') : [];
					contradictions = Array.isArray(parsedData.contradictions) ? parsedData.contradictions.filter(item => typeof item === 'string') : [];
					
					if (typeof parsedData.overallInsight !== 'string' && overallInsight === '') {
						console.warn('[synthesizeInsights] Parsed data is missing a string "overallInsight" field. Content was:', content, 'Parsed data:', parsedData);
					}
					console.log('[synthesizeInsights] Extracted from parsed data:', { overallInsight, themes_count: themes.length, connections_count: connections.length, contradictions_count: contradictions.length });

				} else if (typeof content === 'string') {
					// content is not parsable JSON, treat as plain text for overallInsight if it seems like a sentence.
					// Otherwise, it might be an error or unexpected format.
					overallInsight = content; // Default to content if it's just a string
					themes = [];
					connections = [];
					contradictions = [];
					console.log('[synthesizeInsights] Using content as plain text for overallInsight, other fields empty.');
				} else {
					console.error('[synthesizeInsights] API content was not a string or a usable JSON object for synthesis.');
					overallInsight = 'Error: Could not process synthesis response content.';
					themes = [];
					connections = [];
					contradictions = [];
				}
			} else {
				overallInsight = 'No content received from API for synthesis.';
			}

			return {
				success: true,
				result: {
					overallInsight,
					themes,
					connections,
					contradictions
				}
			};
		} catch (err) {
			console.error('Failed to synthesize insights:', err);
			return { success: false, error: 'Failed to contact API for insight synthesis' };
		}
	},

	// Action to clear the server-side API response cache
	clearServerCache: () => {
		console.log('Clearing server API response cache');
		responseCache.clear(); // Clear all entries from the cache Map
		return { success: true, message: 'Server API response cache cleared successfully.' };
	},

	// Action to signal a page reset, primarily for client-side state clearing via enhance
	resetPage: async () => {
		console.log('[resetPage] Action called. Returning minimal success.');
		// This action doesn't need to do much. Its completion will trigger client-side updates.
		// It could return specific data if needed to influence pageFormProp,
		// but for a simple clear, an empty success is often enough.
		return { success: true, reset: true }; // Sending a marker
	}
};
