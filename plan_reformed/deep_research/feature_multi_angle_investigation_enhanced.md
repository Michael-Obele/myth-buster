# Feature: Enhanced Multi-Angle Investigation

**Parent Plan:** [Deep Research Overview](./deep_research_overview.md)

## 1. Concept

Allow users to trigger Perplexity Sonar API analysis on a given myth from various predefined perspectives (lenses) and to define their own custom lenses. This feature is designed to ensure a comprehensive exploration of the myth, covering its diverse facets.

**Enhancements:**
*   Expanded predefined lenses to include:
    *   **Psychological Underpinnings:** Exploring cognitive biases or psychological factors related to belief in the myth.
    *   **Alternative Explanations/Perspectives:** Investigating credible minority viewpoints or alternative interpretations.
*   Clearer UI for managing and displaying results from multiple lenses.

## 2. Deep Research Angle

This feature simulates a structured, academic research approach by:
*   Encouraging users to look beyond a single explanation.
*   Revealing the complexity and multifaceted nature of myths.
*   Demonstrating how the same topic can be understood differently based on the investigative framework.
*   Providing users agency in directing the research focus through custom lenses.

## 3. Sonar API Usage

For each lens, a specifically crafted prompt is sent to the Sonar API.

**Example Prompts:**

*   **Historical Origins:** `Sonar, "Trace the historical origins and earliest known mentions of the belief that [myth]."`
*   **Scientific Analysis:** `Sonar, "Provide a detailed scientific analysis of the claims made in the myth '[myth]', citing relevant studies and findings."`
*   **Cultural Impact:** `Sonar, "Describe the cultural impact, societal influence, or common portrayals of the myth '[myth]'."`
*   **Psychological Underpinnings:** `Sonar, "What psychological factors, cognitive biases, or common human experiences might explain why people believe in or propagate the myth '[myth]'?"`
*   **Alternative Explanations:** `Sonar, "Explore alternative explanations, credible minority viewpoints, or counter-narratives regarding the phenomenon or claims described in '[myth]'."`
*   **Custom Lens:** `Sonar, "Investigate the myth '[myth]' focusing on the following user-defined aspect: '[custom user query]'."`

## 4. UI Choice Justification (Tabs/Cards)

Using components like shadcn-svelte `Tabs` or `Card` is preferred:
*   **Clarity:** Clearly associates the lens (selection) with its research result.
*   **Content Handling:** Research results can be detailed and are well-contained.
*   **Visual States:** Built-in cues for active, inactive, and loading states.

## 5. Flow

1.  Initial myth verification result is shown.
2.  An "Explore Deeper" section appears, featuring tabs/cards for predefined lenses and a "Custom Lens" option.
3.  Clicking a lens or submitting a custom query triggers a server action (`?/researchLens`).
4.  The server action constructs the Sonar prompt based on the lens.
5.  Sonar returns the result for that angle.
6.  The client-side `$state` is updated, and the UI displays the result within the corresponding lens section.
7.  Users can explore multiple lenses, with results stored and accessible.

## 6. Key Components

*   `src/routes/app/components/ResearchLenses.svelte` (or integrated into `+page.svelte`): Handles the tab/card UI for lenses.
*   `src/routes/app/+page.svelte`: Integrates `ResearchLenses`, manages overall app state for active lenses and their results.
*   `src/routes/app/+page.server.ts`: Contains the `researchLens` SvelteKit action.

## 7. Pseudocode Snippets

### `src/routes/app/+page.svelte` (Relevant parts)

