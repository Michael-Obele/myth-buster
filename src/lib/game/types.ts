// myth-buster/src/routes/game/types.ts

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

// Result type for the action that generates/fetches a myth
export interface GenerateActionResult extends GameStatement {
	success: boolean;
	cached?: boolean;
	error?: string;

	// For track-based game
	trackId?: string;
	trackTitle?: string;
	currentMythIndex?: number;
	totalMythsInTrack?: number;
	isLastMythInTrack?: boolean;
	trackCompleted?: boolean; // True if mythIndex was out of bounds or track is finished
	action?: string; // To help client identify action source if needed
}

// Result type for the action that checks an answer
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
	action?: string; // To help client identify action source
}

// Generic type for form data that could be either generation or check answer result
export type GameActionData = GenerateActionResult | CheckAnswerActionResult | null | undefined;
