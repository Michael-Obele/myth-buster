-- CreateTable
CREATE TABLE "UserResearchActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchSessionId" TEXT,
    "lensUsageMetrics" JSONB NOT NULL,
    "sourceAnalysisCount" INTEGER NOT NULL,
    "synthesisGeneratedCount" INTEGER NOT NULL,
    "mythTopicFrequency" JSONB NOT NULL,
    "generatedContentSnippet" TEXT,
    "contentType" TEXT NOT NULL,
    "mythId" TEXT,
    "verificationStatus" TEXT,

    CONSTRAINT "UserResearchActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserResearchActivity" ADD CONSTRAINT "UserResearchActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
