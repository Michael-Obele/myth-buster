# Deep Research Implementation Plan

This document outlines the implementation strategy for transforming Myth Buster into a competitive entry for the "Best Deep Research Project" category in the Perplexity API Hackathon.

## Priority Features Implementation

Based on our analysis, we've identified three key features that will showcase Sonar's deep research capabilities while being feasible to implement within the hackathon timeframe.

### 1. Multi-Angle Investigation with Enhanced User Agency

This feature allows users to explore myths from multiple research perspectives with significant control over the research process.

#### Technical Implementation

**New Components:**
- `ResearchLenses.svelte` in `src/routes/app/components/`
- `CustomLensInput.svelte` in `src/routes/app/components/`
- `LensResult.svelte` in `src/routes/app/components/`

**UI Structure:**
- Tabs/accordion interface using shadcn-svelte components
- Each lens (Historical, Scientific, Cultural, Psychological, Underlying Questions) gets its own tab
- "Add Custom Lens" button and input field for user-defined research angles

**State Management:**
```typescript
// In ResearchLenses.svelte
interface LensResult {
  id: string;
  name: string;
  isCustom: boolean;
  query: string;
  result: string;
  loading: boolean;
  error: string | null;
  timestamp: number;
}

let activeResearchLenses: LensResult[] = $state([]);
let activeLensId: string | null = $state(null);
let customLensInput: string = $state('');
```

**Server Actions:**
- Enhance `/app/+page.server.ts` with a new `researchLens` action:
```typescript
export const actions = {
  // ... existing actions
  researchLens: async ({ request }) => {
    const data = await request.formData();
    const mythStatement = data.get('mythStatement') as string;
    const lensType = data.get('lensType') as string;
    const customQuery = data.get('customQuery') as string;
    
    // Construct the appropriate Sonar API prompt based on lens type
    let systemPrompt = '';
    let userPrompt = '';
    
    if (lensType === 'historical') {
      systemPrompt = HISTORICAL_LENS_SYSTEM_PROMPT; // Ensure this constant is defined
      userPrompt = `Trace the historical origins and earliest known mentions of the belief that "${mythStatement}".`;
    } else if (lensType === 'custom') {
      systemPrompt = CUSTOM_LENS_SYSTEM_PROMPT; // Ensure this constant is defined
      userPrompt = `Investigate the myth "${mythStatement}" focusing on the following user-defined aspect: "${customQuery}".`;
    }
    // ... other lens types
    
    // Call Sonar API with the constructed prompts
    // Parse and return results
    // Server-side logic includes robust validation of the parsed JSON response to ensure it matches the expected TypeScript interface (e.g., ResearchLensResponse).
  }
}
```

**API Prompts:**
- Create specialized system prompts for each lens type
- Design prompts to elicit well-structured, insightful responses
- For custom lenses, create a template that can incorporate user input effectively

**Caching Strategy:**
- Cache lens results using a combination of myth statement, lens type, and custom query as key
- Implement a TTL (Time-To-Live) of 24 hours for cached results

### 2. Evidence Deconstruction & Source Analysis

This feature allows users to critically evaluate individual pieces of evidence by requesting Sonar to analyze specific citations.

#### Technical Implementation

**Component Enhancements:**
- Enhance `CitationList.svelte` to make citations interactive
- Create `SourceAnalysis.svelte` component for the analysis modal (likely integrated directly into `/app/+page.svelte` for simplicity in the hackathon)
- Develop `SourceAnalysisPromptSelector.svelte` for pre-defined and custom analytical queries (integrated into the dialog)

**UI Elements:**
- "Analyze Source" buttons next to each citation
- Modal dialog for displaying source analysis
- Dropdown for selecting pre-defined analytical queries
- Input field for custom questions about the source
- Visual indicators for source credibility (badges, ratings) - *Future enhancement*

**State Management:**
```typescript
// In /app/+page.svelte
interface SourceAnalysis {
  // ... (as defined previously, likely managed within the page component's state)
  // result: string;
  // loading: boolean;
  // error: string | null;
}
// Example state in +page.svelte
let currentSourceAnalysisResult: { analysis: string; loading: boolean; error: string | null } | null = $state(null);
```

