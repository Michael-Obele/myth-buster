# Simplified Deep Research Implementation Plan

# Simplified Deep Research Implementation Plan

This document outlines a simplified plan for implementing the core deep research features in the Myth Buster application, targeting the "Best Deep Research Project" category within the hackathon timeframe. It leverages Svelte 5, SvelteKit, shadcn-svelte, and the `runed` library for efficient development and state management.

**Goal:** To transform Myth Buster's `/app` route into a guided, multi-layered research platform powered by Perplexity Sonar API, emphasizing user agency and synthesis.

**Goal:** To transform Myth Buster's `/app` route into a guided, multi-layered research platform powered by Perplexity Sonar API, emphasizing user agency and synthesis.

**Core Features to Implement (Prioritized):**

1.  **Multi-Angle Investigation:** Explore myths from predefined and user-defined perspectives.
2.  **Evidence Deconstruction:** Analyze the sources cited by Sonar.
3.  **Dynamic Insight Mapping:** Synthesize findings from different angles.

**Technical Stack:**

-   **Framework:** SvelteKit
-   **Language:** TypeScript
-   **UI:** Shadcn-svelte, Tailwind CSS, Lucide-svelte
-   **State Management:** Svelte 5 Runes (`$state`, `$derived`), Runed (`PersistedState` for persistent data like game score, not active research state)
-   **Server Interaction:** SvelteKit Form Actions (`+page.server.ts`, `use:enhance`)
-   **API:** Perplexity Sonar API (called from server actions)

**Simplified Flow & Implementation Details (`src/routes/app/+page.svelte` and `src/routes/app/+page.server.ts`)**

The core deep research functionality will reside within the `/app` route, appearing after the initial myth verification result is displayed.

## 1. Multi-Angle Investigation

**Concept:** Allow users to trigger Sonar analysis from various perspectives (lenses) and define their own.

**UI Choice Justification (Tabs/Cards vs. Checkboxes/Styled Divs):**

While checkboxes or simple styled divs could trigger the analysis, using components like shadcn-svelte `Tabs` or `Card` is preferred for the Multi-Angle Investigation feature. This is because these components are designed to:

-   **Clearly associate the selection (the lens) with its related content (the research result):** Tabs allow the research output to be displayed directly within the corresponding tab panel.
-   **Handle complex content:** Research results can be detailed, including text, citations, and potentially visualizations, which is better contained within structured components like tab panels or expandable cards.
-   **Provide clear visual states:** Tabs and Cards offer built-in visual cues for active, inactive, and loading states, making the user interface more intuitive.

Tabs provide a standard pattern for organizing different views of related content, making it easy for users to switch between different research angles and see their results in a dedicated area.

**Flow:**

1.  After the user has explored two or more research lenses that have results, a "Synthesize Insights" button appears.
2.  Clicking the button triggers a server action (`?/synthesizeInsights`).
3.  The server action collects the results from all explored lenses that have completed successfully.
4.  It constructs a Sonar API prompt that includes the myth statement and the summaries/results from each lens.
5.  Sonar API processes this information and identifies key themes, points of contention, and connections.
6.  The server action returns the structured synthesis result (themes, connections, overall insight).
7.  The client-side UI updates to display the synthesized themes and connections using components like shadcn-svelte `Card`.

1.  Citations displayed in the initial result or lens results are interactive (e.g., have an "Analyze Source" button next to them).
2.  Clicking this triggers a modal dialog (using shadcn-svelte `Dialog`).
3.  The dialog shows source details and options (using shadcn-svelte `Select` and `Textarea`) for predefined or custom analysis queries about the source.
4.  Submitting a query triggers a server action (`?/analyzeSource`).
5.  The server action calls Sonar API to analyze the source's content or context in relation to the myth.
6.  Sonar returns the analysis result.
7.  The server action returns the result to the client.
8.  The dialog updates to display the source analysis result.

