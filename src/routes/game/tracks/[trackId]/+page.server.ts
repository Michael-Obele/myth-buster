// myth-buster/src/routes/game/tracks/[trackId]/+page.server.ts
import { fail, error as SvelteKitError } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// @ts-expect-error editor-error
import { PERPLEXITY_API_KEY } from '$env/static/private';
import { building } from '$app/environment';
import type {
	GameStatement,
	Citation,
	GenerateActionResult,
	CheckAnswerActionResult
} from '$lib/game/types';

// API Configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// System prompt for AI to generate a specific myth within a learning track
const TRACK_MYTH_GENERATION_SYSTEM_PROMPT_TEMPLATE = (
	trackTitle: string,
	trackCategory: string,
	trackDifficulty: string,
	currentMythNumber: number,
	totalMyths: number
) => `You are an AI that generates engaging and verifiable myths for a specific learning track in a myth-busting game, using evidence-based research and authoritative sources.

Track Context:
- Title: "${trackTitle}"
- Category: "${trackCategory}"
- Difficulty: "${trackDifficulty}"
- Current Myth Number: ${currentMythNumber} of ${totalMyths}

Your goal is to create a myth that is engaging, verifiable, **not easily predictable**, and deeply rooted in factual evidence.

Key requirements for this specific myth (myth ${currentMythNumber} of ${totalMyths}):
1.  **Distinctiveness & Unpredictability:**
    *   The statement MUST be unique and not a rephrasing of common knowledge or clichés for this topic.
    *   Aim for statements that challenge common assumptions, reveal surprising truths, or highlight nuanced details within the track's theme.
    *   For "hard" difficulty, delve into more specialized or counter-intuitive aspects.
    *   Vary statement style: direct assertions, challenging common beliefs, highlighting obscure facts, or presenting surprising consequences. Avoid ambiguity or reliance on wordplay.
2.  **Verifiability & Evidence-Based:**
    *   The statement must be definitively true or false based on current, credible evidence.
    *   Conduct thorough research to ensure accuracy.
3.  **Clarity & Conciseness:** The myth statement itself must be clear, specific, and to the point.
4.  **Contextual Relevance:** The myth must align perfectly with the track's title, category, and difficulty level.
5.  **Explanation Quality:**
    *   Provide a comprehensive, evidence-based explanation.
    *   If false, clearly debunk the myth, state the correct facts, and explain common reasons for the misconception.
    *   If true, explain why it's true, perhaps contrasting with related falsehoods.
    *   Cite specific evidence, data, or studies within the explanation.
6.  **Authoritative Citations:**
    *   Provide 1-3 reliable, authoritative citations (e.g., peer-reviewed journals, official reports from reputable organizations, academic books).
    *   Include specific titles and publication years if available.
    *   Ensure URLs link directly to the source or an abstract. Avoid general news articles or blogs unless they are reporting directly on primary research.

Return your response as a JSON object with the following structure:
{
  "statement": "A clear, specific, and engaging statement that is definitively true or false.",
  "isTrue": boolean, // true if the statement is factually true, false otherwise
  "explanation": "A detailed, evidence-based explanation of why the statement is true or false, correcting any misconceptions.",
  "citations": [
    { "title": "Specific source title with publication year (if available)", "url": "Direct URL to the authoritative source" }
  ]
}

Ensure the output is ONLY the JSON object within a markdown code block.`;

// --- Caching Logic (for individual myths within a track) ---
interface CachedGameStatementResponse {
	timestamp: number;
	response: GameStatement;
	expiresAt: number;
}

const trackMythCache: Map<string, CachedGameStatementResponse> = !building ? new Map() : new Map();
const TRACK_MYTH_CACHE_EXPIRATION_MS = 1 * 60 * 60 * 1000; // 1 hour for individual track myths