**Server Actions:**
- Add `analyzeSource` action to `/app/+page.server.ts`:
```typescript
analyzeSource: async ({ request }) => {
  const data = await request.formData();
  const sourceUrl = data.get('sourceUrl') as string;
  const sourceName = data.get('sourceName') as string;
  const mythContext = data.get('mythContext') as string;
  const analysisType = data.get('analysisType') as string;
  const customQuery = data.get('customQuery') as string;
  
  // Construct appropriate Sonar API prompt based on analysis type
  let systemPrompt = SOURCE_ANALYSIS_SYSTEM_PROMPT; // Ensure this constant is defined
  let userPrompt = '';
  
  if (analysisType === 'methodology') {
    userPrompt = `Analyze the methodology of "${sourceName}" (${sourceUrl}). What are its strengths and limitations in the context of the myth about "${mythContext}"?`;
  } else if (analysisType === 'custom') {
    userPrompt = `Regarding the source "${sourceName}" (${sourceUrl}) in the context of the myth about "${mythContext}": ${customQuery}`;
  }
  // ... other analysis types
  
  // Call Sonar API with the constructed prompts
  // Parse and return results
  // Server-side logic includes robust validation of the parsed JSON response to ensure it matches the expected TypeScript interface (e.g., AnalyzeSourceResponse).
}
```

**Pre-defined Analysis Queries:**
- Methodology Analysis: Strengths and limitations of the research methodology
- Reliability Assessment: Academic consensus on the source's reliability
- Argument Breakdown: Key arguments and how they support/refute the myth
- Corroborating Evidence: Other research that supports or contradicts this source
- Bias Evaluation: Potential biases or conflicts of interest - *Simplified for hackathon, mainly covered by reliability*

### 3. Dynamic Insight Mapping & Connection Weaver

This feature synthesizes findings across different research angles to identify themes, contradictions, and connections.

#### Technical Implementation

**New Components:**
- `InsightMapper.svelte` in `src/routes/app/components/` (or integrated directly into `/app/+page.svelte`)
- `ThemeDisplay.svelte` for showing identified themes (likely part of `InsightMapper.svelte` or `/app/+page.svelte`)
- `ConnectionVisualizer.svelte` for simple visualization (if time permits) - *Likely out of scope for hackathon MVP, text-based display prioritized*

**UI Elements:**
- "Synthesize Insights" button that appears after multiple lenses have been explored
- Structured display of key themes, contradictions, and connections
- Visual indicators for the strength of connections or confidence in insights - *Simplified for hackathon*

**State Management:**
```typescript
// In /app/+page.svelte
interface SynthesisResult {
  overallInsight: string | null;
  keyThemes: { title: string; description: string }[];
  connections: { description: string }[]; // Simplified, may also include contradictions
  loading: boolean;
  error: string | null;
}

let synthesisResult: SynthesisResult | null = $state(null);
```

**Server Actions:**
- Add `synthesizeInsights` action to `/app/+page.server.ts`:
```typescript
synthesizeInsights: async ({ request }) => {
  const data = await request.formData();
  const mythStatement = data.get('mythStatement') as string;
  const lensResults = JSON.parse(data.get('lensResults') as string);
  
  // Construct a system prompt for synthesizing insights
  const systemPrompt = SYNTHESIS_SYSTEM_PROMPT; // Ensure this constant is defined
  
  // Create a detailed user prompt that includes summaries from all explored lenses
  let userPrompt = `Given the following information about the myth "${mythStatement}":\n\n`;
  
  lensResults.forEach((lens: any) => { // Type `lens` appropriately based on `LensResult`
    userPrompt += `${lens.name} Analysis: ${lens.result}\n\n`;
  });
  
  userPrompt += `Identify 3-5 overarching themes, key points of contention, or unexpected connections that emerge from these analyses. For each theme or connection, provide a brief explanation of its significance. Then, describe how these elements relate to each other. Provide an 'overallInsight' as well.`;
  
  // Call Sonar API with the synthesis prompt
  // Parse the response into themes and connections
  // Return structured synthesis result
  // Server-side logic includes robust validation of the parsed JSON response to ensure it matches the expected TypeScript interface (e.g., SynthesizeInsightsResponse).
}
```

