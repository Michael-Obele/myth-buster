# Myth Buster Project TODO List

This document tracks the outstanding tasks for the Myth Buster project, focusing on security, reliability, and new feature implementation.

## Security & Reliability Enhancements

-   [ ] **Implement Advanced Input Validation:**
    -   [ ] Enforce complete sentence checks for user inputs.
    -   [ ] Add profanity and PII (Personally Identifiable Information) filtering.
    -   [ ] Ensure server-side enforcement of character limits.
-   [ ] **Develop Prompt Injection Defenses:**
    -   [ ] Implement input sanitization and escaping.
    -   [ ] Refine system prompts with explicit instructions to prevent manipulation.
-   [ ] **Add Abuse Detection & Logging:**
    -   [ ] Implement rate limiting on API-heavy actions.
    -   [ ] Develop a system for tracking and flagging suspicious submissions.
    -   [ ] Integrate a dedicated logger for security and abuse events.

## Premium Feature Enhancements

-   [ ] **Implement Credible Source Filtering for Premium Insights:**
    -   [ ] Define and manage a list of prioritized "credible domains" for premium research queries.
    -   [ ] Define and manage a list of "undesired domains" for exclusion.
    -   [ ] Integrate these lists into Perplexity Sonar API calls using `web_search_options.domains` filter in premium features (e.g., advanced source analysis, comprehensive research reports).
    -   [ ] Implement logic to filter out results from undesired domains during response processing.
    -   [ ] Consider a mechanism for dynamically updating these lists.

## Deep Research Feature Implementation

These features are part of the core plan but were not implemented for the hackathon.

-   [ ] **Implement Comparative Myth Framework:**
    -   [ ] Add a "Compare This Myth" button to the UI.
    -   [ ] Create a dedicated server-side action for comparative analysis.
    -   [ ] Construct Sonar API calls for detailed myth variations and thematic comparisons across cultures.
-   [ ] **Implement Longitudinal Information Trace:**
    -   [ ] Add a "Trace History of this Topic" button to the UI.
    -   [ ] Create a dedicated server-side action to trace a myth's evolution.
    -   [ ] Construct Sonar API calls to analyze the topic over different time periods.
-   [ ] **Implement "Serendipity Engine":**
    -   [ ] Add an "Uncover a Hidden Angle" button to the UI.
    -   [ ] Create a server-side action to prompt Sonar for novel perspectives.
    -   [ ] Design prompts that encourage the AI to find less obvious connections.