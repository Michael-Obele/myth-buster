export interface UserResearchActivity {
	id: string;
	userId: string;
	timestamp: Date;
	researchSessionId: string | null;
	lensUsageMetrics: Record<string, number> | null; // Assuming JSONB maps to a Record
	sourceAnalysisCount: number;
	synthesisGeneratedCount: number;
	mythTopicFrequency: Record<string, number> | null; // Assuming JSONB maps to a Record
	generatedContentSnippet: string | null;
	contentType: string;
	mythId: string | null;
	verificationStatus: string | null;
}

export interface PremiumAnalytics {
	id: string;
	userId: string;
	timestamp: Date;
	researchSessionId: string | null;
	lensUsageMetrics: Record<string, number>;
	sourceAnalysisCount: number;
	synthesisGeneratedCount: number;
	sonarCallCount: number;
	mythTopicFrequency: Record<string, number>;
	averageResearchDepth: number;
	reportGenerationCount: number;
}

export interface MythInsight {
	id: string;
	mythId: string | null;
	timestamp: Date;
	sourceUrl: string;
	sourceReliabilityScore: number;
	reliabilityFactors: Record<string, any>;
	relatedTopics: string[];
	extractedKeywords: string[];
	summarySnippet: string | null;
	modelVersion: string;
}
