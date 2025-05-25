// myth-buster/src/routes/game/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
// @ts-expect-error editor-error
import { PERPLEXITY_API_KEY } from '$env/static/private';
import { building } from '$app/environment';
import type {
	Citation,
	GameStatement,
	GenerateActionResult,
	CheckAnswerActionResult
} from '$lib/game/types';

// API Configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

const GAME_SYSTEM_PROMPT = `You are an AI that generates engaging and verifiable statements for a myth-busting game using evidence-based research.

Your task is to create statements that are:
1. Definitively true or false based on current scientific evidence and reliable sources
2. Engaging and thought-provoking to challenge common assumptions
3. Appropriately calibrated to the requested difficulty and category
4. Supported by authoritative, verifiable sources

Guidelines for statement generation:
- For EASY difficulty: Use well-known topics with clear, unambiguous answers
- For MEDIUM difficulty: Include moderately obscure facts or common misconceptions
- For HARD difficulty: Focus on specialized knowledge, counterintuitive facts, or nuanced scientific concepts
- Vary statement types: direct assertions, common beliefs, surprising claims, or historical "facts"
- Avoid overly technical jargon but maintain scientific accuracy
- Search for current, reliable evidence to support your claims
- Ensure statements are specific enough to be definitively verified

Category considerations:
- Science: Focus on established scientific consensus, recent discoveries, or debunked theories
- History: Include verified historical events, debunked myths, or lesser-known facts
- Health: Use evidence-based medical information from reputable health organizations
- Technology: Reference current technological capabilities and limitations
- Nature: Include biological facts, environmental science, or animal behavior

Source requirements:
- Prioritize peer-reviewed studies, official organizations, and established institutions
- Include publication years in citations when possible
- Verify information against multiple authoritative sources
- Avoid unreliable or biased sources

Return your response as a JSON object with the following structure:
{
  "statement": "A clear, specific statement that can be definitively verified as true or false",
  "isTrue": boolean,
  "explanation": "A comprehensive explanation with specific evidence, correcting misconceptions if applicable",
  "citations": [
    {
      "title": "Specific source title with publication year if available",
      "url": "URL to authoritative source"
    }
  ]
}

Ensure the output is ONLY the JSON object.`;

interface CachedGameStatementResponse {
	timestamp: number;
	response: GameStatement;
	expiresAt: number;
}
const gameStatementCache: Map<string, CachedGameStatementResponse> = !building ? new Map() : new Map();
const GAME_CACHE_EXPIRATION_MS = 10 * 1000;

function getCachedGameStatement(key: string): GameStatement | null {
	console.log(`[GAME CACHE] Always generating new questions (cache disabled).`);
	return null;
}

function cacheGameStatement(key: string, response: GameStatement): void {
	if (building) return;
	const now = Date.now();
	gameStatementCache.set(key, { timestamp: now, response, expiresAt: now + GAME_CACHE_EXPIRATION_MS });
	console.log(`[GAME CACHE] Cached entry for key: ${key}`);
}

async function generateStatementFromAPI(difficulty: string, category: string): Promise<GameStatement> {
	console.log(`[API CALL] Generating statement: Difficulty: ${difficulty}, Category: ${category}`);
	const apiKey = PERPLEXITY_API_KEY;
	if (!apiKey) throw new Error('API key is not configured.');

	const userQuery = `Generate a ${difficulty} difficulty statement in the ${category} category.`;
	const payload = {
		model: 'sonar',
		messages: [{ role: 'system', content: GAME_SYSTEM_PROMPT }, { role: 'user', content: userQuery }],
		temperature: 0.3, max_tokens: 3000,
		web_search_options: { search_context_size: 'low' },
		return_images: false, return_related_questions: false,
		response_format: {
			type: 'json_schema',
			json_schema: {
				schema: {
					type: 'object',
					properties: {
						statement: { type: 'string', description: 'The myth statement' },
						isTrue: { type: 'boolean', description: 'Whether the statement is true or false' },
						explanation: { type: 'string', description: 'Explanation of the verdict' },
						citations: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, url: { type: 'string' } }, required: ['title', 'url'] } }
					},
					required: ['statement', 'isTrue', 'explanation', 'citations'],
					additionalProperties: false
				}
			}
		}
	};

	const resp = await fetch(PERPLEXITY_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(payload) });

	if (!resp.ok) {
		let errorBody = ''; try { errorBody = await resp.text(); } catch (e) { /* ignore */ }
		console.error('[API ERROR] Request failed:', resp.status, errorBody);
		throw new Error(`API request failed: ${resp.status}${errorBody ? `: ${errorBody}` : '.'}`);
	}

	const answer = await resp.json();
	let parsedContent = answer.choices?.[0]?.message?.content;

    // Robust parsing: if content is a string, try to parse it.
    if (typeof parsedContent === 'string') {
        try {
            parsedContent = JSON.parse(parsedContent);
        } catch (e: any) {
            console.error('[API PARSE ERROR] Content was string, failed to parse as JSON:', parsedContent, e.message);
            throw new Error(`Invalid API response: Content string not valid JSON. ${e.message}`);
        }
    }

	if (!parsedContent || typeof parsedContent !== 'object') {
		console.error('[API PARSE ERROR] Content is not an object after potential parse:', parsedContent);
		throw new Error('Invalid API response: Expected a JSON object.');
	}

	if (typeof parsedContent.statement !== 'string' || typeof parsedContent.isTrue !== 'boolean' || typeof parsedContent.explanation !== 'string' || !Array.isArray(parsedContent.citations) || !parsedContent.citations.every((c: any) => typeof c.title === 'string' && typeof c.url === 'string')) {
		console.error('[API VALIDATION ERROR] Parsed JSON structure invalid:', parsedContent);
		throw new Error('Parsed JSON does not match expected GameStatement structure.');
	}
	return parsedContent as GameStatement;
}

export const actions: Actions = {
	generate: async ({ request }) => {
		const formData = await request.formData();
		const difficulty = formData.get('difficulty')?.toString() || 'medium';
		const category = formData.get('category')?.toString() || 'general';
		try {
			const generatedData = await generateStatementFromAPI(difficulty, category);
			// Caching is disabled in getCachedGameStatement but if re-enabled, this would be where to use it.
			// cacheGameStatement(cacheKey, generatedData); 
			return { success: true, ...generatedData, cached: false, action: 'generate' } as GenerateActionResult;
		} catch (error: any) {
			console.error('[ACTION generate API ERROR]', error);
			return fail(500, { error: error.message || 'Failed to generate statement.', action: 'generate', success: false, statement: '', isTrue: false, explanation: 'API Error', citations: [], difficulty, category });
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
				if(Array.isArray(parsed)) citations = parsed;
			} catch (e) { /* ignore */ }
		}

		if (!statement || formData.get('isTrue') === null) {
			return fail(400, { error: 'Missing statement data.', action: 'checkAnswer', success: false });
		}

		const isCorrect = userAnswer === isTrue;
		return {
			success: true, result: isCorrect ? 'correct' : 'incorrect',
			statement, userAnswer, isTrue, explanation, citations,
			points: isCorrect ? Math.round(confidence) : 0,
			action: 'checkAnswer'
		} as CheckAnswerActionResult;
	}
};
