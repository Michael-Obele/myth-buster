// myth-buster/src/routes/game/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { PERPLEXITY_API_KEY } from '$env/static/private';
import { building } from '$app/environment';

// API Configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Type Definitions
export interface Citation {
  title: string;
  url: string;
}

export interface GameStatement {
  statement: string;
  isTrue: boolean;
  explanation: string;
  citations: Citation[];
}

export interface GenerateActionResult extends GameStatement {
  success: boolean;
  cached?: boolean;
  error?: string;
}

export interface CheckAnswerActionResult {
  success: boolean;
  result: 'correct' | 'incorrect';
  statement: string;
  userAnswer: boolean;
  isTrue: boolean;
  explanation: string;
  citations: Citation[];
  points: number;
  error?: string;
}

export interface AnswerResult {
  result: 'correct' | 'incorrect';
  points: number;
  explanation: string;
  citations: Citation[];
}

// System prompt for the AI to generate game statements
const GAME_SYSTEM_PROMPT = `You are an AI that generates interesting and verifiable statements for a myth-busting game.
For each request, provide a single statement that is definitively true or false.
Also provide the actual truth value (true/false), a concise explanation, and 1-3 reliable citations.
The statement should be suitable for a game where a user guesses if it's true or false.
Vary the topics (e.g., science, history, general knowledge, pop culture).
Consider the requested difficulty (e.g., easy, medium, hard) and category (e.g., science, history). true if the statement is true, false otherwise

Return your response as a JSON object with the following structure:
{
  "statement": "The generated statement (e.g., 'The Earth is flat.')",
  "isTrue": boolean, 
  "explanation": "A concise explanation of why the statement is true or false.",
  "citations": [
    {
      "title": "Source Title 1",
      "url": "URL to Source 1"
    }
  ]
}

Ensure the output is ONLY the JSON object within a markdown code block.`;

// --- Caching Logic ---
interface CachedGameStatementResponse {
	timestamp: number;
	response: GameStatement;
	expiresAt: number;
}

const gameStatementCache: Map<string, CachedGameStatementResponse> = !building
	? new Map()
	: new Map();
const GAME_CACHE_EXPIRATION_MS = 10 * 1000; // 10 seconds - effectively disabling cache for gameplay

function getCachedGameStatement(key: string): GameStatement | null {
	// Always return null to disable caching and get a fresh question each time
	console.log(`[GAME CACHE] Disabled - always generating new questions`);
	return null;
}

function cacheGameStatement(key: string, response: GameStatement): void {
	if (building) return; // Don't use cache during build
	const now = Date.now();
	gameStatementCache.set(key, {
		timestamp: now,
		response,
		expiresAt: now + GAME_CACHE_EXPIRATION_MS
	});
	console.log(`[GAME CACHE] Cached entry for key: ${key}`);
}
// --- End Caching Logic ---

/**
 * Generate a statement from the Perplexity API based on difficulty and category
 * @param difficulty - The difficulty level of the statement
 * @param category - The category of the statement
 * @returns A GameStatement object with the generated statement
 */
async function generateStatementFromAPI(difficulty: string, category: string): Promise<GameStatement> {
	console.log(
		`[API CALL] Generating statement from API with difficulty: ${difficulty}, category: ${category}`
	);
	const apiKey = PERPLEXITY_API_KEY;

	if (!apiKey) {
		console.error('[API ERROR] Perplexity API key is missing.');
		throw new Error('API key is not configured.');
	}

	const userQuery = `Generate a ${difficulty} difficulty statement in the ${category} category.`;

	const payload = {
		model: 'sonar', 
		messages: [
			{ role: 'system', content: GAME_SYSTEM_PROMPT },
			{ role: 'user', content: userQuery }
		]
	};
	console.log('[API PAYLOAD]', JSON.stringify(payload, null, 2));

	const resp = await fetch(PERPLEXITY_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify(payload)
	});

	console.log('[API RESPONSE STATUS]', resp.status);

	if (!resp.ok) {
		const errorText = await resp.text();
		console.error('[API ERROR] API request failed:', resp.status, errorText);
		throw new Error(`API request failed with status ${resp.status}: ${errorText}`);
	}

	const answer = await resp.json();
	console.log('[API RAW RESPONSE]', JSON.stringify(answer, null, 2));

	const content = answer.choices?.[0]?.message?.content;
	if (!content) {
		console.error('[API PARSE ERROR] No content in API response choices.');
		throw new Error('Invalid API response: No content found.');
	}

	console.log('[API CONTENT]', content);
	const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
	if (!jsonMatch || !jsonMatch[1]) {
		console.error('[API PARSE ERROR] Could not extract JSON from API response content.');
		console.log("Content that failed to parse: ", content);
		throw new Error('Invalid API response: JSON block not found or malformed.');
	}

	try {
		// Clean the JSON string by removing comments and fixing common JSON issues
		let cleanedJson = jsonMatch[1]
			// Remove single-line comments
			.replace(/\s*\/\/.*$/gm, '')
			// Remove trailing commas in arrays and objects
			.replace(/,\s*(\]|\})/g, '$1');
		
		console.log('[API CLEANED JSON]', cleanedJson);
		
		// Try to parse the cleaned JSON
		let parsedContent: GameStatement;
		try {
			parsedContent = JSON.parse(cleanedJson) as GameStatement;
		} catch (error) {
			const parseError = error as Error;
			console.error('[API JSON PARSE ERROR]', parseError.message);
			console.error('JSON string that failed to parse: ', cleanedJson);
			
			// If parsing fails, try to fix common issues and parse again
			cleanedJson = cleanedJson
				// Remove any remaining non-standard JSON elements
				.replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
				.replace(/[\u0000-\u001F]+/g, ' ') // Remove control characters
				.trim();
			
			// Create a minimal valid statement if everything else fails
			try {
				parsedContent = JSON.parse(cleanedJson) as GameStatement;
			} catch (error) {
				const finalError = error as Error;
				console.error('[API FINAL JSON PARSE ERROR]', finalError.message);
				// Extract statement directly using regex as a last resort
				const statementMatch = cleanedJson.match(/"statement"\s*:\s*"([^"]+)"/i);
				const isTrueMatch = cleanedJson.match(/"isTrue"\s*:\s*(true|false)/i);
				const explanationMatch = cleanedJson.match(/"explanation"\s*:\s*"([^"]+)"/i);
				
				if (statementMatch && isTrueMatch) {
					// Create a minimal valid statement
					parsedContent = {
						statement: statementMatch[1],
						isTrue: isTrueMatch[1].toLowerCase() === 'true',
						explanation: explanationMatch ? explanationMatch[1] : 'No explanation available.',
						citations: []
					};
					console.log('[API FALLBACK PARSING]', 'Created minimal valid statement from regex');
				} else {
					throw new Error(`Failed to parse JSON from API response: ${finalError.message}`);
				}
			}
		}
		
		console.log('[API PARSED CONTENT]', parsedContent);

        // Basic validation of the parsed content
        if (typeof parsedContent.statement !== 'string' ||
            typeof parsedContent.isTrue !== 'boolean' ||
            typeof parsedContent.explanation !== 'string' ||
            !Array.isArray(parsedContent.citations) ||
            !parsedContent.citations.every(c => typeof c.title === 'string' && typeof c.url ==='string')
        ) {
            console.error('[API VALIDATION ERROR] Parsed JSON does not match expected GameStatement structure.');
            throw new Error('Parsed JSON does not match expected GameStatement structure.');
        }

		return parsedContent;
	} catch (e: any) {
		console.error('[API JSON PARSE ERROR]', e.message);
		console.log("JSON string that failed to parse: ", jsonMatch[1]);
		throw new Error(`Failed to parse JSON from API response: ${e.message}`);
	}
}

