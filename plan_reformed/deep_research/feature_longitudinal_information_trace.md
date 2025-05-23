# Feature: Longitudinal Information Trace (New)

**Parent Plan:** [Deep Research Overview](./deep_research_overview.md)

## 1. Concept

Allow users to track how a myth, or the information landscape surrounding its core subject, has evolved over time. This feature highlights key shifts in understanding, belief, or public discourse related to the myth.

## 2. Deep Research Angle

This feature demonstrates "deep research" by:
*   **Emphasizing Dynamism:** Showing that information and beliefs are not static but evolve.
*   **Historical Contextualization:** Placing the myth within a broader historical narrative of knowledge and belief.
*   **Critical Thinking:** Encouraging users to consider how "truth" or common understanding can change and why.
*   Illustrating the impact of key discoveries, publications, or societal events on the perception of the myth.

## 3. Sonar API Usage

After a myth is identified, the user can trigger this trace.

**Example Prompt:**

`Sonar, "Trace the public and scientific understanding of [core subject of the myth, e.g., 'the causes of spontaneous human combustion' or 'the belief in a flat Earth'] from [an appropriate start period, e.g., 'the 17th century' or 'ancient times'] to the present. Highlight key publications, scientific discoveries, influential figures, or significant societal events that notably shifted perspectives or debunked/reinforced aspects related to the myth '[original myth statement]'. Present this as a chronological list of key points or a narrative of evolution."`

The API might be asked to provide a timeline or a list of key milestones.

## 4. Flow

1.  After initial myth exploration, a "Trace History of this Topic" button/section becomes available.
2.  Clicking triggers a server action (`?/traceInformationEvolution`).
3.  The server action constructs a Sonar prompt based on the myth's core subject.
4.  Sonar API returns a chronological or narrative trace.
5.  The server action processes this (potentially structuring it if Sonar provides markers).
6.  The client-side UI updates to display the trace, possibly as a list of events/insights or a simple textual timeline.

## 5. Key Components

*   `src/routes/app/components/InformationTraceDisplay.svelte` (or integrated into `+page.svelte`): To display the trace.
*   `src/routes/app/+page.svelte`: Manages state for the trace results, loading, and user interaction.
*   `src/routes/app/+page.server.ts`: Contains the new `traceInformationEvolution` SvelteKit action.

## 6. Pseudocode Snippets

### `src/routes/app/+page.svelte` (Relevant parts)
```svelte
<script lang="ts">
  import { $state, $derived } from 'svelte';
  // Assume currentMythStatement, initialVerdict, activeResearchLenses are defined as in previous examples
  import { Button } from '$lib/components/ui/button';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  interface LongitudinalTraceData {
    trace: string | null; 
    loading: boolean;
    error: string | null;
    analyzed: boolean;
  }
  let longitudinalTrace: LongitudinalTraceData | null = $state(null);
  
  let coreSubjectForTrace = $derived(currentMythStatement ? currentMythStatement.substring(0, 50) + "..." : "the topic"); 

  const canShowTraceButton = $derived(!!currentMythStatement && (activeResearchLenses.filter(l => l.result).length > 0 || initialVerdict));

  const handleTraceEvolutionSubmit: SubmitFunction = () => {
    longitudinalTrace = { trace: null, loading: true, error: null, analyzed: false };
    return async ({ result, update }) => {
      await update();
      if (result.type === 'success' && result.data) {
        longitudinalTrace = { trace: (result.data as any).traceResult, loading: false, error: null, analyzed: true };
      } else if (result.type === 'error' || result.type === 'failure') {
        longitudinalTrace = { trace: null, loading: false, error: (result.data as any)?.error || 'Trace failed', analyzed: true };
      }
    };
  };
</script>

<!-- Button to trigger Longitudinal Trace -->
{#if canShowTraceButton && (!longitudinalTrace || !longitudinalTrace.analyzed)}
  <section class="my-6 p-4 border rounded-lg">
    <h3 class="text-xl font-semibold mb-3">Trace its History</h3>
    <form method="POST" action="?/traceInformationEvolution" use:enhance={handleTraceEvolutionSubmit}>
      <input type="hidden" name="mythStatement" value={currentMythStatement} />
      <input type="hidden" name="coreSubject" value={coreSubjectForTrace} /> 
      <Button type="submit" disabled={longitudinalTrace?.loading}>
        {#if longitudinalTrace?.loading}Tracing History...{:else}Trace Evolution of Understanding{/if}
      </Button>
    </form>
  </section>
{/if}

<!-- Display Longitudinal Trace Results -->
{#if longitudinalTrace && longitudinalTrace.analyzed && !longitudinalTrace.loading}
  <section class="my-6 p-4 border rounded-lg bg-teal-50 dark:bg-teal-900/30">
    <h3 class="text-xl font-semibold mb-4">Evolution of Understanding: {coreSubjectForTrace}</h3>
    {#if longitudinalTrace.error}
      <p class="text-destructive">Error in tracing history: {longitudinalTrace.error}</p>
    {:else if longitudinalTrace.trace}
      <article class="prose dark:prose-invert max-w-none whitespace-pre-wrap">{longitudinalTrace.trace}</article>
    {:else}
      <p class="text-muted-foreground">No historical trace information was readily identified by the AI.</p>
    {/if}
  </section>
{/if}
```

### `src/routes/app/+page.server.ts` (traceInformationEvolution action)
```typescript
import { fail } from '@sveltejs/kit'; // Ensure fail is imported
// In export const actions: Actions = { ... }
  traceInformationEvolution: async ({ request, fetch }) => { // Added fetch
    const data = await request.formData();
    const mythStatement = data.get('mythStatement') as string;
    const coreSubject = data.get('coreSubject') as string; 

    if (!mythStatement || !coreSubject) {
      return fail(400, { error: 'Myth statement and core subject are required for tracing evolution.' });
    }

    const systemPrompt = "You are an AI historian of ideas and public understanding. Trace the evolution of understanding for the given topic chronologically, highlighting key shifts, figures, and events. Present as a narrative or a list of key milestones.";
    const userPrompt = `Trace the public and scientific understanding of the core subject: "${coreSubject}" (related to the myth "${mythStatement}") from an appropriate historical start point (e.g., earliest significant discussions or a few centuries ago if applicable) to the present. Highlight key publications, scientific discoveries, influential figures, or significant societal events that notably shifted perspectives.`;

    try {
      const response = await fetch(process.env.PERPLEXITY_API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY!}` },
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
        console.error(`Sonar API Error for traceEvolution (${response.status}): ${errorBody}`);
        return fail(response.status, { error: `API Error: ${response.statusText}. ${errorBody.substring(0,200)}` });
      }

      const result = await response.json();
      const traceResult = result.choices[0]?.message?.content?.trim() || 'Could not retrieve historical trace information.';
      
      return { success: true, traceResult };

    } catch (e: any) {
      console.error('Error calling Sonar API for information trace:', e);
      return fail(500, { error: e.message || 'An unexpected server error occurred during information trace.' });
    }
  },
```