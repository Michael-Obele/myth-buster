// myth-buster/src/routes/tracks/+page.server.ts
import { fail } from '@sveltejs/kit';
import { PERPLEXITY_API_KEY, PERPLEXITY_API_URL, PERPLEXITY_QUALITY } from '$env/static/private';
import { building } from '$app/environment';
import type { PageServerLoad } from './$types';
import type { LearningTrack } from '$lib/game/tracks'; // Assuming LearningTrack interface is in tracks.ts
import { prisma } from '$lib/server/db';

// API Configuration

const NUMBER_OF_TRACK_CONCEPTS_TO_GENERATE = 5; // Or make this configurable

// System prompt for the AI to generate learning track concepts
const TRACK_CONCEPT_SYSTEM_PROMPT = `You are an AI that designs engaging and educational learning tracks for a myth-busting game using evidence-based research.

Your goal is to generate ${NUMBER_OF_TRACK_CONCEPTS_TO_GENERATE} diverse, compelling learning track concepts that will inspire users to explore and verify fascinating claims across different domains of knowledge.

Design principles for learning tracks:
1. Focus on areas rich with common misconceptions, myths, or surprising facts
2. Ensure each track has potential for multiple verifiable true/false statements
3. Balance popular topics with lesser-known but engaging subjects
4. Consider current relevance and educational value
5. Create tracks that challenge assumptions and promote critical thinking

For each track concept, provide:
1. "id": A unique, URL-friendly slug using kebab-case (e.g., "quantum-physics-myths", "ancient-medicine-facts")
2. "title": A compelling, specific title that clearly indicates the track's focus (e.g., "Ancient Medicine: Miracle Cures or Dangerous Myths?")
3. "description": An engaging 1-2 sentence description that highlights what users will discover and why it matters
4. "category": Select from these evidence-rich categories: "Science", "History", "Health", "Technology", "Nature", "Psychology", "Space", "Culture"
5. "difficulty": Calibrate difficulty appropriately:
   - "easy": Well-known topics with clear misconceptions
   - "medium": Moderately specialized knowledge or subtle misconceptions
   - "hard": Specialized domains requiring deeper understanding
6. "icon": Choose the most relevant icon from: "BookOpen", "Brain", "FlaskConical", "Globe", "Laptop", "Palette", "Scale", "ScrollText", "Video", "Heart", "Atom", "Telescope"
7. "totalMyths": Number of statements (3-5) based on topic richness and complexity

Track concept guidelines:
- Prioritize topics with established scientific consensus vs. popular misconceptions
- Include emerging areas where misinformation is common (e.g., AI, climate science, health)
- Balance historical topics with contemporary issues
- Ensure global perspective and cultural diversity when applicable
- Focus on topics with authoritative, verifiable sources available

Return your response as a JSON array with exactly ${NUMBER_OF_TRACK_CONCEPTS_TO_GENERATE} learning track concepts:
[
  {
    "id": "unique-track-slug",
    "title": "Compelling Track Title",
    "description": "Engaging description highlighting discovery and learning value.",
    "category": "Relevant Category",
    "difficulty": "appropriate_level",
    "icon": "RelevantIcon",
    "totalMyths": 4
  }
]

Ensure the output is ONLY the JSON array within a markdown code block.`;

interface CachedTrackConceptsResponse {
	timestamp: number;
	response: LearningTrack[]; // Array of track concepts
	expiresAt: number;
}

const trackConceptsCache: Map<string, CachedTrackConceptsResponse> = !building
	? new Map()
	: new Map();
const TRACK_CONCEPTS_CACHE_KEY = 'all_track_concepts_v2'; // Changed key to bust old cache if any
const TRACK_CONCEPTS_CACHE_EXPIRATION_MS = 6 * 60 * 60 * 1000; // 6 hours