```svelte
<script lang="ts">
  import { $state, $derived } from 'svelte';
  import * as Tabs from '$lib/components/ui/tabs';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  let currentMythStatement: string = $state(''); 
  let initialVerdict: string = $state(''); // Example state, might be part of a larger result object

  interface LensResult {
    id: string;
    name: string;
    isCustom: boolean;
    querySent: string; 
    result: string;
    loading: boolean;
    error: string | null;
  }

  let activeResearchLenses: LensResult[] = $state([]);
  let activeLensTabId: string = $state(''); 
  let customLensInput: string = $state('');
  let showCustomLensInput: boolean = $state(false);

  const predefinedLenses = $state([
    { id: 'historical', name: 'Historical Origins' },
    { id: 'scientific', name: 'Scientific Analysis' },
    { id: 'cultural', name: 'Cultural Impact' },
    { id: 'psychological', name: 'Psychological Factors' },
    { id: 'alternative', name: 'Alternative Perspectives' },
  ]);

  const allDisplayableLenses = $derived([...predefinedLenses, ...activeResearchLenses.filter(lens => lens.isCustom)]);

  const handleResearchLensSubmit: SubmitFunction = ({ form, formData }) => {
    const lensType = formData.get('lensType') as string;
    const lensName = formData.get('lensName') as string; 
    const customQueryDetail = formData.get('customQuery') as string | undefined; 

    const lensId = lensType === 'custom' ? `custom-${Date.now()}` : lensType;
    const actualQuery = lensType === 'custom' ? customQueryDetail || lensName : `Investigate ${lensName} of ${currentMythStatement}`; 

    const existingLensIndex = activeResearchLenses.findIndex(lens => lens.id === lensId);
    if (existingLensIndex === -1) {
      activeResearchLenses = [...activeResearchLenses, { id: lensId, name: lensName, isCustom: lensType === 'custom', querySent: actualQuery, result: '', loading: true, error: null }];
    } else {
      activeResearchLenses[existingLensIndex] = { ...activeResearchLenses[existingLensIndex], loading: true, error: null, querySent: actualQuery };
      activeResearchLenses = [...activeResearchLenses]; 
    }
    activeLensTabId = lensId; 

    return async ({ result, update }) => {
      await update({ reset: false }); // Prevent form reset by default, manage manually
      if (result.type === 'success' && result.data) {
        const { lensId: resultLensId, researchResult } = result.data as { lensId: string, researchResult: string };
        activeResearchLenses = activeResearchLenses.map(lens =>
          lens.id === resultLensId ? { ...lens, result: researchResult, loading: false } : lens
        );
      } else if (result.type === 'error' || result.type === 'failure') {
        const errorData = result.data as { lensId?: string, error: string } | undefined;
        const targetLensId = errorData?.lensId || lensId; 
        activeResearchLenses = activeResearchLenses.map(lens =>
          lens.id === targetLensId ? { ...lens, error: errorData?.error || 'An unknown error occurred.', loading: false } : lens
        );
      }
    };
  };

  function addCustomLens() {
    if (customLensInput.trim() && currentMythStatement) {
      // Create a temporary form to submit with use:enhance
      const tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = '?/researchLens';

      const fields = {
        mythStatement: currentMythStatement,
        lensType: 'custom',
        lensName: customLensInput.trim(), // User's name for their lens
        customQuery: customLensInput.trim() // The actual query content
      };

      for (const key in fields) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = fields[key as keyof typeof fields];
        tempForm.appendChild(input);
      }
      
      // This form needs to be in the DOM to be picked up by `enhance` if `enhance` is applied globally
      // or we'd need a more specific way to trigger the submission with `enhance` logic.
      // For simplicity, assuming a conceptual global form enhancement or specific handling.
      // A more robust way is to have a visible form and use its submit() method.
      // Or, use `applyAction` from `$app/forms` if suitable.
      
      // Simulate submission for pseudocode - in reality, you'd trigger the form associated with `use:enhance`
      // For this example, we'll directly manipulate state as if the submission callback handled it.
      const lensId = `custom-${Date.now()}`;
      activeResearchLenses = [...activeResearchLenses, { id: lensId, name: customLensInput.trim(), isCustom: true, querySent: customLensInput.trim(), result: '', loading: true, error: null }];
      activeLensTabId = lensId;
      
      // Manually create FormData and call the submit function if not using a real form submission
      const formData = new FormData();
      formData.append('mythStatement', currentMythStatement);
      formData.append('lensType', 'custom');
      formData.append('lensName', customLensInput.trim());
      formData.append('customQuery', customLensInput.trim());
      
      // To truly use `enhance`, the form needs to be submitted.
      // This programmatic `addCustomLens` would ideally trigger a hidden form's submission.
      // Or, the "Analyze Custom Angle" button itself would be part of a form.

      customLensInput = '';
      showCustomLensInput = false;
       // The actual API call would be triggered by the form submission handled by `handleResearchLensSubmit`
    }
  }
</script>

<!-- UI for Tabs -->
<Tabs.Root bind:value={activeLensTabId} class="w-full">
  <Tabs.List>
    {#each allDisplayableLenses as lens (lens.id)}
      <Tabs.Trigger value={lens.id}>{lens.name}</Tabs.Trigger>
    {/each}
    <Button variant="outline" on:click={() => showCustomLensInput = !showCustomLensInput} class="ml-auto">
      {showCustomLensInput ? 'Cancel Custom' : '+ Custom Lens'}
    </Button>
  </Tabs.List>

  {#if showCustomLensInput}
    <form method="POST" action="?/researchLens" use:enhance={handleResearchLensSubmit} class="mt-4 flex gap-2 p-4 border rounded-md">
        <input type="hidden" name="mythStatement" value={currentMythStatement} />
        <input type="hidden" name="lensType" value="custom" />
        <Input name="lensName" bind:value={customLensInput} placeholder="Enter custom research angle (e.g., 'Economic impact')" class="grow" />
        <input type="hidden" name="customQuery" value={customLensInput} /> {/* Or make lensName the query if simpler */}
        <Button type="submit">Analyze Custom Angle</Button>
    </form>
  {/if}

  {#each allDisplayableLenses as lens (lens.id)}
    <Tabs.Content value={lens.id}>
      <div class="mt-4 p-4 border rounded-md min-h-[200px]">
        {#if !lens.result && !lens.loading && !lens.error && !lens.isCustom}
          <form method="POST" action="?/researchLens" use:enhance={handleResearchLensSubmit}>
            <input type="hidden" name="mythStatement" value={currentMythStatement} />
            <input type="hidden" name="lensType" value={lens.id} />
            <input type="hidden" name="lensName" value={lens.name} />
            <Button type="submit">Analyze with {lens.name} Lens</Button>
          </form>
        {:else if lens.loading}
          <p>Loading research for "{lens.name}"...</p> 
        {:else if lens.error}
          <p class="text-destructive">Error loading "{lens.name}": {lens.error}</p>
           <form method="POST" action="?/researchLens" use:enhance={handleResearchLensSubmit}>
            <input type="hidden" name="mythStatement" value={currentMythStatement} />
            <input type="hidden" name="lensType" value={lens.id} />
            <input type="hidden" name="lensName" value={lens.name} />
            {#if lens.isCustom}
              <input type="hidden" name="customQuery" value={lens.querySent} /> 
            {/if}
            <Button type="submit" variant="outline">Retry Analysis</Button>
          </form>
        {:else if lens.result}
          <h3 class="text-xl font-semibold mb-2">{lens.name}</h3>
          <article class="prose dark:prose-invert max-w-none whitespace-pre-wrap">{lens.result}</article>
        {:else if lens.isCustom && !lens.result && !lens.loading && !lens.error}
            <p class="text-muted-foreground">Custom lens "{lens.name}" created. Submit the form above to analyze.</p>
        {/if}
      </div>
    </Tabs.Content>
  {/each}
</Tabs.Root>
```

