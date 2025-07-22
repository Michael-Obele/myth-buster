// Imports for SvelteKit server-side functionality and environment variables
import type { Actions } from './$types';
import { PERPLEXITY_API_KEY, PERPLEXITY_API_URL, PERPLEXITY_QUALITY } from '$env/static/private';
import { building } from '$app/environment';
import type { MythVerificationResult, LensResult } from '$lib/types'; // Import from shared types
import { prisma } from '$lib/server/db'; // Import the shared Prisma client
import { error } from '@sveltejs/kit'; // Import the error function

import type { PageServerLoad } from './$types';
import {
	ANALYZE_SOURCE_SYSTEM_PROMPT,
	RESEARCH_LENS_SYSTEM_PROMPT,
	SYNTHESIZE_INSIGHTS_SYSTEM_PROMPT,
	VERIFY_MYTH_SYSTEM_PROMPT
} from './prompts';

interface Citation {
	title: string;
	url: string;
}

interface VerifyMythResponse {
	verdict: 'true' | 'false' | 'inconclusive';
	explanation: string;
	citations: Citation[];
	mythOrigin?: string;
	relatedMyth?: string;
	whyBelieved?: string;
}

interface ResearchLensResponse {
	explanation: string;
	keyInsights: string[];
	citations: Citation[];
}

interface AnalyzeSourceResponse {
	analysis: string;
	reliability?: string;
	methodology?: string;
	corroborating: string[];
	contradicting: string[];
}

interface SynthesizeInsightsResponse {
	overallInsight: string;
	themes: { title: string; description: string }[];
	connections: string[];
	contradictions: string[];
}

// --- Perplexity API Response Types ---
interface PerplexityMessage {
	role: string;
	content: string | object;
}

interface PerplexityChoice {
	index: number;
	finish_reason: string;
	message: PerplexityMessage;
	delta?: {
		role?: string;
		content?: string;
	};
}

interface PerplexityUsage {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
	search_context_size?: string;
}

interface PerplexityRawResponse {
	id: string;
	model: string;
	created: number;
	usage: PerplexityUsage;
	citations?: string[] | { title?: string; url: string }[];
	object: string;
	choices: PerplexityChoice[];
}
// --- End Perplexity API Response Types ---

// Helper function to validate citation arrays
function isValidCitationsArray(arr: any): arr is Citation[] {
	if (!Array.isArray(arr)) return false;
	return arr.every(
		(c: any) =>
			typeof c === 'object' &&
			c !== null &&
			typeof c.title === 'string' &&
			typeof c.url === 'string'
	);
}

type CachedResponse = { timestamp: number; response: MythVerificationResult; expiresAt: number };
const responseCache: Map<string, CachedResponse> = !building ? new Map() : new Map();
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

function getCachedResponse(key: string): MythVerificationResult | null {
	const now = Date.now();
	const cachedData = responseCache.get(key);
	if (!cachedData) {
		console.log(`[CACHE] Miss for key: ${key}`);
		return null;
	}
	if (now >= cachedData.expiresAt) {
		responseCache.delete(key);
		console.log(`[CACHE] Expired for key: ${key}`);
		return null;
	}
	console.log(`[CACHE] Hit for key: ${key}`);
	return cachedData.response;
}

function cacheResponse(key: string, response: MythVerificationResult): void {
	if (building) return;
	const now = Date.now();
	responseCache.set(key, { timestamp: now, response, expiresAt: now + CACHE_EXPIRATION_MS });
	console.log(`[CACHE] Set for key: ${key}`);
}