1.  Initial myth verification result is shown.
2.  An "Explore Deeper" section appears below the result.
3.  This section contains interactive elements (likely tabs or cards using `Tabs` or `Card` components from shadcn-svelte) representing predefined lenses (Historical, Scientific, Cultural, etc.) and a "Custom Lens" option.
4.  Clicking a lens or submitting a custom query triggers a server action (`?/researchLens`).
5.  The server action constructs a specific Sonar prompt based on the lens type/custom query and the myth statement.
6.  Sonar returns the result for that specific angle.
7.  The server action returns the result to the client.
8.  The client-side `$state` is updated, and the UI displays the result within the corresponding lens section/tab.
9.  Users can explore multiple lenses.

**Key Components:**

-   `src/routes/app/components/InsightMapper.svelte` (Handles the synthesis display) - *Note: Can implement directly in +page.svelte for hackathon simplicity if preferred.*
-   `src/routes/app/+page.svelte` (Manages synthesis state and passes lens data)
-   `src/routes/app/+page.server.ts` (Contains the `synthesizeInsights` action)

-   `src/routes/app/components/SourceAnalysisDialog.svelte` (Handles the modal UI) - *Note: Can implement directly in +page.svelte for hackathon simplicity if preferred.*
-   `src/routes/app/+page.svelte` (Manages dialog state and passes source data)
-   `src/routes/app/+page.server.ts` (Contains the `analyzeSource` action)

-   `src/routes/app/components/ResearchLenses.svelte` (Handles the tab/card UI for lenses)
-   `src/routes/app/+page.svelte` (Integrates `ResearchLenses` and manages overall app state)
-   `src/routes/app/+page.server.ts` (Contains the `researchLens` action)

**Pseudocode Snippets:**

`src/routes/app/+page.svelte`:

