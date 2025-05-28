import { json, type RequestEvent } from '@sveltejs/kit';
// @ts-ignore
import { PERPLEXITY_API_KEY, PERPLEXITY_API_URL, PERPLEXITY_QUALITY } from '$env/static/private';
import { building } from '$app/environment';

const MINI_MYTH_BATCH_SYSTEM_PROMPT = `You are a highly accurate, evidence-based myth-busting AI.
Your task is to generate a batch of exactly 5 distinct, common myth statements and provide a brief, factual verification for each.

For each of the 5 myths you generate:
1.  Provide the myth statement as a concise string.
2.  Determine its "verdict":
    -   \`true\` if the statement is factually correct based on current knowledge and evidence.
    -   \`false\` if the statement is a common misconception or factually incorrect.
3.  Provide a brief (1-3 sentences) explanation that clearly justifies the verdict with factual information. The explanation should correct the misconception if the verdict is false, or explain the supporting fact if true.

Ensure the 5 statements are:
-   Distinct and cover a variety of topics (e.g., science, history, health, pop culture).
-   Commonly believed or interesting to a general audience.
-   Verifiable with reliable sources (even if not explicitly citing them in the output, base your response on research).

Return your response strictly as a single JSON array containing exactly 5 objects. Each object must have the following structure:
{
  "statement": "A concise myth statement.",
  "verdict": boolean, // true or false
  "explanation": "A brief (1-3 sentences) factual explanation for the verdict."
}

Example of the expected JSON array output (showing 2 for structure):
[
  {
    "statement": "You lose most of your body heat through your head.",
    "verdict": false,
    "explanation": "This is a myth; you lose heat proportionally from any exposed body part. The head seems significant only because it's often uncovered."
  },
  {
    "statement": "The Great Wall of China is the only man-made structure visible from space.",
    "verdict": false,
    "explanation": "This is a common misconception. Many man-made structures are visible from low Earth orbit, and the Great Wall is difficult to see without aid."
  }
]
Ensure your response is ONLY the JSON array, without any surrounding text, explanations, or markdown code blocks (like \`\`\`json).
The array must contain exactly 5 myth objects.`;

type MiniMyth = {
	statement: string;
	verdict: boolean;
	explanation: string;
};

type CachedMiniMythResponse = {
	timestamp: number;
	response: MiniMyth[]; // Caches an array of myths
	expiresAt: number;
};

const miniMythCache: Map<string, CachedMiniMythResponse> = !building ? new Map() : new Map();
const MINI_MYTHS_BATCH_CACHE_KEY = 'mini_myths_batch';
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCachedMiniMythBatchResponse(key: string): MiniMyth[] | null {
	const now = Date.now();
	const cachedData = miniMythCache.get(key);

	if (!cachedData) {
		return null;
	}

	if (now >= cachedData.expiresAt) {
		miniMythCache.delete(key);
		return null;
	}
	return cachedData.response;
}

function cacheMiniMythBatchResponse(key: string, response: MiniMyth[]): void {
	const now = Date.now();
	miniMythCache.set(key, {
		timestamp: now,
		response,
		expiresAt: now + CACHE_EXPIRATION_MS
	});
}