async function makePerplexityRequest<T>(
	apiKey: string,
	payload: object,
	actionName: string
): Promise<{ answer: PerplexityRawResponse; parsedContent: T }> {
	console.log(`[${actionName}] Making API request. Payload:`, JSON.stringify(payload, null, 2));
	const resp = await fetch(PERPLEXITY_API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
		body: JSON.stringify(payload)
	});
	console.log(`[${actionName}] API Response Status: ${resp.status} ${resp.statusText}`);

	if (!resp.ok) {
		let errorBody = '';
		try {
			errorBody = await resp.text();
		} catch (e: unknown) {
			console.warn(
				`[${actionName}] Failed to get error body text:`,
				e instanceof Error ? e.message : String(e)
			);
		}
		console.error(`[${actionName}] API Error ${resp.status}:`, errorBody);
		if (resp.status === 429) {
			throw error(429, `API rate limit exceeded: ${errorBody}`);
		}
		throw new Error(`API error ${resp.status}${errorBody ? `: ${errorBody}` : '.'}`);
	}

	const answer: PerplexityRawResponse = await resp.json();
	console.log(`[${actionName}] API Raw Response JSON:`, JSON.stringify(answer, null, 2));

	const contentFromAPI: string | object | undefined = answer.choices?.[0]?.message?.content;
	let parsedContent: T;

	if (typeof contentFromAPI === 'string') {
		try {
			parsedContent = JSON.parse(contentFromAPI) as T;
		} catch (e: unknown) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			console.error(
				`[${actionName}] Failed to parse content string as JSON:`,
				contentFromAPI,
				errorMessage
			);
			throw new Error(`Invalid API response: Content string not valid JSON. ${errorMessage}`);
		}
	} else if (typeof contentFromAPI === 'object' && contentFromAPI !== null) {
		parsedContent = contentFromAPI as T;
	} else {
		console.error(
			`[${actionName}] API response content is not a string or suitable object. Content:`,
			contentFromAPI
		);
		throw new Error('API response format error: Expected content to be a JSON string or object.');
	}

	if (typeof parsedContent !== 'object' || parsedContent === null) {
		console.error(
			`[${actionName}] API response content is not a JSON object after processing. Processed Content:`,
			parsedContent
		);
		throw new Error('API response format error: Expected a JSON object after processing.');
	}

	console.log(`[${actionName}] Parsed API content (JSON object):`, parsedContent);
	return { answer, parsedContent };
}

