# Premium Insight Feature: Data Model & API Integration Plan

This document outlines the data model and API integration strategy for the new "premium insight" feature in Myth Buster. This feature focuses on advanced analytics data, specific data visualizations, data for background report generation, and integration with an enhanced Perplexity Sonar API for specialized data, particularly source reliability scores.

## 1. Data Model Definition

The "premium insight" feature requires new data structures to capture advanced analytics and specialized data.

### 1.1. Advanced Analytics Data (Internal Application Metrics)

This data will be derived from user interactions and the deep research process within Myth Buster, providing insights into research patterns and system performance.

*   **`PremiumAnalytics` Table/Collection**:
    *   `id`: Unique identifier (UUID).
    *   `userId`: Foreign key to the `User` table, linking analytics to a specific premium user.
    *   `timestamp`: Timestamp of the analytics record generation.
    *   `researchSessionId`: (Optional) Link to specific research sessions for granular analysis.
    *   `lensUsageMetrics`: JSONB/Map storing counts or duration for each research lens used (e.g., `{"Historical": 10, "Scientific": 8, "Custom": 2}`).
    *   `sourceAnalysisCount`: Integer, total number of source analyses performed by the user.
    *   `synthesisGeneratedCount`: Integer, total number of insight syntheses generated.
    *   `sonarCallCount`: Integer, number of Sonar API calls made for deep research.
    *   `mythTopicFrequency`: JSONB/Map storing frequency of topics researched by the user (e.g., `{"Conspiracy": 5, "HistoricalEvent": 3}`).
    *   `averageResearchDepth`: Float, calculated metric (e.g., average number of lenses explored per myth).
    *   `reportGenerationCount`: Integer, number of premium reports downloaded.

### 1.2. Premium Insight Specific Data (Specialized Data from Sonar/External API)

This data will be directly related to the "myth" content and its analysis, particularly focusing on source reliability.

*   **`MythInsight` Table/Collection**:
    *   `id`: Unique identifier (UUID).
    *   `mythId`: Foreign key to an existing `Myth` or `Verification` record (if applicable), linking insights to a specific myth.
    *   `timestamp`: Timestamp of when the insight was generated/fetched.
    *   `sourceUrl`: String, the URL of the source being analyzed.
    *   `sourceReliabilityScore`: Float, a numerical score representing the reliability of the source (e.g., 0.0-1.0).
    *   `reliabilityFactors`: JSONB/Map, details on what contributed to the reliability score (e.g., `{"BiasDetection": "Low", "FactCheckingHistory": "Good", "DomainAuthority": "High"}`).
    *   `relatedTopics`: Array of Strings, topics identified in the source or related to the myth.
    *   `extractedKeywords`: Array of Strings, key terms extracted from the source content.
    *   `summarySnippet`: Text, a brief summary of the source content relevant to the myth.
    *   `modelVersion`: String, indicating which Sonar model version was used for the analysis (e.g., "Sonar-Pro-v2").

## 2. External API Integration Strategy (Refined)

The core strategy for obtaining source reliability will initially leverage an enhanced Perplexity Sonar model. A dedicated external API for source reliability is a consideration for future expansion, allowing for specialized, potentially third-party, services.

*   **API Endpoint & Purpose (Primary - Enhanced Sonar)**:
    *   **Mechanism**: Utilize a specific, more powerful configuration or prompt engineering within the existing Perplexity Sonar API. This might involve:
        *   **Specific Prompting**: Crafting highly detailed prompts to extract granular source reliability assessments, potentially incorporating external knowledge bases accessible to the Sonar model.
        *   **Dedicated Sonar Endpoint/Model**: If Perplexity offers different tiers or specialized models (e.g., "Sonar Pro," "Sonar Research"), the premium feature would use this higher-tier access.
        *   **Purpose**: To obtain comprehensive source reliability scores and contributing factors for URLs identified during the deep research process. This enhanced analysis will go beyond basic fact-checking to provide deeper insights into bias, methodology, and overall credibility.
    *   **Request (to Enhanced Sonar)**: JSON payload containing the URL(s) to be analyzed, the specific `MythInsight` ID, and relevant context for the analysis.
        ```json
        {
          "url": "https://example.com/source-article",
          "mythInsightId": "uuid-of-myth-insight",
          "analysisType": "source_reliability",
          "context": "myth about X, related to Y, user wants detailed credibility report"
        }
        ```
    *   **Response (from Enhanced Sonar)**: JSON object containing the reliability score and detailed factors. This response will directly populate or update the `MythInsight` model.
        ```json
        {
          "sourceUrl": "https://example.com/source-article",
          "reliabilityScore": 0.85,
          "factors": {
            "biasDetection": "Low",
            "factCheckingHistory": "Good",
            "domainAuthority": "High",
            "publicationDate": "2023-01-15",
            "peerReviewStatus": "Not Applicable",
            "authorCredentials": "PhD in relevant field"
          },
          "extractedData": {
            "topics": ["health", "nutrition"],
            "keywords": ["vitamin C", "cold cure"],
            "summary": "Article discusses the efficacy of vitamin C for common cold.",
            "sentiment": "neutral",
            "identifiedClaims": ["Vitamin C cures cold"]
          },
          "modelVersion": "Sonar-Premium-v3"
        }
        ```

