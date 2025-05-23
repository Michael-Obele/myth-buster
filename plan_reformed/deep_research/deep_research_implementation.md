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
      systemPrompt = HISTORICAL_LENS_SYSTEM_PROMPT;
      userPrompt = `Trace the historical origins and earliest known mentions of the belief that "${mythStatement}".`;
    } else if (lensType === 'custom') {
      systemPrompt = CUSTOM_LENS_SYSTEM_PROMPT;
      userPrompt = `Investigate the myth "${mythStatement}" focusing on the following user-defined aspect: "${customQuery}".`;
    }
    // ... other lens types
    
    // Call Sonar API with the constructed prompts
    // Parse and return results
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
- Create `SourceAnalysis.svelte` component for the analysis modal
- Develop `SourceAnalysisPromptSelector.svelte` for pre-defined and custom analytical queries

**UI Elements:**
- "Analyze Source" buttons next to each citation
- Modal dialog for displaying source analysis
- Dropdown for selecting pre-defined analytical queries
- Input field for custom questions about the source
- Visual indicators for source credibility (badges, ratings)

**State Management:**
```typescript
// In SourceAnalysis.svelte
interface SourceAnalysis {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  analysisType: 'methodology' | 'reliability' | 'arguments' | 'corroboration' | 'custom';
  customQuery?: string;
  result: string;
  loading: boolean;
  error: string | null;
}

let currentSourceAnalysis: SourceAnalysis | null = $state(null);
let analysisHistory: Record<string, SourceAnalysis[]> = $state({});
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
  let systemPrompt = SOURCE_ANALYSIS_SYSTEM_PROMPT;
  let userPrompt = '';
  
  if (analysisType === 'methodology') {
    userPrompt = `Analyze the methodology of "${sourceName}" (${sourceUrl}). What are its strengths and limitations in the context of the myth about "${mythContext}"?`;
  } else if (analysisType === 'custom') {
    userPrompt = `Regarding the source "${sourceName}" (${sourceUrl}) in the context of the myth about "${mythContext}": ${customQuery}`;
  }
  // ... other analysis types
  
  // Call Sonar API with the constructed prompts
  // Parse and return results
}
```

**Pre-defined Analysis Queries:**
- Methodology Analysis: Strengths and limitations of the research methodology
- Reliability Assessment: Academic consensus on the source's reliability
- Argument Breakdown: Key arguments and how they support/refute the myth
- Corroborating Evidence: Other research that supports or contradicts this source
- Bias Evaluation: Potential biases or conflicts of interest

### 3. Dynamic Insight Mapping & Connection Weaver

This feature synthesizes findings across different research angles to identify themes, contradictions, and connections.

#### Technical Implementation

**New Components:**
- `InsightMapper.svelte` in `src/routes/app/components/`
- `ThemeDisplay.svelte` for showing identified themes
- `ConnectionVisualizer.svelte` for simple visualization (if time permits)

**UI Elements:**
- "Synthesize Insights" button that appears after multiple lenses have been explored
- Structured display of key themes, contradictions, and connections
- Visual indicators for the strength of connections or confidence in insights

**State Management:**
```typescript
// In InsightMapper.svelte
interface Theme {
  id: string;
  title: string;
  description: string;
  relevance: 'high' | 'medium' | 'low';
  relatedLenses: string[];
}

interface Connection {
  id: string;
  description: string;
  sourceThemeId: string;
  targetThemeId: string;
  strength: 'strong' | 'moderate' | 'weak';
  nature: 'supporting' | 'contradicting' | 'complementary';
}

interface SynthesisResult {
  themes: Theme[];
  connections: Connection[];
  overallInsight: string;
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
  const systemPrompt = SYNTHESIS_SYSTEM_PROMPT;
  
  // Create a detailed user prompt that includes summaries from all explored lenses
  let userPrompt = `Given the following information about the myth "${mythStatement}":\n\n`;
  
  lensResults.forEach((lens: any) => {
    userPrompt += `${lens.name} Analysis: ${lens.result}\n\n`;
  });
  
  userPrompt += `Identify 3-5 overarching themes, key points of contention, or unexpected connections that emerge from these analyses. For each theme or connection, provide a brief explanation of its significance. Then, describe how these elements relate to each other.`;
  
  // Call Sonar API with the synthesis prompt
  // Parse the response into themes and connections
  // Return structured synthesis result
}
```

**Visualization Strategy:**
- For MVP: Use structured text display with visual hierarchy
- If time permits: Implement a simple network graph visualization using a lightweight library
- Focus on clarity and insight rather than complex visuals

## Integration with Existing Codebase

To integrate these features into the existing Myth Buster application:

1. **Enhance the Verification Flow:**
   - After a myth is verified, present the "Explore Deeper" section
   - Update the `/app/+page.svelte` to include the new research components
   - Modify the state management to track research progress

2. **Server-Side Enhancements:**
   - Add the new actions to `/app/+page.server.ts`
   - Implement caching for research results
   - Create reusable prompt templates for different research types

3. **UI/UX Improvements:**
   - Create a consistent visual language for research components
   - Implement loading states that communicate research depth
   - Design a clear visual hierarchy for the research journey

4. **State Management:**
   - Use Svelte 5 Runes for reactive state
   - Implement PersistedState for saving research progress
   - Create a central store for tracking the overall research journey

## Technical Challenges and Solutions

1. **API Rate Limiting:**
   - Implement request throttling and queuing
   - Use effective caching to minimize redundant API calls
   - Provide clear feedback to users during longer operations

2. **Complex State Management:**
   - Structure state carefully to handle nested research data
   - Use derived state to calculate research metrics and progress
   - Implement state persistence for research-in-progress

3. **UI Performance with Rich Research Data:**
   - Lazy-load research components
   - Implement virtualization for long research results
   - Use progressive enhancement for complex visualizations

## Hackathon Implementation Timeline

1. **Day 1:**
   - Implement Multi-Angle Investigation basic structure
   - Create the ResearchLenses component and server action
   - Test with pre-defined lenses

2. **Day 2:**
   - Enhance Multi-Angle Investigation with custom lens input
   - Implement Evidence Deconstruction component and server action
   - Add pre-defined analytical queries

3. **Day 3:**
   - Implement source analysis with custom queries
   - Create the InsightMapper component and basic synthesis
   - Begin integration testing

4. **Day 4:**
   - Refine UI/UX for all research components
   - Implement additional visual enhancements
   - Optimize performance and error handling

5. **Final Day:**
   - Comprehensive testing and bug fixing
   - Create demo examples and documentation
   - Prepare submission materials highlighting deep research capabilities

This implementation plan transforms the Myth Buster application from a simple fact-checking tool into a sophisticated deep research platform, making it a strong contender for the "Best Deep Research Project" category.