### `src/routes/app/+page.server.ts` (researchLens action)
```typescript
import type { Actions } from './$types'; // Assuming PageServerLoad is not needed for actions only
import { fail } from '@sveltejs/kit'; // Import fail
// Assume PERPLEXITY_API_URL and PERPLEXITY_API_KEY are imported from $env/static/private
import { PERPLEXITY_API_KEY, PERPLEXITY_API_URL } from '$env/static/private';

export const actions: Actions = {
  // ... other actions like initial myth verification ...

  researchLens: async ({ request, fetch }) => { // Added fetch
    const data = await request.formData();
    const mythStatement = data.get('mythStatement') as string;
    const lensType = data.get('lensType') as string; 
    const lensName = data.get('lensName') as string; 
    const customQuery = data.get('customQuery') as string | undefined; 

    // Use a more specific ID for custom lenses if they are added dynamically before submission
    const resultLensId = lensType === 'custom' ? (data.get('lensId_custom') as string || `custom-${Date.now()}`) : lensType;

    if (!mythStatement || !lensType || !lensName) {
      return fail(400, { 
        lensId: resultLensId, 
        error: 'Missing required data (myth, lens type, or lens name) for research lens.' 
      });
    }

    let systemPrompt = 'You are an AI research assistant. Provide a concise, well-structured summary based on the user\'s query.';
    let userPrompt = '';

    switch (lensType) {
      case 'historical':
        userPrompt = `Trace the historical origins and earliest known mentions of the belief that "${mythStatement}".`;
        break;
      case 'scientific':
        systemPrompt = 'You are an AI research assistant focused on scientific consensus and evidence. Cite relevant studies if possible.';
        userPrompt = `Provide a detailed scientific analysis of the claims made in the myth "${mythStatement}".`;
        break;
      case 'cultural':
        systemPrompt = 'You are an AI research assistant focused on cultural and societal aspects of beliefs.';
        userPrompt = `Describe the cultural impact, societal influence, or common portrayals of the myth "${mythStatement}".`;
        break;
      case 'psychological':
        systemPrompt = 'You are an AI research assistant specializing in psychology and cognitive biases.';
        userPrompt = `What psychological factors, cognitive biases, or common human experiences might explain why people believe in or propagate the myth "${mythStatement}"?`;
        break;
      case 'alternative':
        systemPrompt = 'You are an AI research assistant skilled in identifying diverse perspectives.';
        userPrompt = `Explore alternative explanations, credible minority viewpoints, or counter-narratives regarding the phenomenon or claims described in the myth "${mythStatement}".`;
        break;
      case 'custom':
        const queryForCustom = customQuery || lensName; // Fallback to lensName if customQuery field isn't distinct
        if (!queryForCustom) {
          return fail(400, { lensId: resultLensId, error: 'Custom query content is required for a custom lens.' });
        }
        systemPrompt = 'You are an AI research assistant tasked with investigating a specific, user-defined aspect of a myth.';
        userPrompt = `Investigate the myth "${mythStatement}" focusing on the following user-defined aspect: "${queryForCustom}".`;
        break;
      default:
        return fail(400, { lensId: lensType, error: `Unknown lens type: ${lensType}` });
    }

    try {
      const response = await fetch(PERPLEXITY_API_URL!, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY!}`
        },
        body: JSON.stringify({
          model: 'sonar-medium-online', 
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Sonar API Error (${response.status}): ${errorBody}`);
        return fail(response.status, { lensId: resultLensId, error: `API Error: ${response.statusText || 'Failed to fetch from Sonar'}. Details: ${errorBody.substring(0,200)}` });
      }

      const result = await response.json();
      const researchResult = result.choices[0]?.message?.content?.trim() || 'Could not retrieve a valid research result.';
      
      return { success: true, lensId: resultLensId, researchResult, lensName };

    } catch (e: any) {
      console.error('Error calling Sonar API for research lens:', e);
      return fail(500, { lensId: resultLensId, error: e.message || 'An unexpected server error occurred.' });
    }
  },
};
```