*   **API Endpoint & Purpose (Future - Dedicated External API)**:
    *   **Mechanism**: Integration with a specialized third-party service explicitly designed for advanced source credibility assessment (e.g., using proprietary algorithms, web scraping for reputation, or large databases of misinformation).
    *   **Potential Endpoint**: `POST /api/external/advanced-source-credibility`
    *   **Purpose**: To provide an even deeper, potentially real-time, analysis of source reliability, potentially incorporating data points not available to general-purpose LLMs like Sonar. This would be an optional layer of analysis that could augment or, in specific cases, replace the Sonar-based reliability assessment.
    *   **Authentication**: Likely API Key in headers or OAuth 2.0 for robust security.

## 3. Data Processing & Storage

### 3.1. Real-time Display (User Profile Page & Standalone Page)

*   **Flow**:
    1.  User initiates a deep research session or views their premium profile.
    2.  Backend fetches relevant `PremiumAnalytics` data for the user.
    3.  Backend fetches `MythInsight` data for recently analyzed sources or top myths.
    4.  Data is transformed and sent to the frontend.
    5.  Frontend renders interactive charts and visualizations (e.g., D3.js, Chart.js) based on the fetched data.
    6.  Source reliability scores are displayed alongside citations or in a dedicated "Source Insights" section on the deep research pages.

### 3.2. Background Report Generation

*   **Flow**:
    1.  User requests a premium report (e.g., "My Annual Research Summary" or "Myth Topic Trend Report").
    2.  A background job (e.g., using a message queue like RabbitMQ or a serverless function) is triggered.
    3.  The job queries the `PremiumAnalytics` and `MythInsight` tables, potentially aggregating data over a specified period.
    4.  It compiles the data into a structured format (e.g., PDF, CSV, JSON).
    5.  The report is stored in a secure cloud storage (e.g., S3) and a download link is provided to the user (e.g., via email or in-app notification).
    6.  For `MythInsight` data, the background process could also generate detailed reports on source credibility analysis for a set of myths.

## 4. Database Schema Changes

Based on the proposed data models, the `prisma/schema.prisma` file will need additions.

*   **New Models**:
    *   `PremiumAnalytics`
    *   `MythInsight`

#### Proposed `prisma/schema.prisma` Additions:

```prisma
// Existing models...

model PremiumAnalytics {
  id                  String    @id @default(uuid())
  userId              String
  user                User      @relation(fields: [userId], references: [id])
  timestamp           DateTime  @default(now())
  researchSessionId   String?   // Optional, link to specific research sessions
  lensUsageMetrics    Json      // Stores counts/duration for each lens used
  sourceAnalysisCount Int
  synthesisGeneratedCount Int
  sonarCallCount      Int
  mythTopicFrequency  Json      // Stores frequency of topics researched
  averageResearchDepth Float
  reportGenerationCount Int
}

model MythInsight {
  id                    String    @id @default(uuid())
  mythId                String?   // Optional, link to a specific myth if applicable
  timestamp             DateTime  @default(now())
  sourceUrl             String
  sourceReliabilityScore Float
  reliabilityFactors    Json      // Details on what contributed to the reliability score
  relatedTopics         String[]  // Array of strings for topics
  extractedKeywords     String[]  // Array of strings for keywords
  summarySnippet        String?   @db.Text // Brief summary of the source content
  modelVersion          String    // Sonar model version used for analysis
}
```

## Data Model & Integration Strategy Diagram

```mermaid
graph TD
    A[User Action: Premium Feature Access] --> B{Myth Buster Backend};

    subgraph Backend Processing
        B -- "1. Authenticate & Authorize User" --> C{Premium User Check};
        C -- "If Premium" --> D[Data Retrieval & Aggregation];
        D -- "From User Session/Request" --> E[Request for Source Reliability Analysis];
        E -- "Call Enhanced Sonar API" --> F[Perplexity Sonar API (Enhanced Model)];
        F -- "Returns Detailed Reliability Data" --> G[Process Sonar Response];
        G -- "Update/Store in DB" --> H[MythInsight Table];
        H -- "For Reporting/Display" --> D;
        D -- "Aggregate PremiumAnalytics" --> I[PremiumAnalytics Table];
        I -- "Store User Metrics" --> H;
    end

    subgraph Data Consumption & Display
        D -- "2. Prepare Data for Display" --> J[Real-time Data Transformation];
        J -- "For Profile Page" --> K[Advanced Analytics Display (User Profile)];
        J -- "For Standalone Page" --> L[Standalone Premium Insights Page];
        L -- "Displays Source Reliability Scores" --> M[User Interface];

        D -- "3. Prepare Data for Reports" --> N[Background Report Generation Service];
        N -- "Query PremiumAnalytics & MythInsight" --> O[Data Aggregation & Formatting];
        O -- "Generate Report (PDF/CSV)" --> P[Generated Report File];
        P -- "Store in Cloud Storage" --> Q[Cloud Storage (e.g., S3)];
        Q --> R[Generate Download Link];
        R --> S[Deliver Link to User];
    end

    subgraph Data Model Relationships
        T[User Table] -- "userId" --> I;
        U[Myth/Verification Table] -- "mythId" --> H;
    end

    subgraph Future Expansion
        G -- "Optional: Call Dedicated External API" --> V[Dedicated External API for Source Reliability (Future)];
        V -- "Returns Ultra-Detailed Credibility" --> G;
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style M fill:#ccf,stroke:#333,stroke-width:2px
    style S fill:#cfc,stroke:#333,stroke-width:2px
    style F fill:#eef,stroke:#333,stroke-width:2px
    style V fill:#ffc,stroke:#333,stroke-width:2px