**Visualization Strategy:**
- For MVP: Use structured text display with shadcn-svelte `Card` components for themes, lists for connections/contradictions.
- Focus on clarity and insight rather than complex visuals.

## Integration with Existing Codebase

To integrate these features into the existing Myth Buster application:

1.  **Enhance the Verification Flow:**
    *   After a myth is verified (initial `verifyMyth` action in `/app/+page.server.ts`), present the "Explore Deeper" section on `/app/+page.svelte`.
    *   Update `/app/+page.svelte` to include UI for triggering and displaying results from `researchLens`, `analyzeSource`, and `synthesizeInsights`.
    *   Modify the state management in `/app/+page.svelte` to track the state of each deep research feature (loading, results, errors).

2.  **Server-Side Enhancements:**
    *   Add the new actions (`researchLens`, `analyzeSource`, `synthesizeInsights`) to `/app/+page.server.ts`.
    *   **Crucially, implement robust validation logic within each server action after receiving and parsing the Perplexity API response. Ensure the structure of `parsedContent` matches the expected TypeScript interfaces (e.g., `VerifyMythResponse`, `ResearchLensResponse`, `AnalyzeSourceResponse`, `SynthesizeInsightsResponse`) before returning data to the client. This was recently implemented and enhances reliability.**
    *   Implement server-side caching for API responses from these actions to manage API costs and improve performance.
    *   Create and refine system and user prompts for each new Sonar API interaction.

3.  **UI/UX Improvements:**
    *   Create a consistent visual language for deep research components using shadcn-svelte.
    *   Implement clear loading states (e.g., skeleton loaders, spinners within buttons) for each asynchronous operation.
    *   Design a clear visual hierarchy to present the multi-layered research findings.

4.  **State Management:**
    *   Use Svelte 5 Runes (`$state`, `$derived`) within `/app/+page.svelte` for managing the UI state related to deep research features.
    *   No client-side `PersistedState` is planned for active deep research data for the hackathon scope; results are fetched on demand or from server cache.

## Technical Challenges and Solutions

1.  **API Rate Limiting & Cost:**
    *   **Solution:** Aggressive server-side caching with appropriate TTLs. Clear UI indication of cached data. Throttling/queuing is out of scope for hackathon MVP but a consideration for production.
2.  **Complex State Management in `/app/+page.svelte`:**
    *   **Solution:** Keep state localized where possible. Use derived state (`$derived`) for computed UI properties. Ensure action results clearly update specific state slices.
3.  **UI Performance with Rich Research Data:**
    *   **Solution:** Use shadcn-svelte components which are generally performant. For very long text, ensure proper `whitespace-pre-wrap` and consider `ScrollArea` components. Virtualization is out of scope for hackathon.
4.  **Robust Prompt Engineering for Structured JSON:**
    *   **Solution:** Iterate on prompts, clearly define the desired JSON structure in the prompt itself, and include server-side validation of the returned JSON structure. Fallback to parsing text if direct JSON output fails or is malformed.

## Hackathon Implementation Timeline

1.  **Day 1:**
    *   Implement Multi-Angle Investigation basic structure (predefined lenses, server action, basic UI display).
    *   Add server-side response validation for `researchLens`.

2.  **Day 2:**
    *   Enhance Multi-Angle Investigation with custom lens input.
    *   Implement Evidence Deconstruction (dialog, predefined analysis types, server action, basic UI display).
    *   Add server-side response validation for `analyzeSource`.

3.  **Day 3:**
    *   Implement Evidence Deconstruction with custom query input.
    *   Implement Dynamic Insight Mapping (button logic, server action for synthesis, basic UI display).
    *   Add server-side response validation for `synthesizeInsights`.

4.  **Day 4:**
    *   Refine UI/UX for all deep research components (loading states, error display, layout).
    *   Implement server-side caching for all deep research actions.
    *   Integrate all features smoothly into the `/app` page flow.

5.  **Final Day:**
    *   Comprehensive testing and bug fixing.
    *   Create demo examples and prepare submission materials.

This implementation plan transforms the Myth Buster application from a simple fact-checking tool into a sophisticated deep research platform, making it a strong contender for the "Best Deep Research Project" category.