async function verifyMythLogic(
	myth: string,
	userApiKey: string | null
): Promise<MythVerificationResult> {
	const actionName = 'verifyMythLogic';
	console.log(`[${actionName}] Verifying myth: "${myth}"`);
	if (typeof myth !== 'string' || !myth.trim()) {
		console.error(`[${actionName}] Invalid input: Myth is required.`);
		return { success: false, error: 'Myth is required.' };
	}

	const apiKey = userApiKey || PERPLEXITY_API_KEY;
	if (!apiKey) {
		console.error(
			`[${actionName}] API key missing. User provided: ${!!userApiKey}, Env var: ${!!PERPLEXITY_API_KEY}`
		);
		return {
			success: false,
			error: 'Missing Perplexity API key. Please provide one or ensure it is configured.',
			data: {
				verdict: 'inconclusive',
				explanation: 'Server config error',
				citations: [],
				mythOrigin: '',
				relatedMyth: '',
				whyBelieved: ''
			}
		};
	}

	const feature = 'myth_verification';
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0); // Truncate to day for UTC comparison

	if (!userApiKey) {
		console.log(
			`[${actionName}] No user API key provided. Checking global rate limit for feature: ${feature}`
		);
		// Check global rate limit
		const globalUsage = await prisma.globalApiUsage.upsert({
			where: { feature_date: { feature, date: today } },
			update: {}, // No direct update needed here, just fetch
			create: { feature, date: today, count: 0 }
		});

		const currentCount = globalUsage.count;
		const globalLimit = 10; // As per plan

		if (currentCount >= globalLimit) {
			console.warn(
				`[${actionName}] Daily global limit exceeded for feature "${feature}". Current count: ${currentCount}`
			);
			return {
				success: false,
				error:
					'Daily global limit exceeded for this feature. Please try again tomorrow or provide your custom API key to bypass limits.',
				data: {
					verdict: 'inconclusive',
					explanation: 'Rate limit exceeded.',
					citations: [],
					mythOrigin: '',
					relatedMyth: '',
					whyBelieved: ''
				}
			};
		}

		// Increment global usage
		await prisma.globalApiUsage.update({
			where: { feature_date: { feature, date: today } },
			data: { count: { increment: 1 } }
		});
		console.log(
			`[${actionName}] Global usage incremented for feature "${feature}". New count: ${currentCount + 1}`
		);
	} else {
		console.log(
			`[${actionName}] User API key provided. Bypassing global rate limit for feature: ${feature}`
		);
	}

	const cacheKey = `verifyMyth:${myth.trim().toLowerCase()}`;
	const cachedResponse = getCachedResponse(cacheKey);
	if (cachedResponse) {
		console.log(`[${actionName}] Returning cached response for: "${myth}"`);
		return { ...cachedResponse, cached: true };
	}
	console.log(`[${actionName}] No cache hit for: "${myth}"`);

	const payload = {
		model: 'sonar',
		messages: [
			{ role: 'system', content: VERIFY_MYTH_SYSTEM_PROMPT },
			{ role: 'user', content: myth }
		],
		temperature: 0.2,
		max_tokens: 4000,
		web_search_options: { search_context_size: PERPLEXITY_QUALITY },
		return_images: false,
		return_related_questions: false,
		response_format: {
			type: 'json_schema',
			json_schema: {
				schema: {
					type: 'object',
					properties: {
						verdict: { type: 'string', enum: ['true', 'false', 'inconclusive'] },
						explanation: { type: 'string' },
						citations: {
							type: 'array',
							items: {
								type: 'object',
								properties: { title: { type: 'string' }, url: { type: 'string' } },
								required: ['title', 'url']
							}
						},
						mythOrigin: { type: 'string' },
						relatedMyth: { type: 'string' },
						whyBelieved: { type: 'string' }
					},
					required: ['verdict', 'explanation', 'citations'],
					additionalProperties: false
				}
			}
		}
	};

	try {
		const { answer, parsedContent } = await makePerplexityRequest<VerifyMythResponse>(
			apiKey,
			payload,
			actionName
		);

		if (
			typeof parsedContent.verdict !== 'string' ||
			!['true', 'false', 'inconclusive'].includes(parsedContent.verdict) ||
			typeof parsedContent.explanation !== 'string' ||
			!isValidCitationsArray(parsedContent.citations) ||
			(parsedContent.mythOrigin !== undefined && typeof parsedContent.mythOrigin !== 'string') ||
			(parsedContent.relatedMyth !== undefined && typeof parsedContent.relatedMyth !== 'string') ||
			(parsedContent.whyBelieved !== undefined && typeof parsedContent.whyBelieved !== 'string')
		) {
			console.error(`[${actionName}] Parsed content validation failed:`, parsedContent);
			throw new Error('Parsed API response does not match expected VerifyMythResponse structure.');
		}

		const verdict: 'true' | 'false' | 'inconclusive' = parsedContent.verdict;

		const apiCitations: Citation[] = [];
		if (answer.citations) {
			answer.citations.forEach(
				(citation: string | { title?: string; url: string }, index: number) => {
					if (typeof citation === 'string') {
						apiCitations.push({ title: `Source ${index + 1}`, url: citation });
					} else if (typeof citation === 'object' && citation.url) {
						apiCitations.push({
							title: citation.title || `Source ${index + 1}`,
							url: citation.url
						});
					}
				}
			);
		}

		const citationMap = new Map<string, { title: string; url: string }>();
		(parsedContent.citations || []).forEach((c: Citation) => {
			if (c.url) citationMap.set(c.url, c);
		});
		apiCitations.forEach((c: Citation) => {
			if (c.url && !citationMap.has(c.url)) citationMap.set(c.url, c);
		});

		const responseData: MythVerificationResult = {
			success: true,
			cached: false,
			myth,
			data: {
				answer,
				explanation: parsedContent.explanation,
				citations: Array.from(citationMap.values()),
				mythOrigin: parsedContent.mythOrigin || '',
				relatedMyth: parsedContent.relatedMyth || '',
				whyBelieved: parsedContent.whyBelieved || '',
				verdict
			}
		};
		cacheResponse(cacheKey, responseData);
		console.log(`[${actionName}] Successfully verified myth: "${myth}". Returning data.`);
		return responseData;
	} catch (err: unknown) {
		const errorMessage = err instanceof Error ? err.message : 'Failed to verify myth.';
		console.error(`[${actionName}] Error verifying myth "${myth}":`, errorMessage);
		return {
			success: false,
			error: errorMessage,
			data: {
				verdict: 'inconclusive',
				explanation: `Error: ${errorMessage}`,
				citations: [],
				mythOrigin: '',
				relatedMyth: '',
				whyBelieved: ''
			}
		};
	}
}

export const load: PageServerLoad = async ({ url, cookies }) => {
	const myth = url.searchParams.get('myth');
	const userApiKey = cookies.get('user_provided_api_key') || null;

	if (myth) {
		console.log(`[PageLoad] Myth parameter found in URL: "${myth}". Verifying...`);
		return await verifyMythLogic(myth, userApiKey);
	}
	console.log(`[PageLoad] No myth parameter in URL.`);
	return {};
};

