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

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

const TRACK_MYTH_GENERATION_SYSTEM_PROMPT_TEMPLATE = (
	trackTitle: string, trackCategory: string, trackDifficulty: string, currentMythNumber: number, totalMyths: number
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

Ensure the output is ONLY the JSON object.`;

interface CachedGameStatementResponse { timestamp: number; response: GameStatement; expiresAt: number; }
const trackMythCache: Map<string, CachedGameStatementResponse> = !building ? new Map() : new Map();

function getCachedTrackMyth(key: string): GameStatement | null {
	if (building) return null;
	console.log(`[TRACK CACHE DISABLED] getCachedTrackMyth called for key: ${key}, returning null.`);
	return null;
}

function cacheTrackMyth(key: string, response: GameStatement): void {
	if (building) return;
	console.log(`[TRACK CACHE DISABLED] cacheTrackMyth for key: ${key}, not caching.`);
}

export const load: PageServerLoad = async ({ params, url }) => {
	const trackId = params.trackId;
	const trackTitle = url.searchParams.get('title');
	const trackCategory = url.searchParams.get('category');
	const trackDifficulty = url.searchParams.get('difficulty');
	const totalMythsStr = url.searchParams.get('totalMyths');
	const icon = url.searchParams.get('icon');

	if (!trackTitle || !trackCategory || !trackDifficulty || !totalMythsStr || !icon) {
		throw SvelteKitError(400, 'Missing required track metadata.');
	}
	const totalMyths = parseInt(totalMythsStr, 10);
	if (isNaN(totalMyths) || totalMyths <= 0) throw SvelteKitError(400, 'Invalid totalMyths.');

	return {
		trackId, trackTitle: decodeURIComponent(trackTitle), trackCategory: decodeURIComponent(trackCategory),
		trackDifficulty, trackIcon: decodeURIComponent(icon), totalMythsInTrack: totalMyths, initialMyth: null
	};
};

export const actions: Actions = {
	generateMyth: async ({ request, params }) => {
		const formData = await request.formData();
		const trackId = params.trackId;
		const trackTitle = formData.get('trackTitle')?.toString();
		const trackCategory = formData.get('trackCategory')?.toString();
		const trackDifficulty = formData.get('trackDifficulty')?.toString();
		const totalMythsInTrackStr = formData.get('totalMythsInTrack')?.toString();
		const mythIndex = parseInt(formData.get('mythIndex')?.toString() || '0', 10);

		if (!trackTitle || !trackCategory || !trackDifficulty || !totalMythsInTrackStr) {
			return fail(400, { error: 'Missing track details.', action: 'generateMyth', success: false, statement: '', isTrue: false, explanation: '', citations: [] });
		}
		const totalMythsInTrack = parseInt(totalMythsInTrackStr, 10);
		if (isNaN(totalMythsInTrack) || totalMythsInTrack <= 0) {
			return fail(400, { error: 'Invalid totalMythsInTrack.', action: 'generateMyth', success: false, statement: '', isTrue: false, explanation: '', citations: [] });
		}

		if (mythIndex >= 0 && mythIndex < totalMythsInTrack) {
			const cacheKey = `track_myth_${trackId}_${mythIndex}`;
			let gameStatement: GameStatement | null = getCachedTrackMyth(cacheKey);
			let fromCache = true;

			if (!gameStatement) {
				fromCache = false;
				try {
					const systemPromptContent = TRACK_MYTH_GENERATION_SYSTEM_PROMPT_TEMPLATE(trackTitle, trackCategory, trackDifficulty, mythIndex + 1, totalMythsInTrack);
					const apiKey = PERPLEXITY_API_KEY;
					if (!apiKey) throw new Error('API key is not configured.');

					const payload = {
						model: 'sonar',
						messages: [{ role: 'system', content: systemPromptContent }, { role: 'user', content: `Generate myth number ${mythIndex + 1} for track "${trackTitle}".` }],
						temperature: 0.35, max_tokens: 3500,
						web_search_options: { search_context_size: 'low' },
						return_images: false, return_related_questions: false,
						response_format: {
							type: 'json_schema',
							json_schema: {
								schema: {
									type: 'object',
									properties: {
										statement: { type: 'string' }, isTrue: { type: 'boolean' }, explanation: { type: 'string' },
										citations: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' } }, required: ['title', 'url'] } }
									},
									required: ['statement', 'isTrue', 'explanation', 'citations'], additionalProperties: false
								}
							}
						}
					};

					const resp = await fetch(PERPLEXITY_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(payload) });

					if (!resp.ok) {
						let errorBody = ''; try { errorBody = await resp.text(); } catch (e) { /* ignore */ }
						throw new Error(`API request failed: ${resp.status}${errorBody ? `: ${errorBody}` : '.'}`);
					}
					const answer = await resp.json();
					let parsedContent = answer.choices?.[0]?.message?.content;

                    if (typeof parsedContent === 'string') {
                        try { parsedContent = JSON.parse(parsedContent); } 
                        catch (e: any) { throw new Error(`Invalid API response: Content string not valid JSON. ${e.message}`); }
                    }

					if (!parsedContent || typeof parsedContent !== 'object') {
						throw new Error('Invalid API response: Expected JSON object.');
					}
					if (typeof parsedContent.statement !== 'string' || typeof parsedContent.isTrue !== 'boolean' || typeof parsedContent.explanation !== 'string' || !Array.isArray(parsedContent.citations)) {
						throw new Error('Parsed JSON does not match GameStatement structure.');
					}
					gameStatement = parsedContent as GameStatement;
					if (gameStatement) cacheTrackMyth(cacheKey, gameStatement);

				} catch (error: any) {
					console.error('[ACTION generateMyth] Error:', error.message);
					return fail(500, { error: error.message || 'Failed to generate myth.', action: 'generateMyth', success: false, statement: '', isTrue: false, explanation: 'API Error', citations: [], trackId, trackTitle, currentMythIndex: mythIndex, totalMythsInTrack });
				}
			}

			if (!gameStatement) {
				return fail(500, { error: 'Failed to retrieve myth.', action: 'generateMyth', success: false, statement: '', isTrue: false, explanation: '', citations: [], trackId, trackTitle, currentMythIndex: mythIndex, totalMythsInTrack });
			}

			return { success: true, ...gameStatement, trackId, trackTitle, currentMythIndex: mythIndex, totalMythsInTrack, isLastMythInTrack: mythIndex === totalMythsInTrack - 1, cached: fromCache, action: 'generateMyth' } as GenerateActionResult;
		} else {
			return fail(400, { error: 'Track completed or invalid index.', action: 'generateMyth', success: false, statement: '', isTrue: false, explanation: 'Track completed.', citations: [], trackId, trackTitle, currentMythIndex: mythIndex, totalMythsInTrack, trackCompleted: true, isLastMythInTrack: true });
		}
	},

	checkAnswer: async ({ request }) => {
		const formData = await request.formData();
		const userAnswer = formData.get('answer') === 'true';
		const isTrue = formData.get('isTrue') === 'true';
		const confidence = parseInt(formData.get('confidence')?.toString() || '50');
		const statement = formData.get('statement')?.toString() || '';
		const explanation = formData.get('explanation')?.toString() || '';
		let citations: Citation[] = [];
		const citationsString = formData.get('citations')?.toString();
		if (citationsString) {
			try { 
				const parsed = JSON.parse(citationsString);
				if(Array.isArray(parsed)) citations = parsed.map((c:any) => ({title: c.title || '', url: c.url || ''}));
			 } catch (e) { /* ignore */ }
		}

		if (!statement || formData.get('isTrue') === null) {
			return fail(400, { error: 'Missing statement data.', action: 'checkAnswer', success: false });
		}
		const isCorrect = userAnswer === isTrue;
		return { success: true, result: isCorrect ? 'correct' : 'incorrect', statement, userAnswer, isTrue, explanation, citations, points: isCorrect ? Math.round(confidence) : 0, action: 'checkAnswer' } as CheckAnswerActionResult;
	}
};