function getCachedTrackConcepts(): LearningTrack[] | null {
	if (building) return null;
	const now = Date.now();
	const cachedData = trackConceptsCache.get(TRACK_CONCEPTS_CACHE_KEY);

	if (!cachedData) {
		console.log('[TRACK CONCEPTS CACHE] Cache miss.');
		return null;
	}

	if (now >= cachedData.expiresAt) {
		console.log('[TRACK CONCEPTS CACHE] Cache expired.');
		trackConceptsCache.delete(TRACK_CONCEPTS_CACHE_KEY);
		return null;
	}
	console.log('[TRACK CONCEPTS CACHE] Cache hit.');
	return cachedData.response;
}

function cacheTrackConcepts(concepts: LearningTrack[]): void {
	if (building) return;
	const now = Date.now();
	trackConceptsCache.set(TRACK_CONCEPTS_CACHE_KEY, {
		timestamp: now,
		response: concepts,
		expiresAt: now + TRACK_CONCEPTS_CACHE_EXPIRATION_MS
	});
	console.log('[TRACK CONCEPTS CACHE] Cached new track concepts.');
}

async function generateTrackConceptsFromAPI(userApiKey: string | null): Promise<LearningTrack[]> {
	console.log('[API CALL] Generating learning track concepts from API.');
	const apiKey = userApiKey || PERPLEXITY_API_KEY;

	if (!apiKey) {
		console.error('[API ERROR] Perplexity API key is missing for track concepts.');
		throw new Error('API key is not configured for track concepts.');
	}

	const feature = 'tracks_generation';
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0); // Truncate to day for UTC comparison

	if (!userApiKey) {
		console.log(
			`[generateTrackConceptsFromAPI] No user API key provided. Checking global rate limit for feature: ${feature}`
		);
		const globalUsage = await prisma.globalApiUsage.upsert({
			where: { feature_date: { feature, date: today } },
			update: {},
			create: { feature, date: today, count: 0 }
		});

		const currentCount = globalUsage.count;
		const globalLimit = 10; // As per plan

		if (currentCount >= globalLimit) {
			console.warn(
				`[generateTrackConceptsFromAPI] Daily global limit exceeded for feature "${feature}". Current count: ${currentCount}`
			);
			throw new Error(
				'Daily global limit exceeded for tracks generation. Please try again tomorrow or provide your custom API key to bypass limits.'
			);
		}

		await prisma.globalApiUsage.update({
			where: { feature_date: { feature, date: today } },
			data: { count: { increment: 1 } }
		});
		console.log(
			`[generateTrackConceptsFromAPI] Global usage incremented for feature "${feature}". New count: ${currentCount + 1}`
		);
	} else {
		console.log(
			`[generateTrackConceptsFromAPI] User API key provided. Bypassing global rate limit for feature: ${feature}`
		);
	}

	const payload = {
		model: 'sonar',
		messages: [
			{ role: 'system', content: TRACK_CONCEPT_SYSTEM_PROMPT },
			{
				role: 'user',
				content:
					'Generate diverse, engaging learning track concepts that challenge common misconceptions and promote evidence-based learning. Focus on topics with rich potential for verifiable myths and facts.'
			}
		],
		temperature: 0.4, // Balanced creativity for diverse topics while maintaining educational focus
		max_tokens: 3500, // Adequate space for detailed track concepts
		web_search_options: {
			search_context_size: PERPLEXITY_QUALITY // Medium context to research current misconceptions and trending topics
		},
		return_images: false,
		return_related_questions: false
	};
	// console.log('[TRACK CONCEPTS API PAYLOAD]', JSON.stringify(payload, null, 2));

	const resp = await fetch(PERPLEXITY_API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify(payload)
	});

	console.log('[TRACK CONCEPTS API RESPONSE STATUS]', resp.status);

	if (!resp.ok) {
		const errorText = await resp.text();
		console.error('[TRACK CONCEPTS API ERROR] API request failed:', resp.status, errorText);
		if (resp.status === 429) {
			throw new Error(
				'API rate limit exceeded for tracks generation. Please try again tomorrow or provide your custom API key to bypass limits.'
			);
		}
		throw new Error(`Track concepts API request failed with status ${resp.status}: ${errorText}`);
	}

	const answer = await resp.json();
	// console.log('[TRACK CONCEPTS API RAW RESPONSE]', JSON.stringify(answer, null, 2));

	const content = answer.choices?.[0]?.message?.content;
	if (!content) {
		console.error('[TRACK CONCEPTS API PARSE ERROR] No content in API response choices.');
		throw new Error('Invalid API response for track concepts: No content found.');
	}

	// console.log('[TRACK CONCEPTS API CONTENT]', content);
	const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
	if (!jsonMatch || !jsonMatch[1]) {
		console.error(
			'[TRACK CONCEPTS API PARSE ERROR] Could not extract JSON from API response content.'
		);
		console.log('Content that failed to parse for track concepts: ', content);
		throw new Error('Invalid API response for track concepts: JSON block not found or malformed.');
	}

	try {
		let parsedContent = JSON.parse(jsonMatch[1]) as any[]; // Expect an array

		// Validate and map to LearningTrack[], ensuring myths is an empty array
		const validTrackConcepts: LearningTrack[] = parsedContent
			.map((trackConcept: any) => {
				// Basic validation
				if (
					!trackConcept.id ||
					typeof trackConcept.id !== 'string' ||
					!trackConcept.title ||
					typeof trackConcept.title !== 'string' ||
					!trackConcept.description ||
					typeof trackConcept.description !== 'string' ||
					!trackConcept.category ||
					typeof trackConcept.category !== 'string' ||
					!trackConcept.difficulty ||
					!['easy', 'medium', 'hard'].includes(trackConcept.difficulty) ||
					!trackConcept.totalMyths ||
					typeof trackConcept.totalMyths !== 'number'
				) {
					console.warn(
						'[TRACK CONCEPTS VALIDATION] Invalid track concept structure:',
						trackConcept
					);
					return null; // Skip invalid entries
				}
				return {
					id: trackConcept.id,
					title: trackConcept.title,
					description: trackConcept.description,
					category: trackConcept.category,
					difficulty: trackConcept.difficulty,
					icon: trackConcept.icon || 'BookOpen', // Default icon
					totalMyths: trackConcept.totalMyths,
					myths: [] // Myths array will be empty for concepts
				};
			})
			.filter((tc) => tc !== null) as LearningTrack[];

		console.log('[TRACK CONCEPTS API PARSED CONTENT]', validTrackConcepts);
		if (validTrackConcepts.length === 0 && parsedContent.length > 0) {
			throw new Error('All track concepts failed validation.');
		}
		return validTrackConcepts;
	} catch (e: any) {
		console.error('[TRACK CONCEPTS API JSON PARSE ERROR]', e.message);
		console.log('JSON string that failed to parse for track concepts: ', jsonMatch[1]);
		throw new Error(`Failed to parse JSON for track concepts from API response: ${e.message}`);
	}
}

export const load: PageServerLoad = async ({ cookies }) => {
	const userApiKey = cookies.get('user_provided_api_key') || null;
	let tracks: LearningTrack[] = getCachedTrackConcepts() || [];

	if (tracks.length === 0) {
		try {
			tracks = await generateTrackConceptsFromAPI(userApiKey);
			if (tracks.length > 0) {
				cacheTrackConcepts(tracks);
			} else {
				console.warn('No track concepts generated from API or all failed validation.');
				// Optionally return a specific error or message to the frontend
			}
		} catch (error: any) {
			console.error('Error fetching track concepts:', error.message);
			// Return empty or with an error message for the page to display
			// Using fail() might be too disruptive if it's just about track concepts not loading
			return {
				tracks: [],
				error: error.message || 'Failed to load learning tracks. Please try again later.'
			};
		}
	}

	return {
		tracks
	};
};
