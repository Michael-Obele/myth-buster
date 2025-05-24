/**
 * Type definition for the result of a myth verification.
 * This is the structure of the data returned by the server-side
 * `verifyMythLogic` function and form actions.
 */
export type MythVerificationResult = {
	success: boolean;
	cached?: boolean; // Indicates if the response was from server-side API cache
	myth?: string; // The myth string that was verified
	error?: string; // Error message if verification failed
	data?: {
		answer?: any; // Raw API response from Perplexity
		explanation: string;
		citations: { title: string; url: string }[];
		mythOrigin: string;
		relatedMyth: string;
		whyBelieved: string;
		verdict: 'true' | 'false' | 'inconclusive';
	};
};

/**
 * Type definition for persisted myth history entries.
 * This is stored client-side using PersistedState.
 */
export type MythHistoryEntry = {
	id: string; // Unique ID for the history entry
	myth: string; // The myth string that was verified
	timestamp: number; // Timestamp of when the verification occurred (client-side)
	result: MythVerificationResult; // The full result from the server
	isBookmarked: boolean; // Flag for bookmarking
};

/**
 * Type definition for research lens results.
 */
export type LensResult = {
	id: string;
	name: string;
	isCustom: boolean;
	loading?: boolean;
	error?: string;
	result?: {
		explanation: string;
		citations: { title: string; url: string }[];
		keyInsights?: string[];
	};
};

/**
 * Type definition for source analysis results.
 */
export type SourceAnalysisResult = {
	success?: boolean;
	loading?: boolean;
	error?: string;
	result?: {
		analysis: string;
		reliability?: string;
		methodology?: string;
		corroborating?: string[];
		contradicting?: string[];
	};
};

/**
 * Type definition for synthesis results.
 */
export type SynthesisResult = {
	success?: boolean;
	loading?: boolean;
	error?: string;
	overallInsight?: string;
	themes?: Array<{
		title: string;
		description: string;
	}>;
	connections?: string[];
	contradictions?: string[];
};