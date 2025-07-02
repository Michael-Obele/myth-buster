-- CreateTable
CREATE TABLE "PremiumAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchSessionId" TEXT,
    "lensUsageMetrics" JSONB NOT NULL,
    "sourceAnalysisCount" INTEGER NOT NULL,
    "synthesisGeneratedCount" INTEGER NOT NULL,
    "sonarCallCount" INTEGER NOT NULL,
    "mythTopicFrequency" JSONB NOT NULL,
    "averageResearchDepth" DOUBLE PRECISION NOT NULL,
    "reportGenerationCount" INTEGER NOT NULL,

    CONSTRAINT "PremiumAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MythInsight" (
    "id" TEXT NOT NULL,
    "mythId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceUrl" TEXT NOT NULL,
    "sourceReliabilityScore" DOUBLE PRECISION NOT NULL,
    "reliabilityFactors" JSONB NOT NULL,
    "relatedTopics" TEXT[],
    "extractedKeywords" TEXT[],
    "summarySnippet" TEXT,
    "modelVersion" TEXT NOT NULL,

    CONSTRAINT "MythInsight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PremiumAnalytics" ADD CONSTRAINT "PremiumAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
