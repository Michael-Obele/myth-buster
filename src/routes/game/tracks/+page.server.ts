// myth-buster/src/routes/game/tracks/+page.server.ts
import { fail } from '@sveltejs/kit';
// @ts-expect-error editor-error
import { PERPLEXITY_API_KEY } from '$env/static/private';
import { building } from '$app/environment';
import type { PageServerLoad } from './$types';
import type { LearningTrack } from '$lib/game/tracks'; // Assuming LearningTrack interface is in tracks.ts

// API Configuration
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const NUMBER_OF_TRACK_CONCEPTS_TO_GENERATE = 5; // Or make this configurable

// System prompt for the AI to generate learning track concepts
const TRACK_CONCEPT_SYSTEM_PROMPT = `You are an AI that designs engaging learning tracks for a myth-busting game.
Your goal is to generate a list of ${NUMBER_OF_TRACK_CONCEPTS_TO_GENERATE} diverse and interesting learning track concepts.
Each track concept should inspire a series of myths (true/false statements with explanations) that users can verify.

For each track concept, provide:
1.  "id": A unique, URL-friendly slug (e.g., "ancient-civilization-myths").
2.  "title": A catchy and descriptive title for the track (e.g., "Ancient Civilization Myths").
3.  "description": A brief (1-2 sentences) enticing description of what the track covers.
4.  "category": A relevant category (e.g., "History", "Science", "Technology", "Pop Culture", "Health", "Nature").
5.  "difficulty": The intended difficulty level ("easy", "medium", or "hard").
6.  "icon": Suggest a relevant icon name from the following list: "BookOpen", "Brain", "FlaskConical", "Globe", "Laptop", "Palette", "Scale", "ScrollText", "Video". If none seem perfect, you can suggest a general one like "BookOpen".
7.  "totalMyths": The number of myths this track should contain (e.g., 3, 4, or 5).

Return your response as a JSON array, where each element is an object representing a learning track concept, structured as follows:
[
  {
    "id": "example-track-1",
    "title": "Example Track Title 1",
    "description": "An example description for the first track.",
    "category": "Example Category",
    "difficulty": "easy",
    "icon": "BookOpen",
    "totalMyths": 4
  },
  {
    "id": "example-track-2",
    "title": "Example Track Title 2",
    "description": "An example description for the second track.",
    "category": "Another Category",
    "difficulty": "medium",
    "icon": "Brain",
    "totalMyths": 5
  }
]

Ensure the output is ONLY the JSON array within a markdown code block.
`;

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

async function generateTrackConceptsFromAPI(): Promise<LearningTrack[]> {
	console.log('[API CALL] Generating learning track concepts from API.');
	const apiKey = PERPLEXITY_API_KEY;

	if (!apiKey) {
		console.error('[API ERROR] Perplexity API key is missing for track concepts.');
		throw new Error('API key is not configured for track concepts.');
	}

	const payload = {
		model: 'sonar',
		messages: [
			{ role: 'system', content: TRACK_CONCEPT_SYSTEM_PROMPT },
			{ role: 'user', content: 'Please generate the learning track concepts as requested.' } // Add a user message
		]
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

export const load: PageServerLoad = async () => {
	let tracks: LearningTrack[] = getCachedTrackConcepts() || [];

	if (tracks.length === 0) {
		try {
			tracks = await generateTrackConceptsFromAPI();
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
				error: 'Failed to load learning tracks. Please try again later.'
			};
		}
	}

	return {
		tracks
	};
};