export const actions: Actions = {
	/**
	 * Generate a new statement for the game
	 */
	generate: async ({ request }) => {
		const formData = await request.formData();
		const difficulty = formData.get('difficulty')?.toString() || 'medium';
		const category = formData.get('category')?.toString() || 'general';
		console.log(`[ACTION generate] Difficulty: ${difficulty}, Category: ${category}`);

		const cacheKey = `game_statement_${difficulty}_${category}_${Date.now()}`; // Use full timestamp to ensure uniqueness
		let generatedData = getCachedGameStatement(cacheKey);
		let fromCache = true;

		if (!generatedData) {
			fromCache = false;
			try {
				generatedData = await generateStatementFromAPI(difficulty, category);
				if (generatedData) {
					cacheGameStatement(cacheKey, generatedData);
				}
			} catch (error: any) {
				console.error('[ACTION generate ERROR]', error);
				return fail(500, {
					error: 'Failed to generate a new statement. ' + (error.message || 'Unknown API error'),
					action: 'generate',
					success: false,
					difficulty,
					category
				});
			}
		}

		if (!generatedData) {
			console.error('[ACTION generate ERROR] No statement generated after API call and cache check.');
			return fail(500, {
				error: 'Failed to generate a statement. Please try again.',
				action: 'generate',
				success: false,
				difficulty,
				category
			});
		}

		console.log(`[ACTION generate SUCCESS] Returning data (fromCache: ${fromCache}):`, generatedData);
		return {
			success: true,
			...generatedData,
			cached: fromCache
		};
	},

	/**
	 * Check the user's answer against the correct answer
	 */
	checkAnswer: async ({ request }) => {
		const formData = await request.formData();
		console.log("[ACTION checkAnswer] FormData received:", Object.fromEntries(formData));

		const userAnswer = formData.get('answer') === 'true';
		const isTrueFromForm = formData.get('isTrue');
		const isTrue = isTrueFromForm === 'true';
		const confidence = parseInt(formData.get('confidence')?.toString() || '50');
		const statement = formData.get('statement')?.toString() || '';
		const explanation = formData.get('explanation')?.toString() || '';

		let citations: Citation[] = [];
		const citationsString = formData.get('citations')?.toString();
		if (citationsString) {
			try {
				const parsedCitations = JSON.parse(citationsString);
				if (Array.isArray(parsedCitations)) {
					citations = parsedCitations.map((c) => ({
						title: c.title || 'Unknown Source',
						url: c.url || '#'
					}));
				} else {
					console.warn('[ACTION checkAnswer] Parsed citations is not an array, defaulting to empty.');
				}
			} catch (e) {
				console.error('[ACTION checkAnswer] Failed to parse citations JSON:', e);
			}
		}

		if (statement === '' || isTrueFromForm === null || isTrueFromForm === undefined) {
			console.warn('[ACTION checkAnswer] Missing statement data for answer check.');
			return fail(400, {
				error: 'Missing statement data for answer check.',
				action: 'checkAnswer',
				success: false,
				formData: Object.fromEntries(formData)
			});
		}

		const isCorrect = userAnswer === isTrue;
		let points = 0;

		if (isCorrect) {
			points = Math.round(confidence);
		}

		const responseData: CheckAnswerActionResult = {
			success: true,
			result: isCorrect ? 'correct' : 'incorrect',
			statement,
			userAnswer,
			isTrue,
			explanation,
			citations,
			points
		};
		console.log("[ACTION checkAnswer SUCCESS] Returning data:", responseData);
		return responseData;
	}
};