export const actions: Actions = {
	verifyMyth: async ({ request, cookies }) => {
		console.log("[Action] 'verifyMyth' called.");
		const data = await request.formData();
		const myth = (data.get('myth') as string).trim();
		const userApiKey = cookies.get('user_provided_api_key') || null;

		if (typeof myth !== 'string' || !myth.trim()) {
			console.error('[Action verifyMyth] Invalid input: Myth is required.');
			throw error(400, 'Myth is required.');
		}
		console.log(`[Action verifyMyth] Received myth: "${myth}"`);
		return await verifyMythLogic(myth, userApiKey);
	},

	researchLens: async ({ request, cookies }) => {
		const actionName = 'researchLens';
		console.log(`[Action ${actionName}] Called.`);
		const data = await request.formData();
		const mythStatement = data.get('mythStatement') as string;
		const lensType = data.get('lensType') as string;
		const lensName = data.get('lensName') as string;
		const customQuery = data.get('customQuery') as string | null;
		const userApiKey = cookies.get('user_provided_api_key') || null;

		console.log(`[Action ${actionName}] Received data:`, {
			mythStatement,
			lensType,
			lensName,
			customQuery
		});

		if (!mythStatement?.trim() || !lensType?.trim() || !lensName?.trim()) {
			console.error(
				`[Action ${actionName}] Invalid input: Myth statement, lens type, and lens name are required.`
			);
			return { success: false, error: 'Myth statement, lens type, and lens name are required.' };
		}
		const apiKey = userApiKey || PERPLEXITY_API_KEY;
		if (!apiKey) {
			console.error(
				`[Action ${actionName}] API key missing. User provided: ${!!userApiKey}, Env var: ${!!PERPLEXITY_API_KEY}`
			);
			return {
				success: false,
				error: 'Missing API key. Please provide one or ensure it is configured.'
			};
		}

		const feature = 'game_question'; // Assuming game_question for research lenses
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0); // Truncate to day for UTC comparison

		if (!userApiKey) {
			console.log(
				`[${actionName}] No user API key provided. Checking global rate limit for feature: ${feature}`
			);
			// Check global rate limit
			const globalUsage = await prisma.globalApiUsage.upsert({
				where: { feature_date: { feature, date: today } },
				update: {},
				create: { feature, date: today, count: 0 }
			});

			const currentCount = globalUsage.count;
			const globalLimit = 10; // As per plan

			if (currentCount >= globalLimit) {
				console.warn(
					`[${actionName}] Daily global limit exceeded for feature "${feature}". Current count: ${currentCount}`
				);
				return {
					success: false,
					error:
						'Daily global limit exceeded for this feature. Please try again tomorrow or provide your custom API key to bypass limits.'
				};
			}

			// Increment global usage
			await prisma.globalApiUsage.update({
				where: { feature_date: { feature, date: today } },
				data: { count: { increment: 1 } }
			});
			console.log(
				`[${actionName}] Global usage incremented for feature "${feature}". New count: ${currentCount + 1}`
			);
		} else {
			console.log(
				`[${actionName}] User API key provided. Bypassing global rate limit for feature: ${feature}`
			);
		}

		let lensPrompt = '';
		if (lensType === 'custom' && customQuery) {
			lensPrompt = `Analyze the myth "${mythStatement}" from this specific perspective: ${customQuery}. Provide detailed analysis and cite relevant sources.`;
		} else {
			const lensPrompts: Record<string, string> = {
				historical: `Examine the myth "${mythStatement}" from a historical perspective. Analyze its origins, how it developed over time, and the historical context that may have influenced its creation or spread.`,
				scientific: `Analyze the myth "${mythStatement}" from a scientific standpoint. Examine the evidence, methodologies, and scientific consensus related to this claim.`,
				cultural: `Explore the myth "${mythStatement}" from a cultural and social perspective. How does this belief vary across different cultures and societies?`,
				psychological: `Investigate the myth "${mythStatement}" from a psychological perspective. What cognitive biases, mental processes, or psychological factors contribute to belief in this myth?`,
				economic: `Examine the myth "${mythStatement}" from an economic perspective. Are there financial interests, market forces, or economic factors that influence this belief?`,
				political: `Analyze the myth "${mythStatement}" from a political perspective. How might political ideologies, power structures, or governance relate to this belief?`
			};
			lensPrompt = lensPrompts[lensType] || lensPrompts.scientific;
		}
		console.log(`[Action ${actionName}] Constructed lensPrompt: "${lensPrompt}"`);

		const payload = {
			model: 'sonar',
			messages: [
				{ role: 'system', content: RESEARCH_LENS_SYSTEM_PROMPT },
				{ role: 'user', content: lensPrompt }
			],
			temperature: 0.3,
			max_tokens: 3000,
			web_search_options: { search_context_size: PERPLEXITY_QUALITY },
			return_images: false,
			return_related_questions: false,
			response_format: {
				type: 'json_schema',
				json_schema: {
					schema: {
						type: 'object',
						properties: {
							explanation: { type: 'string' },
							keyInsights: { type: 'array', items: { type: 'string' } },
							citations: {
								type: 'array',
								items: {
									type: 'object',
									properties: { title: { type: 'string' }, url: { type: 'string' } },
									required: ['title', 'url']
								}
							}
						},
						required: ['explanation', 'keyInsights', 'citations'],
						additionalProperties: false
					}
				}
			}
		};

		try {
			const { answer, parsedContent } = await makePerplexityRequest<ResearchLensResponse>(
				apiKey,
				payload,
				actionName
			);

			if (
				typeof parsedContent.explanation !== 'string' ||
				!Array.isArray(parsedContent.keyInsights) ||
				!parsedContent.keyInsights.every((k: string) => typeof k === 'string') ||
				!isValidCitationsArray(parsedContent.citations)
			) {
				console.error(
					`[${actionName}] Parsed JSON for ResearchLensResponse does not match expected structure.`,
					parsedContent
				);
				throw new Error(
					'API response validation failed: Incorrect structure for ResearchLensResponse.'
				);
			}

			const apiCitations: Citation[] = [];
			if (answer.citations) {
				answer.citations.forEach(
					(citation: string | { title?: string; url: string }, index: number) => {
						if (typeof citation === 'string') {
							apiCitations.push({ title: `Source ${index + 1}`, url: citation });
						} else if (typeof citation === 'object' && citation.url) {
							apiCitations.push({
								title: citation.title || `Source ${index + 1}`,
								url: citation.url
							});
						}
					}
				);
			}

			const citationMap = new Map<string, { title: string; url: string }>();
			(parsedContent.citations || []).forEach((c: Citation) => {
				if (c.url) citationMap.set(c.url, c);
			});
			apiCitations.forEach((c: Citation) => {
				if (c.url && !citationMap.has(c.url)) citationMap.set(c.url, c);
			});

			const resultData = {
				success: true,
				lensId: lensType,
				result: {
					explanation: parsedContent.explanation,
					keyInsights: parsedContent.keyInsights,
					citations: Array.from(citationMap.values())
				}
			};
			console.log(`[Action ${actionName}] Successfully researched lens. Returning data.`);
			return resultData;
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : `Failed to research lens.`;
			console.error(`[Action ${actionName}] Error:`, errorMessage);
			return { success: false, error: errorMessage };
		}
	},

	analyzeSource: async ({ request, cookies }) => {
		const actionName = 'analyzeSource';
		console.log(`[Action ${actionName}] Called.`);
		const data = await request.formData();
		const sourceUrl = data.get('sourceUrl') as string;
		const sourceName = data.get('sourceName') as string;
		const mythContext = data.get('mythContext') as string;
		const analysisType = data.get('analysisType') as string | null;
		const customQuery = data.get('customQuery') as string | null;
		const userApiKey = cookies.get('user_provided_api_key') || null;

		console.log(`[Action ${actionName}] Received data:`, {
			sourceUrl,
			sourceName,
			mythContext,
			analysisType,
			customQuery
		});

		let analysisTypeNameForDisplay = 'General Analysis';
		if (analysisType === 'custom' && customQuery?.trim()) {
			analysisTypeNameForDisplay = `Custom Query: "${customQuery.trim()}"`;
		} else if (analysisType) {
			const typeMap: Record<string, string> = {
				reliability: 'Reliability Assessment',
				methodology: 'Methodology Evaluation',
				contradictions: 'Contradiction Check',
				corroboration: 'Corroboration Check'
			};
			analysisTypeNameForDisplay = typeMap[analysisType] || `Analysis: ${analysisType}`;
		}

		if (!sourceUrl?.trim() || !mythContext?.trim()) {
			console.error(
				`[Action ${actionName}] Invalid input: Source URL and myth context are required.`
			);
			return { success: false, error: 'Source URL and myth context are required.' };
		}
		const apiKey = userApiKey || PERPLEXITY_API_KEY;
		if (!apiKey) {
			console.error(
				`[Action ${actionName}] API key missing. User provided: ${!!userApiKey}, Env var: ${!!PERPLEXITY_API_KEY}`
			);
			return {
				success: false,
				error: 'Missing API key. Please provide one or ensure it is configured.'
			};
		}

		const feature = 'tracks_generation'; // Assuming tracks_generation for source analysis
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0); // Truncate to day for UTC comparison

		if (!userApiKey) {
			console.log(
				`[${actionName}] No user API key provided. Checking global rate limit for feature: ${feature}`
			);
			// Check global rate limit
			const globalUsage = await prisma.globalApiUsage.upsert({
				where: { feature_date: { feature, date: today } },
				update: {},
				create: { feature, date: today, count: 0 }
			});

			const currentCount = globalUsage.count;
			const globalLimit = 10; // As per plan

			if (currentCount >= globalLimit) {
				console.warn(
					`[${actionName}] Daily global limit exceeded for feature "${feature}". Current count: ${currentCount}`
				);
				return {
					success: false,
					error:
						'Daily global limit exceeded for this feature. Please try again tomorrow or provide your custom API key to bypass limits.'
				};
			}

			// Increment global usage
			await prisma.globalApiUsage.update({
				where: { feature_date: { feature, date: today } },
				data: { count: { increment: 1 } }
			});
			console.log(
				`[${actionName}] Global usage incremented for feature "${feature}". New count: ${currentCount + 1}`
			);
		} else {
			console.log(
				`[${actionName}] User API key provided. Bypassing global rate limit for feature: ${feature}`
			);
		}

		let analysisPrompt = '';
		if (analysisType === 'custom' && customQuery) {
			analysisPrompt = `Analyze the source at ${sourceUrl} (titled: "${sourceName || 'N/A'}") in the context of the myth "${mythContext}". Specifically: ${customQuery}`;
		} else {
			const analysisTypesPrompts: Record<string, string> = {
				reliability: `Evaluate the reliability and credibility of the source at ${sourceUrl} (titled: "${sourceName || 'N/A'}") in relation to the myth "${mythContext}". Consider the author's expertise, publication venue, peer review status, and potential biases.`,
				methodology: `Examine the methodology used in the source at ${sourceUrl} (titled: "${sourceName || 'N/A'}") related to the myth "${mythContext}". Analyze the research methods, sample sizes, experimental design, and whether conclusions are supported by the data.`,
				contradictions: `Find evidence that contradicts or challenges the claims made in the source at ${sourceUrl} (titled: "${sourceName || 'N/A'}") about the myth "${mythContext}". Look for conflicting studies, opposing viewpoints, or limitations in the source's claims.`,
				corroboration: `Find additional sources and evidence that support or corroborate the claims made in the source at ${sourceUrl} (titled: "${sourceName || 'N/A'}") about the myth "${mythContext}". Look for independent verification and consensus.`
			};
			analysisPrompt =
				analysisTypesPrompts[analysisType as string] || analysisTypesPrompts.reliability;
		}
		console.log(`[Action ${actionName}] Constructed analysisPrompt: "${analysisPrompt}"`);

		const payload = {
			model: 'sonar',
			messages: [
				{ role: 'system', content: ANALYZE_SOURCE_SYSTEM_PROMPT },
				{ role: 'user', content: analysisPrompt }
			],
			temperature: 0.2,
			max_tokens: 3500,
			web_search_options: { search_context_size: PERPLEXITY_QUALITY },
			return_images: false,
			return_related_questions: false,
			response_format: {
				type: 'json_schema',
				json_schema: {
					schema: {
						type: 'object',
						properties: {
							analysis: { type: 'string' },
							reliability: { type: 'string' },
							methodology: { type: 'string' },
							corroborating: { type: 'array', items: { type: 'string' } },
							contradicting: { type: 'array', items: { type: 'string' } }
						},
						required: ['analysis'],
						additionalProperties: false
					}
				}
			}
		};

		try {
			const { parsedContent } = await makePerplexityRequest<AnalyzeSourceResponse>(
				apiKey,
				payload,
				actionName
			);

			if (
				typeof parsedContent.analysis !== 'string' ||
				(parsedContent.reliability !== undefined &&
					typeof parsedContent.reliability !== 'string') ||
				(parsedContent.methodology !== undefined &&
					typeof parsedContent.methodology !== 'string') ||
				!Array.isArray(parsedContent.corroborating) ||
				!parsedContent.corroborating.every((item: string) => typeof item === 'string') ||
				!Array.isArray(parsedContent.contradicting) ||
				!parsedContent.contradicting.every((item: string) => typeof item === 'string')
			) {
				console.error(
					`[${actionName}] Parsed JSON for AnalyzeSourceResponse does not match expected structure.`,
					parsedContent
				);
				throw new Error(
					'API response validation failed: Incorrect structure for AnalyzeSourceResponse.'
				);
			}

			const resultData = {
				success: true,
				result: {
					analysisTypeName: analysisTypeNameForDisplay,
					analysis: parsedContent.analysis,
					reliability: parsedContent.reliability || '',
					methodology: parsedContent.methodology || '',
					corroborating: parsedContent.corroborating,
					contradicting: parsedContent.contradicting
				}
			};
			console.log(`[Action ${actionName}] Successfully analyzed source. Returning data.`);
			return resultData;
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : `Failed to analyze source.`;
			console.error(`[Action ${actionName}] Error:`, errorMessage);
			return { success: false, error: errorMessage };
		}
	},

	synthesizeInsights: async ({ request, cookies }) => {
		const actionName = 'synthesizeInsights';
		console.log(`[Action ${actionName}] Called.`);
		const data = await request.formData();
		const mythStatement = data.get('mythStatement') as string;
		const lensResultsJson = data.get('lensResults') as string;
		const userApiKey = cookies.get('user_provided_api_key') || null;

		console.log(`[Action ${actionName}] Received mythStatement: "${mythStatement}"`);

		if (!mythStatement?.trim()) return { success: false, error: 'Myth statement is required.' };
		if (!lensResultsJson?.trim()) return { success: false, error: 'Lens results are required.' };

		let lensResults: LensResult[] = [];
		try {
			lensResults = JSON.parse(lensResultsJson);
		} catch (e: unknown) {
			const errorMessage = e instanceof Error ? e.message : 'Invalid lens results format.';
			console.error(`[Action ${actionName}] Error parsing lensResultsJson:`, errorMessage);
			return { success: false, error: errorMessage };
		}
		if (lensResults.length < 2)
			return { success: false, error: 'At least 2 research angles are needed.' };

		const apiKey = userApiKey || PERPLEXITY_API_KEY;
		if (!apiKey) {
			console.error(
				`[Action ${actionName}] API key missing. User provided: ${!!userApiKey}, Env var: ${!!PERPLEXITY_API_KEY}`
			);
			return {
				success: false,
				error: 'Missing API key. Please provide one or ensure it is configured.'
			};
		}

		const feature = 'tracks_generation'; // Assuming tracks_generation for synthesis
		const today = new Date();
		today.setUTCHours(0, 0, 0, 0); // Truncate to day for UTC comparison

		if (!userApiKey) {
			console.log(
				`[${actionName}] No user API key provided. Checking global rate limit for feature: ${feature}`
			);
			// Check global rate limit
			const globalUsage = await prisma.globalApiUsage.upsert({
				where: { feature_date: { feature, date: today } },
				update: {},
				create: { feature, date: today, count: 0 }
			});

			const currentCount = globalUsage.count;
			const globalLimit = 10; // As per plan

			if (currentCount >= globalLimit) {
				console.warn(
					`[${actionName}] Daily global limit exceeded for feature "${feature}". Current count: ${currentCount}`
				);
				return {
					success: false,
					error:
						'Daily global limit exceeded for this feature. Please try again tomorrow or provide your custom API key to bypass limits.'
				};
			}

			// Increment global usage
			await prisma.globalApiUsage.update({
				where: { feature_date: { feature, date: today } },
				data: { count: { increment: 1 } }
			});
			console.log(
				`[${actionName}] Global usage incremented for feature "${feature}". New count: ${currentCount + 1}`
			);
		} else {
			console.log(
				`[${actionName}] User API key provided. Bypassing global rate limit for feature: ${feature}`
			);
		}

		const lensDataForPrompt = lensResults.map((lr) => ({
			perspective: lr.name,
			insights: lr.result?.keyInsights?.join(', ') || 'N/A',
			explanation: lr.result?.explanation || 'N/A'
		}));

		const userPromptContent = `Given the myth "${mythStatement}", analyze the following research findings from different perspectives:
		${lensDataForPrompt
			.map(
				(lens) => `
		**${lens.perspective} Perspective:**
		Key Insights: ${lens.insights}
		Analysis: ${lens.explanation}
		`
			)
			.join('\n')}
		Provide a comprehensive synthesis that identifies:
		1. Overarching themes that emerge across perspectives
		2. Key connections between different viewpoints
		3. Notable contradictions or tensions
		4. An overall insight that integrates all perspectives`;
		console.log(`[Action ${actionName}] Constructed userPromptContent for synthesis.`);

		const payload = {
			model: 'sonar',
			messages: [
				{ role: 'system', content: SYNTHESIZE_INSIGHTS_SYSTEM_PROMPT },
				{ role: 'user', content: userPromptContent }
			],
			temperature: 0.4,
			max_tokens: 3000,
			web_search_options: { search_context_size: PERPLEXITY_QUALITY },
			return_images: false,
			return_related_questions: false,
			response_format: {
				type: 'json_schema',
				json_schema: {
					schema: {
						type: 'object',
						properties: {
							overallInsight: { type: 'string' },
							themes: {
								type: 'array',
								items: {
									type: 'object',
									properties: { title: { type: 'string' }, description: { type: 'string' } },
									required: ['title', 'description']
								}
							},
							connections: { type: 'array', items: { type: 'string' } },
							contradictions: { type: 'array', items: { type: 'string' } }
						},
						required: ['overallInsight', 'themes', 'connections', 'contradictions'],
						additionalProperties: false
					}
				}
			}
		};

		try {
			const { parsedContent } = await makePerplexityRequest<SynthesizeInsightsResponse>(
				apiKey,
				payload,
				actionName
			);

			if (
				typeof parsedContent.overallInsight !== 'string' ||
				!Array.isArray(parsedContent.themes) ||
				!parsedContent.themes.every(
					(theme: { title: string; description: string }) =>
						typeof theme === 'object' &&
						theme !== null &&
						typeof theme.title === 'string' &&
						typeof theme.description === 'string'
				) ||
				!Array.isArray(parsedContent.connections) ||
				!parsedContent.connections.every((conn: string) => typeof conn === 'string') ||
				!Array.isArray(parsedContent.contradictions) ||
				!parsedContent.contradictions.every((contr: string) => typeof contr === 'string')
			) {
				console.error(
					`[${actionName}] Parsed JSON for SynthesizeInsightsResponse does not match expected structure.`,
					parsedContent
				);
				throw new Error(
					'API response validation failed: Incorrect structure for SynthesizeInsightsResponse.'
				);
			}

			const resultData = {
				success: true,
				result: {
					overallInsight: parsedContent.overallInsight,
					themes: parsedContent.themes,
					connections: parsedContent.connections,
					contradictions: parsedContent.contradictions
				}
			};
			console.log(`[Action ${actionName}] Successfully synthesized insights. Returning data.`);
			return resultData;
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : `Failed to synthesize insights.`;
			console.error(`[Action ${actionName}] Error:`, errorMessage);
			return { success: false, error: errorMessage };
		}
	},

	clearServerCache: () => {
		console.log('[Action clearServerCache] Called. Clearing response cache.');
		responseCache.clear();
		return { success: true, message: 'Server API response cache cleared successfully.' };
	},

	resetPage: async () => {
		console.log('[Action resetPage] Called.');
		return { success: true, reset: true };
	},

	updatePerplexityApiKey: async ({ request, cookies }) => {
		const formData = await request.formData();
		const perplexityApiKey = formData.get('perplexityApiKey')?.toString() || '';

		if (!perplexityApiKey) {
			return error(400, 'API Key is required.');
		}

		// Validate API key by making a minimal test call
		try {
			const testPayload = {
				model: 'sonar',
				messages: [{ role: 'user', content: 'Hello' }]
			};
			const resp = await fetch(PERPLEXITY_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${perplexityApiKey}`
				},
				body: JSON.stringify(testPayload)
			});

			if (!resp.ok) {
				const errorBody = await resp.text();
				console.error('Perplexity API key validation failed:', resp.status, errorBody);
				return error(400, `API Key validation failed: ${errorBody}`);
			}
		} catch (e: unknown) {
			console.error('Error validating Perplexity API key:', e);
			return error(500, `Error validating API Key: ${e instanceof Error ? e.message : String(e)}`);
		}

		// Store the valid API key in an HttpOnly session cookie
		cookies.set('user_provided_api_key', perplexityApiKey, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production', // Use secure in production
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		return {
			success: true,
			message: 'Perplexity API Key saved successfully!'
		};
	}
};
