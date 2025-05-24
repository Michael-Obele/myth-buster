# Hackathon Implemented Deep Research Features Checklist (`/app` Route)

This checklist outlines the deep research features that have been implemented in the `/app` route of the Myth Buster application for the Perplexity Sonar API Hackathon.

## Core Deep Research Pillars Implemented:

### 1. Multi-Angle Investigation Mode (Enhanced User Agency)
-   [x] Users can explore myths from multiple predefined research perspectives (lenses):
    -   [x] Historical
    -   [x] Scientific
    -   [x] Cultural
    -   [x] Psychological
    -   [x] Economic
    -   [x] Political
-   [x] Users can define and add their own "Custom Lens" for investigation.
-   [x] Server-side action (`researchLens`) dynamically constructs Sonar API prompts based on the selected or custom lens.
-   [x] UI displays results for each explored lens.

### 2. Evidence Deconstruction & Critical Source Analysis (Enhanced User Agency)
-   [x] Users can select specific citations (from initial verification or lens results) for deeper analysis.
-   [x] An "Analyze Source" modal/dialog is available.
-   [x] Pre-defined analytical queries for sources are available:
    -   [x] Source Reliability
    -   [x] Research Methodology
    -   [x] Find Contradictions
    -   [x] Find Supporting Evidence
-   [x] Users can input a custom question/query to analyze a specific source.
-   [x] Server-side action (`analyzeSource`) constructs Sonar API prompts based on the analysis type and source details.
-   [x] UI displays the results of the source analysis.

### 3. Dynamic Insight Mapping & Connection Weaver (Synthesis)
-   [x] A "Synthesize Insights" feature becomes available after users explore multiple research lenses.
-   [x] Server-side action (`synthesizeInsights`) compiles summaries/results from all successfully explored lenses.
-   [x] A complex Sonar API prompt is used to request the AI to:
    -   [x] Identify an overall insight.
    -   [x] Identify key themes emerging from the analyses.
    -   [x] Identify connections between different viewpoints.
    -   [x] Identify notable contradictions or tensions.
-   [x] UI displays the structured synthesis results (overall insight, themes, connections, contradictions).

## Features NOT Implemented (or Partially Implemented) in `/app` for Hackathon:

The following deep research features, while part of the broader plan, are not fully implemented within the primary `/app` deep research flow for this hackathon submission:

-   [ ] **Comparative Myth Framework (as a distinct deep research step in `/app`)**
    -   The dedicated "Compare This Myth" button and specific Sonar API calls for detailed myth variations and thematic comparisons across cultures (as outlined in `plan_reformed/deep_research/feature_comparative_myth_analysis.md`) are not integrated into the main `/app` deep research workflow.
    -   *Note: A basic "Related Myth" string is provided from the initial myth verification.*
-   [ ] **Longitudinal Information Trace**
    -   The "Trace History of this Topic" functionality with Sonar API calls to trace the evolution of a myth or its subject over time (as outlined in `plan_reformed/deep_research/feature_longitudinal_information_trace.md`) is not implemented in `/app`.
-   [ ] **Sparking Discovery: The "Serendipity Engine"**
    -   The "Uncover a Hidden Angle" button or similar feature to prompt Sonar for less obvious connections or novel perspectives is not implemented in `/app`.

This checklist focuses on the features integrated into the `/app` route, which serves as the primary showcase for the deep research capabilities in this hackathon project.