```svelte
<script lang="ts">
  import { $state, $derived } from 'svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  // Assume these are populated from initial verification result
  let currentMythStatement: string = $state('');
  let initialVerdict: string = $state('');
  // ... other initial result details

  interface LensResult {
    id: string;
    name: string;
    isCustom: boolean;
    result: string;
    loading: boolean;
    error: string | null;
  }

  let activeResearchLenses: LensResult[] = $state([]);
  let activeLensId: string = $state('historical');
  let customLensInput: string = $state('');
  let showCustomLensInput: boolean = $state(false);

  const predefinedLenses = [
    { id: 'historical', name: 'Historical Origins' },
    { id: 'scientific', name: 'Scientific Analysis' },
    { id: 'cultural', name: 'Cultural Impact' },
    // ... add more as needed
  ];

  const allLenses = $derived([...predefinedLenses, ...activeResearchLenses.filter(lens => lens.isCustom)]);

  const analyzeLens: SubmitFunction = ({ form }) => {
    const lensType = form.get('lensType') as string;
    const lensName = form.get('lensName') as string;
    const customQuery = form.get('customQuery') as string;
    const lensId = lensType === 'custom' ? `custom-${Date.now()}` : lensType;

    const existingLensIndex = activeResearchLenses.findIndex(lens => lens.id === lensId);
    if (existingLensIndex === -1) {
      activeResearchLenses = [...activeResearchLenses, { id: lensId, name: lensName, isCustom: lensType === 'custom', result: '', loading: true, error: null }];
    } else {
      activeResearchLenses[existingLensIndex] = { ...activeResearchLenses[existingLensIndex], loading: true, error: null };
      activeResearchLenses = activeResearchLenses;
    }
    activeLensId = lensId;

    return async ({ result }) => {
      if (result.type === 'success') {
        const { lensId: resultLensId, researchResult } = result.data;
         activeResearchLenses = activeResearchLenses.map(lens =>
          lens.id === resultLensId ? { ...lens, result: researchResult, loading: false } : lens
        );
      } else if (result.type === 'error' || result.type === 'failure') {
         const { lensId: resultLensId, error } = result.data;
         activeResearchLenses = activeResearchLenses.map(lens =>
          lens.id === resultLensId ? { ...lens, error, loading: false } : lens
        );
        // Show error toast
      }
    };
  };

   function addCustomLens() {
    if (customLensInput.trim()) {
       const form = document.createElement('form');
       form.method = 'POST';
       form.action = '?/researchLens';
       // Append hidden inputs for mythStatement, lensType='custom', lensName=customLensInput, customQuery=customLensInput
       // ... append inputs ...
       document.body.appendChild(form);
       form.requestSubmit();
       form.remove();

       customLensInput = '';
       showCustomLensInput = false;
    }
   }
</script>

<!-- ... initial verification result display ... -->

<section class="my-8 p-6 border rounded-lg">
  <h2 class="text-2xl font-bold mb-4">Explore Deeper</h2>
  <p class="text-muted-foreground mb-6">Dive into the myth from different angles using AI-powered research lenses.</p>

  <Tabs.Root bind:value={activeLensId} class="w-full">
    <Tabs.List>
      {#each predefinedLenses as lens}
        <Tabs.Trigger value={lens.id}>
          {lens.name}
        </Tabs.Trigger>
      {/each}
       {#each activeResearchLenses.filter(lens => lens.isCustom) as lens}
        <Tabs.Trigger value={lens.id}>
          {lens.name}
        </Tabs.Trigger>
      {/each}
      <Button variant="outline" onclick={() => showCustomLensInput = !showCustomLensInput} class="ml-auto">
        {#if showCustomLensInput}Hide Custom Lens{:else}Add Custom Lens{/if}
      </Button>
    </Tabs.List>

    {#if showCustomLensInput}
      <div class="mt-4 flex gap-2">
        <Input bind:value={customLensInput} placeholder="Enter custom research angle (e.g., 'Economic impact')" class="flex-grow" />
        <Button onclick={addCustomLens}>Analyze</Button>
      </div>
    {/if}

    {#each allLenses as lens (lens.id)}
      <Tabs.Content value={lens.id}>
        <div class="mt-4">
          {#if lens.loading}
            <div>Loading {lens.name} research...</div>
             <!-- Add skeleton loader -->
          {:else if lens.error}
            <div class="text-destructive">Error: {lens.error}</div>
          {:else if lens.result}
            <h3 class="text-xl font-semibold mb-2">{lens.name}</h3>
            <div>{lens.result}</div>
             <!-- Render result, handle markdown -->
          {:else}
             <form method="POST" action="?/researchLens" use:enhance={analyzeLens}>
                <input type="hidden" name="mythStatement" value={currentMythStatement} />
                <input type="hidden" name="lensType" value={lens.id} />
                <input type="hidden" name="lensName" value={lens.name} />
                 {#if lens.isCustom}
                   <input type="hidden" name="customQuery" value={lens.name} />
                {/if}
                <Button type="submit">Analyze {lens.name}</Button>
             </form>
          {/if}
        </div>
      </Tabs.Content>
    {/each}
  </Tabs.Root>
</section>
```

`src/routes/app/+page.server.ts`:

```typescript
import type { Actions } from './$types';
import { error } from '@sveltejs/kit';
// Assume PERPLEXITY_API_URL and PERPLEXITY_API_KEY are imported/defined

export const actions: Actions = {
  default: async ({ request }) => {
    // ... existing myth verification logic ...
  },

  researchLens: async ({ request }) => {
    const data = await request.formData();
    const mythStatement = data.get('mythStatement') as string;
    const lensType = data.get('lensType') as string;
    const lensName = data.get('lensName') as string;
    const customQuery = data.get('customQuery') as string;

    if (!mythStatement || !lensType || !lensName) {
       throw error(400, 'Missing required data for research lens.');
    }

    // --- Construct Sonar Prompt ---
    let systemPrompt = 'You are an AI research assistant that analyzes claims from different academic and cultural perspectives. Provide a concise summary.';
    let userPrompt = '';

    switch (lensType) {
        case 'historical':
            userPrompt = `Trace the historical origins and earliest known mentions of the belief that "${mythStatement}".`;
            break;
        case 'scientific':
            systemPrompt = 'You are an AI research assistant focused on scientific consensus and evidence.';
            userPrompt = `Provide a detailed scientific analysis of the claims made in the myth "${mythStatement}", citing relevant studies and findings.`;
            break;
        case 'cultural':
             systemPrompt = 'You are an AI research assistant focused on cultural and societal aspects of beliefs.';
            userPrompt = `Describe the cultural impact, societal influence, or common portrayals of the myth "${mythStatement}".`;
            break;
        case 'custom':
             systemPrompt = 'You are an AI research assistant tasked with investigating a specific, user-defined aspect of a myth.';
            userPrompt = `Investigate the myth "${mythStatement}" focusing on the following user-defined aspect: "${customQuery}".`;
            break;
        // ... handle other predefined lenses
        default:
             throw error(400, `Unknown lens type: ${lensType}`);
    }

    // --- Call Sonar API ---
    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'sonar-medium-online', // Use an appropriate Sonar model
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                 // Add other Sonar parameters if needed (e.g., max_tokens)
            })
        });

        if (!response.ok) {
            console.error(`Sonar API returned error: ${response.status}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { success: false, lensId: lensType === 'custom' ? `custom-${Date.now()}` : lensType, error: `API Error: ${response.status}` };
        }

        const result = await response.json();
        const researchResult = result.choices[0]?.message?.content || 'Could not retrieve research result.';

        return { success: true, lensId: lensType === 'custom' ? `custom-${Date.now()}` : lensType, researchResult, lensName };

    } catch (e: any) {
        console.error('Error calling Sonar API for research lens:', e);
        return { success: false, lensId: lensType === 'custom' ? `custom-${Date.now()}` : lensType, error: e.message || 'An unexpected error occurred.' };
    }
  },
  // ... other actions
};
```

## 2. Evidence Deconstruction

**Concept:** Allow users to get a detailed analysis of specific sources cited by Sonar.

**Concept:** Allow users to get a detailed analysis of specific sources cited by Sonar.

**Flow:**

1.  Citations displayed in the initial result or lens results are interactive (e.g., have an "Analyze Source" button next to them).
2.  Clicking this triggers a modal dialog (using shadcn-svelte `Dialog`).
3.  The dialog shows source details and options (using shadcn-svelte `Select` and `Textarea`) for predefined or custom analysis queries about the source.
4.  Submitting a query triggers a server action (`?/analyzeSource`).
5.  The server action calls Sonar API to analyze the source's content or context in relation to the myth.
6.  Sonar returns the analysis result.
7.  The server action returns the result to the client.
8.  The dialog updates to display the source analysis result.

**Key Components:**

-   `src/routes/app/components/SourceAnalysisDialog.svelte` (Handles the modal UI)
-   `src/routes/app/+page.svelte` (Manages dialog state and passes source data)
-   `src/routes/app/+page.server.ts` (Contains the `analyzeSource` action)

**Pseudocode Snippets:**

`src/routes/app/+page.svelte`: (See previous response's pseudocode for `SourceAnalysisDialog.svelte` logic, integrate it here)

```svelte
<script lang="ts">
  // ... existing imports and state for Multi-Angle Investigation ...
   import * as Dialog from '$lib/components/ui/dialog';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';

   // State for Source Analysis Dialog
   let showSourceAnalysisDialog: boolean = $state(false);
   let selectedSource: { url: string; name: string; mythContext: string } | null = $state(null);
   let currentAnalysisType: string = $state('');
   let customSourceQuery: string = $state('');
   let sourceAnalysisResult: { result: string | null; loading: boolean; error: string | null } | null = $state(null);

   const analysisTypes = [
     { id: 'methodology', name: 'Analyze Methodology' },
     { id: 'reliability', name: 'Assess Reliability' },
     { id: 'arguments', name: 'Break Down Arguments' },
     { id: 'custom', name: 'Custom Query' },
   ];

   function openSourceAnalysis(source: { url: string; name: string; mythContext: string }) {
     selectedSource = source;
     showSourceAnalysisDialog = true;
     sourceAnalysisResult = null; // Reset previous analysis
     currentAnalysisType = '';
     customSourceQuery = '';
   }

   const analyzeSource: SubmitFunction = ({ form }) => {
      sourceAnalysisResult = { result: null, loading: true, error: null };

     return async ({ result }) => {
       if (result.type === 'success') {
         const { analysisResult } = result.data;
          sourceAnalysisResult = { result: analysisResult, loading: false, error: null };
       } else if (result.type === 'error' || result.type === 'failure') {
         const { error } = result.data;
          sourceAnalysisResult = { result: null, loading: false, error };
          // Show error toast
       }
     };
   };

   // Assume citations are available in a state variable, e.g., from initial verification
   let initialCitations = $state<any[]>([]); // Replace any[] with your Citation type