async function fetchAndVerifyRandomMythsBatch(apiKey: string): Promise<MiniMyth[] | null> {
	const cachedResponse = getCachedMiniMythBatchResponse(MINI_MYTHS_BATCH_CACHE_KEY);

	if (cachedResponse) {
		console.log(`Using cached response for mini-myth batch.`);
		return cachedResponse;
	}

	const payload = {
		model: 'sonar', // Using a capable model like sonar is good for generation tasks
		messages: [
			{ role: 'system', content: MINI_MYTH_BATCH_SYSTEM_PROMPT },
			// User prompt can be minimal as the system prompt is very detailed
			{
				role: 'user',
				content:
					'Please generate 5 random myths with their verifications as per the system prompt instructions.'
			}
		],
		temperature: 0.4, // A little variety in myths, but grounded in fact
		max_tokens: 1200, // Adequate tokens for 5 statements and brief explanations
		web_search_options: {
			search_context_size: PERPLEXITY_QUALITY // Low context for finding common myths and verifying them
		},
		return_images: false, // Not needed for this task
		return_related_questions: false // Not needed for this task
	};

	console.log('Fetching new batch of random myths from Perplexity API...');

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
			console.error(`Perplexity API error for mini-myth batch: ${resp.status} ${resp.statusText}`);
			// Try to read error body for more details
			try {
				const errorBody = await resp.json();
				console.error('Perplexity API error body:', errorBody);
			} catch (e) {
				console.error('Could not parse Perplexity API error body.');
			}
			return null; // Or throw an error to be caught by the caller
		}

		const apiResult = await resp.json();
		const content = apiResult.choices?.[0]?.message?.content;

		if (content) {
			try {
				// The prompt asks for a raw JSON array.
				const parsedMyths: any[] = JSON.parse(content);

				// Validate the structure of the response
				if (
					Array.isArray(parsedMyths) &&
					parsedMyths.length === 5 && // Expecting exactly 5 myths
					parsedMyths.every(
						(myth) =>
							typeof myth.statement === 'string' &&
							typeof myth.verdict === 'boolean' &&
							typeof myth.explanation === 'string'
					)
				) {
					const validatedMyths: MiniMyth[] = parsedMyths;
					cacheMiniMythBatchResponse(MINI_MYTHS_BATCH_CACHE_KEY, validatedMyths);
					console.log('Successfully fetched and parsed new myth batch.');
					return validatedMyths;
				} else {
					console.error(
						`Invalid JSON array structure or content from Perplexity API for myth batch:`,
						parsedMyths
					);
					return null;
				}
			} catch (e) {
				console.error(
					`Failed to parse JSON response from Perplexity API for myth batch:`,
					content,
					e
				);
				// Fallback for markdown-wrapped JSON array (less likely with new prompt but good to have)
				const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
				if (jsonMatch && jsonMatch[1]) {
					try {
						const parsedMythsFallback: any[] = JSON.parse(jsonMatch[1]);
						if (
							Array.isArray(parsedMythsFallback) &&
							parsedMythsFallback.length === 5 &&
							parsedMythsFallback.every(
								(myth) =>
									typeof myth.statement === 'string' &&
									typeof myth.verdict === 'boolean' &&
									typeof myth.explanation === 'string'
							)
						) {
							const validatedMythsFallback: MiniMyth[] = parsedMythsFallback;
							cacheMiniMythBatchResponse(MINI_MYTHS_BATCH_CACHE_KEY, validatedMythsFallback);
							console.log('Successfully fetched and parsed new myth batch from fallback.');
							return validatedMythsFallback;
						}
					} catch (e2) {
						console.error(`Failed to parse fallback JSON from markdown for myth batch:`, e2);
					}
				}
				return null;
			}
		}
		console.error(`No content received from Perplexity API for myth batch.`);
		return null;
	} catch (error) {
		console.error(`Failed to fetch random myths batch:`, error);
		return null;
	}
}

export async function GET({}: RequestEvent) {
	const apiKey = PERPLEXITY_API_KEY;

	if (!apiKey) {
		console.error('Missing Perplexity API key for /api/minimyths route.');
		return json({ error: 'Server configuration error: API key is missing.' }, { status: 500 });
	}

	const mythBatch = await fetchAndVerifyRandomMythsBatch(apiKey);

	if (mythBatch && mythBatch.length > 0) {
		return json(mythBatch);
	} else {
		// This could happen if API call fails or returns invalid/empty data.
		return json(
			{
				error:
					'Failed to fetch any myth data. The API might be temporarily unavailable, misconfigured, or returned an unexpected format.'
			},
			{ status: 503 } // Service Unavailable
		);
	}
}