function getCachedTrackMyth(key: string): GameStatement | null {
	if (building) return null;
	// Temporarily disable cache for debugging
	console.log(`[CACHE DISABLED] getCachedTrackMyth called for key: ${key}, returning null.`);
	return null;
	// const now = Date.now();
	// const cachedData = trackMythCache.get(key);

	// if (!cachedData) {
	// 	console.log(`[CACHE MISS] getCachedTrackMyth for key: ${key}`);
	// 	return null;
	// }
	// if (now >= cachedData.expiresAt) {
	// 	console.log(`[CACHE EXPIRED] getCachedTrackMyth for key: ${key}`);
	// 	trackMythCache.delete(key);
	// 	return null;
	// }
	// console.log(`[CACHE HIT] getCachedTrackMyth for key: ${key}`, cachedData.response);
	// return cachedData.response;
}

function cacheTrackMyth(key: string, response: GameStatement): void {
	if (building) return;
	// Temporarily disable cache for debugging
	console.log(
		`[CACHE DISABLED] cacheTrackMyth called for key: ${key}, not caching. Data:`,
		response
	);
	return;
	// const now = Date.now();
	// trackMythCache.set(key, {
	// 	timestamp: now,
	// 	response,
	// 	expiresAt: now + TRACK_MYTH_CACHE_EXPIRATION_MS
	// });
	// console.log(`[CACHE SET] cacheTrackMyth for key: ${key}`, response);
}
// --- End Caching Logic ---

export const load: PageServerLoad = async ({ params, url }) => {
	console.log('[TRACK LOAD] Function called.');
	console.log('[TRACK LOAD] Params:', params);
	console.log('[TRACK LOAD] URL Search Params:', Object.fromEntries(url.searchParams));

	const trackId = params.trackId;
	const trackTitle = url.searchParams.get('title');
	const trackCategory = url.searchParams.get('category');
	const trackDifficulty = url.searchParams.get('difficulty');
	const totalMythsStr = url.searchParams.get('totalMyths');
	const icon = url.searchParams.get('icon');

	if (!trackTitle || !trackCategory || !trackDifficulty || !totalMythsStr || !icon) {
		throw SvelteKitError(
			400,
			'Missing required track metadata in URL parameters (title, category, difficulty, totalMyths, icon).'
		);
	}

	const totalMyths = parseInt(totalMythsStr, 10);
	if (isNaN(totalMyths) || totalMyths <= 0) {
		throw SvelteKitError(400, 'Invalid totalMyths parameter.');
	}

	// This load function primarily passes track metadata.
	// The first myth will be fetched by an action triggered by the client page onMount.
	const returnData = {
		trackId,
		trackTitle: decodeURIComponent(trackTitle),
		trackCategory: decodeURIComponent(trackCategory),
		trackDifficulty,
		trackIcon: decodeURIComponent(icon),
		totalMythsInTrack: totalMyths,
		// Initial myth data will be null/empty; page will call 'generateMyth' action.
		initialMyth: null
	};
	console.log('[TRACK LOAD] Returning data:', returnData);
	return returnData;
};

