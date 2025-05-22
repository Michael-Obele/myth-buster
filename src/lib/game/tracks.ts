// myth-buster/src/lib/game/tracks.ts

export interface Citation {
	title: string;
	url: string;
}

export interface MythInTrack {
	statement: string;
	isTrue: boolean;
	explanation: string;
	citations?: Citation[]; // Optional for these predefined myths
}

export interface LearningTrack {
	id: string;
	title: string;
	description: string;
	category: string;
	difficulty: 'easy' | 'medium' | 'hard';
	myths: MythInTrack[];
	icon?: string; // e.g., lucide icon name like 'BookOpen', 'Brain', 'Atom'
	totalMyths?: number; // Number of myths this track will contain (can be set by AI)
}

// The static learningTracks array and helper functions (getAllLearningTracks, 
// getLearningTrackById, getMythsForTrack) are removed.
// This file will now primarily hold the TypeScript interfaces for track data
// that will be generated dynamically by the AI.