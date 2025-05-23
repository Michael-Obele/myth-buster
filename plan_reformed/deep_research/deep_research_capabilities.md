# Deep Research Capabilities Plan: Winning the Hackathon

## 1. Our Vision: Beyond Myth Busting to Deep Understanding & User-Led Discovery

To win the "Best Deep Research Project" category, Myth Buster will transcend simple true/false answers. We will empower users to conduct **profound, multifaceted, and user-guided investigations** into myths. Our app leverages the Perplexity Sonar API not just as an answer engine, but as a dynamic research assistant that users can actively steer. Myth Buster will demonstrate how Sonar facilitates uncovering layers of information, critically examining evidence, exploring historical and cultural contexts, understanding nuanced perspectives, and **synthesizing knowledge to forge new insights.**

## 2. Core Deep Research Pillars

These pillars represent the flagship features designed to showcase sophisticated research capabilities.

### Pillar 1: Evidence Deconstruction & Critical Source Analysis (Enhanced User Agency)

*   **Concept & Deep Research Value:** Users won't just see citations; they will critically evaluate the evidence Sonar provides. This feature allows users to select a specific piece of evidence or a source from Sonar's initial response and launch further Sonar analysis *on that specific item*, promoting critical thinking about information sources.
*   **Illustrative User Journey:**
    1.  User verifies a myth in `/app`.
    2.  Sonar provides a verdict and a list of citations.
    3.  User clicks an "Analyze Source" button next to a citation.
    4.  A modal or an expanded section opens, offering:
        *   Pre-defined analytical queries (as before).
        *   **New: An option for the user to type a custom question or refine a suggested Sonar prompt about the selected source.** (e.g., User modifies a prompt to ask: `"Critique the statistical methods used in [citation X] regarding its sample size and generalizability for the myth on [topic]."`).
*   **Sophisticated Sonar API Usage:**
    *   Initial Verification: Standard Sonar call.
    *   Follow-up Analysis (examples):
        *   `"Analyze the methodology of [citation X]. Strengths/limitations for [myth topic]?"`
        *   `"Summarize arguments in [source Y]. How do they support/refute [myth topic]?"`
        *   `"Consensus on reliability/bias of [source Z URL/name] for [myth topic]?"`
        *   `"Find corroborating/contradicting research for claim in [citation A] on [myth topic]."`
        *   **New (User-driven):** Ability to take a base prompt (e.g., `"Analyze [source]"`) and let the user add specifics: `"Analyze [source] focusing on its reception by contemporary critics."`
*   **Key UI/UX Elements:**
    *   "Analyze Source" buttons.
    *   Interface for source analysis display.
    *   **New: Input field for custom questions/prompt refinement for selected source.**
*   **Hackathon Judging Alignment:**
    *   Technological Implementation: Multi-step, context-aware, *and user-tunable* Sonar interactions.
    *   Quality of the Idea: Empowers critical source evaluation with enhanced user control.

### Pillar 2: Multi-Angle Investigation Mode (Enhanced User Agency)

*   **Concept & Deep Research Value:** Structured investigation from predefined and custom research perspectives.
*   **Illustrative User Journey:**
    1.  User inputs a myth in `/app`.
    2.  "Investigation Lenses" are presented.
    3.  User clicks a lens (e.g., "Historical Origins") or **New: clicks "Add Custom Lens" and provides a topic or question to guide Sonar's analysis from their unique angle.** (e.g., "Analyze this myth from the perspective of its economic impact on related industries.").
*   **Sophisticated Sonar API Usage:**
    *   Predefined Lenses (as before, e.g., Historical, Scientific, Cultural, Psychological, Underlying Questions).
    *   **New (User-defined Lens):**
        *   `Sonar, "Investigate the myth '[myth]' focusing on the following user-defined aspect: '[User's custom angle/question]'."`
*   **Key UI/UX Elements:**
    *   Tabs/accordion for lenses.
    *   **New: A clear way to input and trigger a "Custom Investigation Lens."**
*   **Hackathon Judging Alignment:**
    *   Technological Implementation: Strategic and flexible use of Sonar, adapting to user-defined research paths.

### Pillar 3: Comparative Myth Framework

*   **Concept & Deep Research Value:** Understand myths by comparing variations or thematic similarities, fostering synthesis and pattern recognition. (Largely as previously defined, user agency enhancements are less direct here but could involve users suggesting myths to compare against).
*   **Sophisticated Sonar API Usage:**
    *   `Sonar, "Identify and describe 2-3 common variations of the myth '[original myth]'. How do their core claims differ, and what might be the reasons (e.g., cultural, temporal) for these variations?"`
    *   `Sonar, "Find a thematically similar myth to '[original myth]' from a different culture or historical period. Compare and contrast their narratives, underlying messages, common interpretations, and typical explanations."`
*   **Key UI/UX Elements:**
    *   Side-by-side comparison views.
    *   Visual highlighting of similarities/differences.

### Pillar 4: Longitudinal Information Trace (Enhanced User Agency)

*   **Concept & Deep Research Value:** Tracks how a myth or its surrounding information landscape has evolved, highlighting the dynamic nature of belief.
*   **Illustrative User Journey:**
    1.  User clicks "Trace Information History."
    2.  **New: Options to specify a time range or highlight specific types of events/information Sonar should focus on (e.g., "focus on scientific papers," "focus on major media coverage").**
    3.  Sonar generates the trace, presented on an interactive timeline.