</script>

<!-- ... Initial Verification Result ... -->

<!-- ... Multi-Angle Investigation Section ... -->

<!-- Display citations and Analysis Buttons -->
{#if initialCitations.length > 0}
  <h3 class="text-lg font-semibold mt-6 mb-2">Sources:</h3>
  <ul class="list-disc pl-5">
    {#each initialCitations as citation}
      <li>
        {citation.name || citation.url}
        <Button variant="link" size="sm" onclick={() => openSourceAnalysis({ url: citation.url, name: citation.name || 'Source', mythContext: currentMythStatement })} class="p-0 ml-2">
          Analyze Source
        </Button>
      </li>
    {/each}
  </ul>
{/if}

<!-- Source Analysis Dialog -->
<Dialog.Root bind:open={showSourceAnalysisDialog}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Analyze Source: {selectedSource?.name || selectedSource?.url}</Dialog.Title>
      <Dialog.Description>Request AI analysis of this source in the context of the myth.</Dialog.Description>
    </Dialog.Header>

    <form method="POST" action="?/analyzeSource" use:enhance={analyzeSource}>
      <input type="hidden" name="sourceUrl" value={selectedSource?.url || ''} />
      <input type="hidden" name="sourceName" value={selectedSource?.name || ''} />
      <input type="hidden" name="mythContext" value={selectedSource?.mythContext || ''} />

      <div class="grid gap-4 py-4">
        <Select.Root bind:value={currentAnalysisType}>
          <SelectTrigger class="w-full">
            <SelectValue placeholder="Select analysis type" />
          </SelectTrigger>
          <SelectContent>
            {#each analysisTypes as type}
              <SelectItem value={type.id}>{type.name}</SelectItem>
            {/each}
          </SelectContent>
        </Select.Root>

        {#if currentAnalysisType === 'custom'}
          <Textarea bind:value={customSourceQuery} placeholder="Enter your custom question about the source" />
          <input type="hidden" name="customQuery" value={customSourceQuery} />
        {/if}

        <Button type="submit" disabled={sourceAnalysisResult?.loading || !currentAnalysisType}>
          {#if sourceAnalysisResult?.loading}
            Analyzing...
          {:else}
            Run Analysis
          {/if}
        </Button>
      </div>
    </form>

    {#if sourceAnalysisResult && !sourceAnalysisResult.loading}
      <div class="mt-4 p-4 border rounded bg-muted/50 max-h-[200px] overflow-y-auto">
        {#if sourceAnalysisResult.error}
          <p class="text-destructive">Error: {sourceAnalysisResult.error}</p>
        {:else}
          <p class="text-sm">{sourceAnalysisResult.result}</p>
        {/if}
      </div>
    {/if}

    <Dialog.Footer>
      <Button variant="outline" onclick={() => showSourceAnalysisDialog = false)}>Close</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

`src/routes/app/+page.server.ts`:

```typescript
import type { Actions } from './$types';
import { error } from '@sveltejs/kit';
// Assume PERPLEXITY_API_URL and PERPLEXITY_API_KEY are imported/defined

export const actions: Actions = {
  default: async ({ request }) => {
    // ... existing myth verification logic ...
  },

  researchLens: async ({ request }) => {
      // ... researchLens logic ...
  },

  analyzeSource: async ({ request }) => {
      const data = await request.formData();
      const sourceUrl = data.get('sourceUrl') as string;
      const sourceName = data.get('sourceName') as string;
      const mythContext = data.get('mythContext') as string; // The myth statement being researched
      const analysisType = data.get('analysisType') as string;
      const customQuery = data.get('customQuery') as string;

      if (!sourceUrl || !mythContext || !analysisType) {
          throw error(400, 'Missing required data for source analysis.');
      }

      // --- Construct Sonar Prompt ---
      let systemPrompt = 'You are an AI research assistant tasked with critically analyzing a specific source in the context of a myth.';
      let userPrompt = '';

      // Provide context to Sonar about the source
      const sourceContext = sourceName ? `the source named "${sourceName}" (${sourceUrl})` : `the source at "${sourceUrl}"`;

      switch (analysisType) {
          case 'methodology':
              userPrompt = `Analyze the methodology used in ${sourceContext}. What are its strengths and limitations in the context of the myth "${mythContext}"?`;
              break;
          case 'reliability':
              userPrompt = `Assess the general reliability and potential biases of ${sourceContext}. How credible is it regarding the claims made in the myth "${mythContext}"?`;
              break;
          case 'arguments':
              userPrompt = `Summarize the key arguments or findings presented in ${sourceContext}. How do they support or refute the myth "${mythContext}"?`;
              break;
          case 'custom':
               if (!customQuery) {
                 throw error(400, 'Custom query is required for custom analysis.');
               }
               userPrompt = `Regarding ${sourceContext} and its relation to the myth "${mythContext}": ${customQuery}`;
              break;
          default:
              throw error(400, `Unknown analysis type: ${analysisType}`);
      }

      // --- Call Sonar API ---
      try {
          const response = await fetch(PERPLEXITY_API_URL, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
              },
              body: JSON.stringify({
                  model: 'sonar-medium-online', // Or sonar-large-online for deeper analysis
                  messages: [
                      { role: 'system', content: systemPrompt },
                      { role: 'user', content: userPrompt }
                  ],
                   // Add other Sonar parameters if needed (e.g., max_tokens)
              })
          });

          if (!response.ok) {
              console.error(`Sonar API returned error: ${response.status}`);
               const errorBody = await response.text();
              console.error('Error body:', errorBody);
              return { success: false, error: `API Error: ${response.status}` };
          }

          const result = await response.json();
          const analysisResult = result.choices[0]?.message?.content || 'Could not retrieve source analysis result.';

          return { success: true, analysisResult };

      } catch (e: any) {
          console.error('Error calling Sonar API for source analysis:', e);
          return { success: false, error: e.message || 'An unexpected error occurred.' };
      }
  },
  // ... other actions
};
```

## 3. Dynamic Insight Mapping

**Concept:** Synthesize the information gathered from different research lenses to identify overarching themes, contradictions, and connections.

**Concept:** Synthesize the information gathered from different research lenses to identify overarching themes, contradictions, and connections.

**Flow:**

1.  After the user has explored two or more research lenses, a "Synthesize Insights" button appears.
2.  Clicking the button triggers a server action (`?/synthesizeInsights`).
3.  The server action collects the results from all explored lenses that have completed successfully.
4.  It constructs a Sonar API prompt that includes the myth statement and the summaries/results from each lens.
5.  Sonar API processes this information and identifies key themes, points of contention, and connections.
6.  The server action returns the structured synthesis result.
7.  The client-side UI updates to display the synthesized themes and connections.

**Key Components:**

-   `src/routes/app/components/InsightMapper.svelte` (Handles the synthesis display)
-   `src/routes/app/+page.svelte` (Manages synthesis state and passes lens data)
-   `src/routes/app/+page.server.ts` (Contains the `synthesizeInsights` action)

**Pseudocode Snippets:**

`src/routes/app/+page.svelte`: (See previous response's pseudocode for `InsightMapper.svelte` logic, integrate it here)

```svelte
<script lang="ts">
   // ... existing imports and state for Multi-Angle Investigation and Evidence Deconstruction ...
   import * as Card from '$lib/components/ui/card';

   interface SynthesisResult {
     themes: { title: string; description: string }[];
     connections: { description: string }[];
     overallInsight: string | null;
     loading: boolean;
     error: string | null;
   }

   let synthesisResult: SynthesisResult | null = $state(null);

   // Synthesize button is active if at least 2 lenses have results and synthesis is not loading
   const canSynthesize = $derived(activeResearchLenses.filter(lens => lens.result).length >= 2 && !synthesisResult?.loading);

   const synthesizeInsights: SubmitFunction = ({ form }) => {
      synthesisResult = { themes: [], connections: [], overallInsight: null, loading: true, error: null }; // Set loading state

     return async ({ result }) => {
       if (result.type === 'success') {
         const { themes, connections, overallInsight } = result.data;
         synthesisResult = { themes, connections, overallInsight, loading: false, error: null };
       } else if (result.type === 'error' || result.type === 'failure') {
         const { error } = result.data;
         synthesisResult = { themes: [], connections: [], overallInsight: null, loading: false, error };
          // Show error toast
       }
     };
   };

</script>

<!-- ... Initial Verification Result ... -->

<!-- ... Multi-Angle Investigation Section ... -->

<!-- ... Evidence Deconstruction UI (Dialog and triggering buttons) ... -->

<section class="my-8 p-6 border rounded-lg bg-blue-50">
  <h2 class="text-2xl font-bold mb-4">Synthesize Insights</h2>
  <p class="text-muted-foreground mb-6">Combine findings from different research angles to uncover key themes and connections.</p>

   {#if activeResearchLenses.filter(lens => lens.result).length > 0}
      <form method="POST" action="?/synthesizeInsights" use:enhance={synthesizeInsights}>
         <input type="hidden" name="mythStatement" value={currentMythStatement} />
         <!-- Pass results from all lenses that have completed -->
         <input type="hidden" name="lensResults" value={JSON.stringify(activeResearchLenses.filter(lens => lens.result && !lens.error))} />
        <Button type="submit" disabled={!canSynthesize}>
          {#if synthesisResult?.loading}
            Synthesizing...
          {:else}
            Synthesize Insights
          {/if}
        </Button>
      </form>
   {:else}
       <p class="text-muted-foreground italic">Explore at least two research lenses to enable synthesis.</p>
   {/if}


  {#if synthesisResult && !synthesisResult.loading}
    <div class="mt-6 grid gap-6">
      {#if synthesisResult.error}
        <p class="text-destructive">Error: {synthesisResult.error}</p>
      {:else}
        {#if synthesisResult.overallInsight}
           <Card.Root>
             <Card.Header><Card.Title>Overall Insight</Card.Title></Card.Header>
             <Card.Content><p>{synthesisResult.overallInsight}</p></Card.Content>
           </Card.Root>
        {/if}

        {#if synthesisResult.themes && synthesisResult.themes.length > 0}
          <h3 class="text-xl font-semibold mb-2">Key Themes:</h3>
          <div class="grid md:grid-cols-2 gap-4">
            {#each synthesisResult.themes as theme}
              <Card.Root>
                <Card.Header><Card.Title>{theme.title}</Card.Title></Card.Header>
                <Card.Content><p>{theme.description}</p></Card.Content>
              </Card.Root>
            {/each}
          </div>
        {/if}

        {#if synthesisResult.connections && synthesisResult.connections.length > 0}
          <h3 class="text-xl font-semibold mt-4 mb-2">Connections & Points of Contention:</h3>
           <ul class="list-disc pl-5 grid gap-2">
            {#each synthesisResult.connections as connection}
              <li>{connection.description}</li>
            {/each}
           </ul>
        {/if}
      {/if}
    </div>
  {/if}
</section>

```

`src/routes/app/+page.server.ts`:

```typescript
import type { Actions } from './$types';
import { error } from '@sveltejs/kit';
// Assume PERPLEXITY_API_URL and PERPLEXITY_API_KEY are imported/defined

export const actions: Actions = {
  default: async ({ request }) => {
    // ... existing myth verification logic ...
  },

  researchLens: async ({ request }) => {
      // ... researchLens logic ...
  },

  analyzeSource: async ({ request }) => {
      // ... analyzeSource logic ...
  },

  synthesizeInsights: async ({ request }) => {
    const data = await request.formData();
    const mythStatement = data.get('mythStatement') as string;
    const lensResultsJson = data.get('lensResults') as string;

    if (!mythStatement || !lensResultsJson) {
        throw error(400, 'Missing required data for synthesis.');
    }

    let lensResults;
    try {
      lensResults = JSON.parse(lensResultsJson);
       if (!Array.isArray(lensResults) || lensResults.length < 2) {
          throw new Error('Requires results from at least two lenses.');
       }
    } catch (e: any) {
       throw error(400, `Invalid or insufficient lens results: ${e.message}`);
    }

    // --- Construct Sonar Prompt ---
    const systemPrompt = 'You are an AI that synthesizes research findings from different perspectives on a single topic. Identify overarching themes, contradictions, and key connections. Provide a concise overall insight and list themes and connections.';
    let userPrompt = `Synthesize the following research findings about the myth "${mythStatement}":\n\n`;

    lensResults.forEach((lens: any) => {
      if (lens.result) {
        userPrompt += `${lens.name} Analysis:\n${lens.result}\n\n`;
      }
    });

    userPrompt += `Based on these analyses, identify:\n1. 3-5 overarching themes that appear across different perspectives.\n2. Key points of contention or contradictions between the findings.\n3. Unexpected connections or relationships.\nProvide a brief overall insight summarizing the synthesis. Format the output as JSON with the following keys: \`overallInsight\` (string), \`themes\` (array of { title: string; description: string }), \`connections\` (array of { description: string }).`;


    // --- Call Sonar API ---
    try {
        const response = await fetch(PERPLEXITY_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'sonar-large-online', // Use a more powerful model for synthesis
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                 // Add other Sonar parameters if needed
            })
        });

        if (!response.ok) {
            console.error(`Sonar API returned error: ${response.status}`);
            const errorBody = await response.text();
            console.error('Error body:', errorBody);
            return { success: false, error: `API Error: ${response.status}` };
        }

        const result = await response.json();
        let synthesisData = { themes: [], connections: [], overallInsight: 'Could not synthesize insights.' };

        // Attempt to parse JSON from the response content
        const jsonMatch = result.choices[0]?.message?.content.match(/```json\\n([\\s\\S]*?)\\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
             synthesisData = JSON.parse(jsonMatch[1]);
          } catch (parseError) {
             console.error('Failed to parse synthesis JSON:', parseError);
             synthesisData.overallInsight = result.choices[0]?.message?.content || synthesisData.overallInsight;
          }
        } else {
           synthesisData.overallInsight = result.choices[0]?.message?.content || synthesisData.overallInsight;
        }


        return { success: true, themes: synthesisData.themes, connections: synthesisData.connections, overallInsight: synthesisData.overallInsight };

    } catch (e: any) {
        console.error('Error calling Sonar API for synthesis:', e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
  },
  // ... other actions
};
```

This plan provides a clear, actionable roadmap for the remaining days of the hackathon. By focusing on these core features and leveraging the chosen technology stack, you can build a compelling "Best Deep Research Project" entry. Remember to implement robust error handling, loading states, and polish the UI/UX as you go.