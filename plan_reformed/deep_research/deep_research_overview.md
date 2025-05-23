# Deep Research Master Plan for Myth Buster

This document outlines the comprehensive plan for implementing advanced deep research features in the Myth Buster application. The goal is to create a strong contender for the "Best Deep Research Project" category in the Perplexity Sonar API Hackathon. This plan emphasizes transforming Myth Buster into a sophisticated, multi-layered research platform that empowers users to critically explore, analyze, and synthesize information about myths.

**Overarching Goal:** To evolve Myth Buster's `/app` route into a guided, investigative journey where users can:
*   Explore myths from diverse, nuanced perspectives.
*   Critically deconstruct evidence and sources.
*   Compare myths and trace their evolution.
*   Synthesize complex information into coherent understanding.
*   Leverage the Perplexity Sonar API for sophisticated, chained research queries.

**Core Deep Research Capabilities:**

The following core features will be implemented to achieve this vision. Each feature is detailed in its own markdown document:

1.  **Enhanced Multi-Angle Investigation:** Explore myths from an expanded set of predefined and user-defined perspectives, including psychological and alternative viewpoints. (Details)
2.  **Advanced Evidence Deconstruction:** Go beyond basic source analysis to critically evaluate methodologies, reliability, and find corroborating or contradictory evidence. (Details)
3.  **Comparative Myth Analysis (New):** Enable users to compare a myth with its variations or thematically similar myths across different contexts. (Details)
4.  **Longitudinal Information Trace (New):** Allow users to track how a myth, or the information landscape surrounding it, has evolved over time. (Details)
5.  **Dynamic Insight Synthesis:** Synthesize findings from all explored facets (lenses, source analyses, comparative analysis, longitudinal trace) to identify overarching themes, contradictions, and connections, aiming for a structured JSON output from the API. (Details)

**Technical Stack:**

-   **Framework:** SvelteKit
-   **Language:** TypeScript
-   **UI:** Shadcn-svelte, Tailwind CSS, Lucide-svelte
-   **State Management:** Svelte 5 Runes (`$state`, `$derived`), Runed (`PersistedState` for persistent data like game score, not active research state)
-   **Server Interaction:** SvelteKit Form Actions (`+page.server.ts`, `use:enhance`)
-   **API:** Perplexity Sonar API (called from server actions)

**High-Level User Research Flow:**

1.  **Initial Myth Verification:** User inputs a myth, gets an initial verdict, explanation, and sources.
2.  **Multi-Angle Investigation:** User explores the myth through various lenses (Historical, Scientific, Cultural, Psychological, Custom, etc.).
3.  **Evidence Deconstruction:** User selects specific citations from any stage and performs deeper analysis on them (e.g., methodology, reliability, corroborating evidence).
4.  **Comparative Myth Analysis (Optional):** User triggers an analysis to find variations of the current myth or thematically similar myths.
5.  **Longitudinal Information Trace (Optional):** User initiates a trace to see how information or understanding about the myth's core topic has evolved.
6.  **Dynamic Insight Synthesis:** User triggers a synthesis process that takes all gathered information (from lenses, source analyses, comparisons, traces) and uses Sonar API to identify overarching themes, contradictions, connections, and a summary insight.

This multi-layered approach, emphasizing user agency at each step, is designed to showcase a profound and multifaceted investigation process, aligning perfectly with the "Best Deep Research Project" criteria.

**Note on Implementation:**
The detailed implementation, including Svelte components, state management with Svelte 5 Runes, and SvelteKit form actions for each feature, will be elaborated in their respective markdown files. The focus will be on robust error handling, clear loading states, and an intuitive UI/UX to manage the complexity of the research journey.

This revamped plan provides a more ambitious and detailed roadmap. By focusing on these enhanced and new core features, Myth Buster can truly shine as a deep research tool.