*   **Sophisticated Sonar API Usage:**
    *   `Sonar, "Trace public/scientific understanding of [subject of myth] from [start year/user-defined start] to [end year/user-defined end], focusing on [user-selected event types, e.g., 'key policy changes']. Highlight shifts related to myth '[myth]'."`
*   **Key UI/UX Elements:**
    *   Interactive timeline.
    *   **New: Controls for customizing the trace parameters (time range, focus areas).**

### **New Pillar 5: Dynamic Insight Mapping & Connection Weaver**

*   **Concept & Deep Research Value:** After exploring multiple angles or deconstructing sources, this pillar helps users **synthesize findings, identify emerging themes, contradictions, and connections.** It transforms disparate information into cohesive understanding.
*   **Illustrative User Journey:**
    1.  User has engaged with several lenses (Pillar 2) or analyzed multiple sources (Pillar 1).
    2.  A "Synthesize Insights" or "Map Connections" button becomes active.
    3.  Upon clicking, Sonar processes the collected information (summaries from other pillars).
    4.  The app displays key themes, contradictions, and relationships, potentially as a structured summary, a list of key insights, or a simplified visual concept map.
*   **Sophisticated Sonar API Usage:**
    *   `Sonar, "Given the following information about the myth '[myth]': [Summary of Historical Analysis], [Summary of Scientific Scrutiny], [Summary of Source X Deconstruction], identify 3-5 overarching themes, key points of contention, or unexpected connections that emerge. Provide a brief explanation for each."`
    *   `Sonar, "Based on the analyses of [Angle A], [Angle B], and [Source Y], what are the most significant areas of agreement and disagreement regarding the myth '[myth]'?"`
*   **Key UI/UX Elements:**
    *   A dedicated "Synthesis" view.
    *   Clear presentation of synthesized themes, contradictions, and connections.
    *   Option to export or save this synthesized view.
    *   (Ambitious) Basic interactive concept map highlighting relationships.
*   **Hackathon Judging Alignment:**
    *   Quality of the Idea: Elevates the tool from information retrieval to knowledge generation.
    *   Technological Implementation: Demonstrates advanced Sonar use for higher-order cognitive tasks (synthesis, comparison).
    *   Potential Impact: Helps users derive deeper meaning and a more holistic understanding.

## 3. Sparking Discovery: The "Serendipity Engine"

*   **Concept:** Integrated within the investigation flow (e.g., after initial analysis or within a Pillar), a feature to prompt Sonar for less obvious connections or novel perspectives, fostering "aha!" moments.
*   **Sonar API Usage:**
    *   `Sonar, "For the myth '[myth]', what is a less obvious or commonly overlooked academic discipline, historical parallel, or cultural artifact that could offer relevant insights or a surprising comparative context? Explain the connection."`
*   **UI/UX:** A button like "Uncover a Hidden Angle" or "Find an Unexpected Link." Results presented clearly.

## 4. Synergies with Other Application Features

*   (As before) Game links to deep dives; community submissions inform research.
*   **New:** Synthesized insights (Pillar 5) or "Serendipity Engine" discoveries could be shareable content for the community.

## 5. Technical Implementation Notes

*   **State Management (Svelte 5 Runes):** Will need to manage state for user-customized prompts, inputs for trace parameters, and the collection of data from various pillars to feed into the "Insight Mapper."
    ```typescript
    // Expanded State Example
    interface DeepDiveState {
      // ... (previous state fields)
      userCustomSourceQuery?: string;
      userCustomLensQuery?: string;
      traceParameters: { startYear?: string; endYear?: string; focusKeywords?: string[] };
      collectedInsights: { pillar: string; summary: string; data: any }[]; // For Pillar 5
      synthesisResult?: SonarSynthesisResponse;
      serendipityResult?: SonarSerendipityResponse;
      isLoading: { // ...
        synthesis: boolean;
        serendipity: boolean;
      }
    }
    let deepDiveState: DeepDiveState = $state({...});
    ```
*   **API Interaction:** Ensure robust handling of potentially long or complex user inputs for custom prompts. Server-side validation and sanitization are key.
*   **Component Architecture:** Modular components for Pillar 5 (`<InsightMapper />`), Serendipity feature, and UI elements for new user inputs.

## 6. Ethical AI & Responsible Research

Myth Buster promotes deep research with an awareness of AI's role:
*   **Augmenting, Not Replacing, Critical Thought:** The tool is designed to empower users with information and analytical capabilities, but final judgment and critical thinking remain with the user.
*   **Transparency in Process (Implicit):** Features allowing users to guide Sonar prompts (Pillar 1, 2, 4) offer a degree of insight into how the AI is being directed.
*   **Encouraging Source Scrutiny:** Pillar 1 directly addresses the need to critically evaluate sources, even those provided by AI.
*   **Highlighting Nuance:** The multi-angle (Pillar 2) and synthesis (Pillar 5) features are designed to move beyond simplistic answers and explore complexity.

## 7. Demo Narrative Highlights for Hackathon Video

*   **Showcase User Agency:** Quickly demonstrate modifying a prompt for source analysis (Pillar 1) or adding a custom investigation lens (Pillar 2). *"Myth Buster puts you in the driver's seat of your research."*
*   **Highlight Synthesis:** After showing a couple of analytical angles, click "Synthesize Insights" (Pillar 5) and briefly show how the tool connects the information. *"Go beyond collecting facts to actually understanding the bigger picture."*
*   **If time, a "Serendipity" moment:** Click "Uncover a Hidden Angle." *"Discover unexpected connections that spark new ideas."*

This more detailed plan, with increased user agency and a new synthesis pillar, should significantly strengthen your project's positioning for the "Best Deep Research Project" award.
