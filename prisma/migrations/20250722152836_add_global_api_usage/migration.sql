-- CreateTable
CREATE TABLE "GlobalApiUsage" (
    "id" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GlobalApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalApiUsage_feature_date_key" ON "GlobalApiUsage"("feature", "date");