export const actions: Actions = {
	generateMyth: async ({ request, params }) => {
		console.log('[ACTION generateMyth] Called.');
		const formData = await request.formData();
		console.log('[ACTION generateMyth] FormData received:', Object.fromEntries(formData));
		const trackId = params.trackId; // From URL

		// These should be passed from the client, originating from the load function
		const trackTitle = formData.get('trackTitle')?.toString();
		const trackCategory = formData.get('trackCategory')?.toString();
		const trackDifficulty = formData.get('trackDifficulty')?.toString();
		const totalMythsInTrackStr = formData.get('totalMythsInTrack')?.toString();
		const mythIndexStr = formData.get('mythIndex')?.toString();
		let mythIndex = mythIndexStr ? parseInt(mythIndexStr, 10) : 0;

		console.log('[ACTION generateMyth] Parsed Details:', {
			trackId,
			trackTitle,
			trackCategory,
			trackDifficulty,
			totalMythsInTrackStr,
			mythIndex
		});

		if (!trackTitle || !trackCategory || !trackDifficulty || !totalMythsInTrackStr) {
			console.error('[ACTION generateMyth] Error: Missing required track details.');
			return fail(400, {
				error: 'Missing required track details for myth generation.',
				action: 'generateMyth',
				success: false,
				statement: '',
				isTrue: false,
				explanation: '',
				citations: []
			});
		}
		const totalMythsInTrack = parseInt(totalMythsInTrackStr, 10);
		if (isNaN(totalMythsInTrack) || totalMythsInTrack <= 0) {
			console.error(
				'[ACTION generateMyth] Error: Invalid totalMythsInTrack value:',
				totalMythsInTrackStr
			);
			return fail(400, {
				error: 'Invalid totalMythsInTrack.',
				action: 'generateMyth',
				success: false,
				statement: '',
				isTrue: false,
				explanation: '',
				citations: []
			});
		}

		if (mythIndex >= 0 && mythIndex < totalMythsInTrack) {
			const cacheKey = `track_myth_${trackId}_${mythIndex}`;
			let gameStatement: GameStatement | null = getCachedTrackMyth(cacheKey);
			let fromCache = true;

			if (!gameStatement) {
				fromCache = false;
				console.log(
					`[ACTION generateMyth] Myth for index ${mythIndex} (key: ${cacheKey}) not found in cache or cache disabled. Fetching from API.`
				);
				try {
					const systemPromptContent = TRACK_MYTH_GENERATION_SYSTEM_PROMPT_TEMPLATE(
						trackTitle,
						trackCategory,
						trackDifficulty,
						mythIndex + 1, // User-facing number (1-based)
						totalMythsInTrack
					);

					const apiKey = PERPLEXITY_API_KEY;
					if (!apiKey) {
						console.error('[ACTION generateMyth] API key is not configured.');
						throw new Error('API key is not configured.');
					}
					console.log('[ACTION generateMyth] System prompt for API:', systemPromptContent);

					const payload = {
						model: 'sonar',
						messages: [
							{ role: 'system', content: systemPromptContent },
							{
								role: 'user',
								content: `Generate myth number ${mythIndex + 1} for the track "${trackTitle}". Focus on creating a statement that is not obvious and requires some thought or specific knowledge related to the track's theme, difficulty, and category.`
							}
						],
						temperature: 0.35, // Slightly higher for more creative/less obvious myths
						max_tokens: 3500, // Ensure enough space for detailed explanation and citations
						web_search_options: {
							search_context_size: 'medium' // Essential for finding accurate, specific information
						},
						return_images: false,
						return_related_questions: false
					};
					console.log(
						'[ACTION generateMyth] API Request Payload:',
						JSON.stringify(payload, null, 2)
					);

					const resp = await fetch(PERPLEXITY_API_URL, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
						body: JSON.stringify(payload)
					});

					if (!resp.ok) {
						const errorText = await resp.text();
						console.error(
							`[ACTION generateMyth] API request failed with status ${resp.status}:`,
							errorText
						);
						throw new Error(`Track Myth API request failed status ${resp.status}: ${errorText}`);
					}
					const answer = await resp.json();
					console.log('[ACTION generateMyth] API Raw Response:', JSON.stringify(answer, null, 2));

					const content = answer.choices?.[0]?.message?.content;
					if (!content) {
						console.error(
							'[ACTION generateMyth] Invalid API response: No content found in choices.'
						);
						throw new Error('Invalid Track Myth API response: No content.');
					}
					console.log('[ACTION generateMyth] API Response Content:', content);

					const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
					if (!jsonMatch || !jsonMatch[1]) {
						console.error(
							'[ACTION generateMyth] Invalid API response: JSON block not found. Content:',
							content
						);
						throw new Error('Invalid Track Myth API response: JSON block not found.');
					}
					console.log('[ACTION generateMyth] Extracted JSON string from API:', jsonMatch[1]);

					gameStatement = JSON.parse(jsonMatch[1]) as GameStatement;
					console.log('[ACTION generateMyth] Parsed GameStatement from API:', gameStatement);
					if (
						typeof gameStatement.statement !== 'string' ||
						typeof gameStatement.isTrue !== 'boolean' ||
						typeof gameStatement.explanation !== 'string' ||
						!Array.isArray(gameStatement.citations)
					) {
						console.error(
							'[ACTION generateMyth] API Response JSON validation failed. Parsed content:',
							gameStatement
						);
						throw new Error('Parsed JSON for track myth does not match GameStatement structure.');
					}

					if (gameStatement) {
						cacheTrackMyth(cacheKey, gameStatement); // Will log that it's disabled
					}
				} catch (error: any) {
					console.error(
						'[ACTION generateMyth] Catch Block - API or Parsing Error:',
						error.message,
						error.stack
					);
					return fail(500, {
						error: 'Failed to generate myth for track. ' + (error.message || 'Unknown API error'),
						action: 'generateMyth',
						success: false,
						statement: '',
						isTrue: false,
						explanation: '',
						citations: [],
						trackId,
						trackTitle,
						currentMythIndex: mythIndex,
						totalMythsInTrack
					});
				}
			}

			if (!gameStatement) {
				return fail(500, {
					error: 'Failed to generate or retrieve myth for track.',
					action: 'generateMyth',
					success: false,
					statement: '',
					isTrue: false,
					explanation: '',
					citations: [],
					trackId,
					trackTitle,
					currentMythIndex: mythIndex,
					totalMythsInTrack
				});
			}
			console.log(
				`[ACTION generateMyth] Successfully generated/retrieved myth (fromCache: ${fromCache}):`,
				gameStatement
			);

			const resultData = {
				success: true,
				...gameStatement,
				trackId,
				trackTitle,
				currentMythIndex: mythIndex,
				totalMythsInTrack: totalMythsInTrack,
				isLastMythInTrack: mythIndex === totalMythsInTrack - 1,
				cached: fromCache,
				action: 'generateMyth' // Ensure action property is set for type guards
			} as GenerateActionResult;
			console.log('[ACTION generateMyth] Returning success data:', resultData);
			return resultData;
		} else {
			// Track completed or invalid index
			console.warn(
				`[ACTION generateMyth] Myth index ${mythIndex} is out of bounds or track completed.`
			);
			return fail(400, {
				error: `Myth index ${mythIndex} is out of bounds. Track completed.`,
				action: 'generateMyth',
				success: false,
				statement: '',
				isTrue: false,
				explanation: 'Track completed.',
				citations: [],
				trackId,
				trackTitle,
				currentMythIndex: mythIndex,
				totalMythsInTrack,
				trackCompleted: true,
				isLastMythInTrack: true
			});
		}
	},

	checkAnswer: async ({ request }) => {
		console.log('[ACTION checkAnswer] Called.');
		const formData = await request.formData();
		console.log('[ACTION checkAnswer] FormData received:', Object.fromEntries(formData));

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
				citations = JSON.parse(citationsString);
				if (!Array.isArray(citations)) {
					console.warn(
						'[ACTION checkAnswer] Parsed citations is not an array, defaulting to empty. String was:',
						citationsString
					);
					citations = [];
				}
			} catch (e: any) {
				console.error(
					'[ACTION checkAnswer] Failed to parse citations JSON:',
					e.message,
					'. String was:',
					citationsString
				);
				citations = [];
			}
		}
		console.log('[ACTION checkAnswer] Parsed answer details:', {
			userAnswer,
			isTrue,
			confidence,
			statement,
			explanation,
			citationsCount: citations.length
		});

		if (statement === '' || isTrueFromForm === null || isTrueFromForm === undefined) {
			console.error('[ACTION checkAnswer] Error: Missing statement data for answer check.');
			return fail(400, {
				error: 'Missing statement data for answer check.',
				action: 'checkAnswer',
				success: false
			});
		}

		const isCorrect = userAnswer === isTrue;
		let points = 0;
		if (isCorrect) {
			points = Math.round(confidence); // Simple point logic
		}
		console.log(
			`[ACTION checkAnswer] User answer is ${isCorrect ? 'correct' : 'incorrect'}. Points: ${points}`
		);

		const resultData = {
			success: true,
			result: isCorrect ? 'correct' : 'incorrect',
			statement,
			userAnswer,
			isTrue,
			explanation,
			citations,
			points,
			action: 'checkAnswer' // Explicitly add action for client-side type guards
		} as CheckAnswerActionResult;
		console.log('[ACTION checkAnswer] Returning data:', resultData);
		return resultData;
	}
};
