# Feature: Advanced Evidence Deconstruction

**Parent Plan:** [Deep Research Overview](./deep_research_overview.md)

## 1. Concept

Allow users to critically examine specific pieces of evidence or sources cited by the Perplexity Sonar API (either from the initial verification or from Multi-Angle Investigation results). This goes beyond simply viewing citations, enabling users to prompt further Sonar analysis on a specific item.

**Enhancements:**
*   **Corroboration/Contradiction Seeking:** A new analysis type to find other research that supports or refutes a claim made in a specific source.
*   More nuanced prompts for analyzing methodology, reliability, and arguments.

## 2. Deep Research Angle

This feature transforms Sonar from an answer engine into a research assistant that helps users:
*   Critically evaluate the underpinnings of claims (even Sonar's own initial claims via its sources).
*   Understand the strengths and limitations of different types of evidence.
*   Practice information literacy and source criticism.
*   Build a more robust understanding by exploring the web of evidence around a topic.

## 3. Sonar API Usage

After Sonar provides a verdict and sources, or a lens provides its analysis and sources:
1.  User selects a citation/source.
2.  A dialog appears offering various analysis types.
3.  User selection triggers specific Sonar prompts about that source in relation to the myth.

**Example Prompts:**

*   **Analyze Methodology:** `"Analyze the methodology of the study or report presented in [source: URL/Title]. What are its strengths and limitations in the context of the myth about [myth topic]?"`
*   **Assess Reliability:** `"What is the general academic or expert consensus on the reliability and potential biases of [source: URL/Title] concerning [myth topic]?"`
*   **Summarize Arguments:** `"Summarize the key arguments and findings of [source: URL/Title] and explain precisely how they support or refute the myth about [topic]."`
*   **Find Corroborating/Contradicting Evidence:** `"Find 2-3 other pieces of research or expert opinions that corroborate or contradict the primary claim made in [source: URL/Title] regarding [myth topic]. Briefly summarize each and its stance."`
*   **Custom Query on Source:** `"Regarding [source: URL/Title] and its relation to the myth '[myth topic]': [user's custom question about the source]."`

## 4. Flow

1.  Citations (from initial verification or lens results) are interactive (e.g., "Analyze Source" button).
2.  Clicking triggers a modal dialog (shadcn-svelte `Dialog`).
3.  Dialog shows source details and a `Select` for predefined analysis types (including the new "Find Corroborating/Contradicting Evidence") and a `Textarea` for custom queries.
4.  Submitting triggers a server action (`?/analyzeSource`).
5.  Server action calls Sonar API with a tailored prompt.
6.  Dialog updates to display the source analysis result.

## 5. Key Components

*   `src/routes/app/components/SourceAnalysisDialog.svelte` (or integrated into `+page.svelte`): Handles modal UI, form for selecting analysis type.
*   `src/routes/app/+page.svelte`: Manages dialog state, selected source data, and displays analysis results.
*   `src/routes/app/+page.server.ts`: Contains the `analyzeSource` SvelteKit action.

## 6. Pseudocode Snippets

### `src/routes/app/+page.svelte` (Relevant parts for Dialog and State)
```svelte
<script lang="ts">
  import { $state } from 'svelte';
  import * as Dialog from '$lib/components/ui/dialog';
  import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  // Assume currentMythStatement is available and populated
  let currentMythStatement: string = $state("Example Myth Statement for Source Analysis"); 

  // State for Source Analysis Dialog
  let showSourceAnalysisDialog: boolean = $state(false);
  interface SourceToAnalyze { url: string; name: string; context: string; 
  }
  let selectedSourceForAnalysis: SourceToAnalyze | null = $state(null);
  let sourceAnalysisType: string = $state('');
  let customSourceAnalysisQuery: string = $state('');

  interface SourceAnalysisResult {
    analysis: string | null;
    loading: boolean;
    error: string | null;
  }
  let currentSourceAnalysisResult: SourceAnalysisResult | null = $state(null);

  const sourceAnalysisTypes = $state([
    { id: 'methodology', name: 'Analyze Methodology' },
    { id: 'reliability', name: 'Assess Reliability' },
    { id: 'arguments', name: 'Break Down Arguments' },
    { id: 'corroborate', name: 'Find Corroborating/Contradicting Evidence' },
    { id: 'custom', name: 'Custom Query on Source' },
  ]);

  function openSourceAnalysisModal(sourceUrl: string, sourceName: string, mythContext: string) {
    selectedSourceForAnalysis = { url: sourceUrl, name: sourceName || 'Unnamed Source', context: mythContext };
    sourceAnalysisType = ''; 
    customSourceAnalysisQuery = ''; 
    currentSourceAnalysisResult = null; 
    showSourceAnalysisDialog = true;
  }

  const handleSourceAnalysisSubmit: SubmitFunction = () => {
    currentSourceAnalysisResult = { analysis: null, loading: true, error: null };
    return async ({ result, update }) => {
      await update();
      if (result.type === 'success' && result.data) {
        currentSourceAnalysisResult = { analysis: (result.data as any).analysisResult, loading: false, error: null };
      } else if (result.type === 'error' || result.type === 'failure') {
        currentSourceAnalysisResult = { analysis: null, loading: false, error: (result.data as any)?.error || 'Analysis failed' };
      }
    };
  };

  let citationsFromVerification = $state([{ name: 'Example Study 1', url: 'http://example.com/study1', mythContext: currentMythStatement }]);
</script>

<!-- Button to trigger source analysis (example) -->
{#each citationsFromVerification as citation}
  <div>
    {citation.name} (<a href={citation.url} target="_blank" rel="noopener noreferrer" class="underline">Link</a>)
    <Button variant="link" on:click={() => openSourceAnalysisModal(citation.url, citation.name, citation.mythContext)}>
      Analyze Source
    </Button>
  </div>
{/each}


<Dialog.Root bind:open={showSourceAnalysisDialog}>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <Dialog.Title>Analyze Source: {selectedSourceForAnalysis?.name}</Dialog.Title>
      <Dialog.Description>
        Select an analysis type for <a href={selectedSourceForAnalysis?.url} target="_blank" class="underline">{selectedSourceForAnalysis?.url}</a>
        in the context of "{selectedSourceForAnalysis?.context}".
      </Dialog.Description>
    </Dialog.Header>
    
    <form method="POST" action="?/analyzeSource" use:enhance={handleSourceAnalysisSubmit} class="space-y-4">
      <input type="hidden" name="sourceUrl" value={selectedSourceForAnalysis?.url || ''} />
      <input type="hidden" name="sourceName" value={selectedSourceForAnalysis?.name || ''} />
      <input type="hidden" name="mythContext" value={selectedSourceForAnalysis?.context || ''} />

      <Select.Root bind:value={sourceAnalysisType} name="analysisType">
        <SelectTrigger>
          <SelectValue placeholder="Select analysis type..." />
        </SelectTrigger>
        <SelectContent>
          {#each sourceAnalysisTypes as type}
            <SelectItem value={type.id}>{type.name}</SelectItem>
          {/each}
        </SelectContent>
      </Select.Root>

      {#if sourceAnalysisType === 'custom'}
        <Textarea name="customQuery" bind:value={customSourceAnalysisQuery} placeholder="Enter your specific question about this source..." />
      {/if}

      <Button type="submit" class="w-full" disabled={!sourceAnalysisType || currentSourceAnalysisResult?.loading}>
        {#if currentSourceAnalysisResult?.loading}Analyzing...{:else}Run Analysis{/if}
      </Button>
    </form>

    {#if currentSourceAnalysisResult && !currentSourceAnalysisResult.loading}
      <div class="mt-4 p-3 border rounded bg-muted/30 max-h-[250px] overflow-y-auto">
        {#if currentSourceAnalysisResult.error}
          <p class="text-destructive">Error: {currentSourceAnalysisResult.error}</p>
        {:else if currentSourceAnalysisResult.analysis}
          <h4 class="font-semibold mb-2">Analysis Result:</h4>
          <article class="prose prose-sm dark:prose-invert max-w-none">{currentSourceAnalysisResult.analysis}</article>
        {:else}
          <p class="text-muted-foreground">No analysis result to display.</p>
        {/if}
      </div>
    {/if}
    <Dialog.Footer>
      <Button variant="outline" on:click={() => showSourceAnalysisDialog = false}>Close</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

### `src/routes/app/+page.server.ts` (analyzeSource action)
```typescript
import { fail } from '@sveltejs/kit'; // Ensure fail is imported
// In export const actions: Actions = { ... }
  analyzeSource: async ({ request, fetch }) => { // Added fetch for Perplexity API
    const data = await request.formData();
    const sourceUrl = data.get('sourceUrl') as string;
    const sourceName = data.get('sourceName') as string;
    const mythContext = data.get('mythContext') as string; 
    const analysisType = data.get('analysisType') as string;
    const customQuery = data.get('customQuery') as string | undefined;

    if (!sourceUrl || !mythContext || !analysisType) {
      return fail(400, { error: 'Missing required data for source analysis.' });
    }

    let systemPrompt = 'You are an AI research assistant specializing in critical source evaluation.';
    let userPrompt = '';
    const sourceIdentifier = sourceName ? `the source named "${sourceName}" available at ${sourceUrl}` : `the source at ${sourceUrl}`;

    switch (analysisType) {
      case 'methodology':
        userPrompt = `Analyze the research methodology used in ${sourceIdentifier}. What are its strengths and limitations, particularly in the context of the myth: "${mythContext}"?`;
        break;
      case 'reliability':
        userPrompt = `Assess the general reliability, authority, and potential biases of ${sourceIdentifier}. How credible is it regarding claims related to the myth: "${mythContext}"?`;
        break;
      case 'arguments':
        userPrompt = `Summarize the key arguments or findings presented in ${sourceIdentifier}. Explain precisely how they support, refute, or add nuance to the myth: "${mythContext}".`;
        break;
      case 'corroborate':
        userPrompt = `For the primary claims made in ${sourceIdentifier} regarding the myth "${mythContext}", find 2-3 other distinct pieces of research, expert opinions, or reports that either corroborate or contradict these claims. For each, briefly state its main point and whether it supports or opposes the source's claims.`;
        break;
      case 'custom':
        if (!customQuery) {
          return fail(400, { error: 'Custom query content is required for this analysis type.' });
        }
        userPrompt = `Regarding ${sourceIdentifier} and its relation to the myth "${mythContext}", please address the following specific query: "${customQuery}"`;
        break;
      default:
        return fail(400, { error: `Unknown source analysis type: ${analysisType}` });
    }

    try {
      const response = await fetch(process.env.PERPLEXITY_API_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY!}`
        },
        body: JSON.stringify({
          model: 'sonar-large-online', 
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Sonar API Error for analyzeSource (${response.status}): ${errorBody}`);
        return fail(response.status, { error: `API Error: ${response.statusText}. ${errorBody.substring(0, 200)}` });
      }

      const result = await response.json();
      const analysisResult = result.choices[0]?.message?.content?.trim() || 'Could not retrieve source analysis.';
      
      return { success: true, analysisResult };

    } catch (e: any) {
      console.error('Error calling Sonar API for source analysis:', e);
      return fail(500, { error: e.message || 'An unexpected server error occurred during source analysis.' });
    }
  },
```