# Feature: Comparative Myth Analysis (New)

**Parent Plan:** [Deep Research Overview](./deep_research_overview.md)

## 1. Concept

Enable users to use the Sonar API to not only understand a myth in isolation but also to compare it with its variations or thematically similar myths across different cultures or historical periods. This feature is triggered after a primary myth has been initially explored.

## 2. Deep Research Angle

This feature promotes deeper understanding by:
*   **Pattern Recognition:** Helping users identify common narrative structures, themes, and motifs across different myths.
*   **Contextualization:** Showing how myths adapt and change across cultures and time.
*   **Synthesis:** Moving beyond single-myth busting to broader folkloric, cultural, or informational analysis.
*   Highlighting the universality or cultural specificity of certain mythical themes.

## 3. Sonar API Usage

After a primary myth is analyzed (e.g., initial verification or after exploring some lenses):
*   User can click a "Compare This Myth" button.
*   This triggers a server action that makes targeted Sonar API calls.

**Example Prompts:**

1.  **For Myth Variations:**
    `Sonar, "For the myth that '[original myth statement]', identify and describe 2-3 common variations. How do their core claims or narratives differ, and what might be the socio-cultural reasons for these variations?"`
2.  **For Thematically Similar Myths:**
    `Sonar, "Find one or two thematically similar myths to '[original myth statement]' but from distinctly different cultures or historical periods. For each, briefly describe the similar myth and compare/contrast its narrative, underlying message, and typical explanations or functions with the original myth."`

The results from these prompts would be structured and presented to the user.

## 4. Flow

1.  After initial myth exploration (e.g., verdict shown, at least one lens explored), a "Compare This Myth" button/section becomes available.
2.  Clicking this triggers a server action (`?/compareMyth`).
3.  The server action (`compareMyth`) makes one or more Sonar API calls (e.g., one for variations, one for similar myths).
4.  It processes and structures the responses from Sonar.
5.  The server action returns the structured comparison data (e.g., list of variations with descriptions, list of similar myths with comparisons).
6.  The client-side UI updates to display these comparisons, perhaps in separate cards or a dedicated section.

## 5. Key Components

*   `src/routes/app/components/ComparativeAnalysisDisplay.svelte` (or integrated into `+page.svelte`): To display the comparison results.
*   `src/routes/app/+page.svelte`: Manages state for comparative analysis results, loading states, and user interaction to trigger the analysis.
*   `src/routes/app/+page.server.ts`: Contains the new `compareMyth` SvelteKit action.

## 6. Pseudocode Snippets

### `src/routes/app/+page.svelte` (Relevant parts)
```svelte
<script lang="ts">
  // ... other imports and $state ...
  // Assume `currentMythStatement` is available
  // Assume `activeResearchLenses` and `initialVerdict` are defined as in feature_multi_angle_investigation_enhanced.md
  import * as Card from '$lib/components/ui/card'; // Assuming Card is used for display
  import { Button } from '$lib/components/ui/button';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';


  interface MythVariation {
    name: string; // e.g., "The Greek Version"
    description: string;
    differences: string;
  }
  interface SimilarMyth {
    name: string; // e.g., "The Anansi Tale"
    culture: string;
    comparison: string;
  }
  interface ComparativeAnalysisData {
    variations: MythVariation[];
    similarMyths: SimilarMyth[];
    loading: boolean;
    error: string | null;
    analyzed: boolean; // To track if analysis has been run
  }
  let comparativeAnalysis: ComparativeAnalysisData | null = $state(null);

  // Condition to show the "Compare This Myth" button
  // e.g., after initial verification is done and currentMythStatement is populated
  const canShowCompareButton = $derived(!!currentMythStatement && (activeResearchLenses.filter(l => l.result).length > 0 || initialVerdict));


  const handleCompareMythSubmit: SubmitFunction = () => {
    comparativeAnalysis = { variations: [], similarMyths: [], loading: true, error: null, analyzed: false };
    return async ({ result, update }) => {
      await update(); // Ensure form state is updated if needed
      if (result.type === 'success' && result.data) {
        const data = result.data as any; // Cast for simplicity, define proper type
        comparativeAnalysis = { 
          variations: data.variations || [], 
          similarMyths: data.similarMyths || [], 
          loading: false, 
          error: null,
          analyzed: true
        };
      } else if (result.type === 'error' || result.type === 'failure') {
        comparativeAnalysis = { 
          variations: [], 
          similarMyths: [], 
          loading: false, 
          error: (result.data as any)?.error || 'Comparison failed', // Cast for simplicity
          analyzed: true
        };
      }
    };
  };
</script>

<!-- Button to trigger Comparative Analysis -->
{#if canShowCompareButton && (!comparativeAnalysis || !comparativeAnalysis.analyzed)}
  <section class="my-6 p-4 border rounded-lg">
    <h3 class="text-xl font-semibold mb-3">Broaden Your Understanding</h3>
    <form method="POST" action="?/compareMyth" use:enhance={handleCompareMythSubmit}>
      <input type="hidden" name="mythStatement" value={currentMythStatement} />
      <Button type="submit" disabled={comparativeAnalysis?.loading}>
        {#if comparativeAnalysis?.loading}Comparing...{:else}Compare This Myth with Others{/if}
      </Button>
    </form>
  </section>
{/if}

<!-- Display Comparative Analysis Results -->
{#if comparativeAnalysis && comparativeAnalysis.analyzed && !comparativeAnalysis.loading}
  <section class="my-6 p-4 border rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
    <h3 class="text-xl font-semibold mb-4">Comparative Myth Analysis</h3>
    {#if comparativeAnalysis.error}
      <p class="text-destructive">Error in comparison: {comparativeAnalysis.error}</p>
    {:else}
      {#if comparativeAnalysis.variations.length > 0}
        <h4 class="text-lg font-medium mb-2">Variations of "{currentMythStatement}"</h4>
        <div class="space-y-3">
          {#each comparativeAnalysis.variations as variation}
            <Card.Root>
              <Card.Header><Card.Title>{variation.name || 'Variation'}</Card.Title></Card.Header>
              <Card.Content>
                <p><strong>Description:</strong> {variation.description}</p>
                <p><strong>Key Differences:</strong> {variation.differences}</p>
              </Card.Content>
            </Card.Root>
          {/each}
        </div>
      {/if}

      {#if comparativeAnalysis.similarMyths.length > 0}
        <h4 class="text-lg font-medium mt-4 mb-2">Thematically Similar Myths</h4>
        <div class="space-y-3">
          {#each comparativeAnalysis.similarMyths as similar}
            <Card.Root>
              <Card.Header><Card.Title>{similar.name} ({similar.culture})</Card.Title></Card.Header>
              <Card.Content>
                <p>{similar.comparison}</p>
              </Card.Content>
            </Card.Root>
          {/each}
        </div>
      {/if}

      {#if comparativeAnalysis.variations.length === 0 && comparativeAnalysis.similarMyths.length === 0}
        <p class="text-muted-foreground">No distinct variations or thematically similar myths were readily identified by the AI for "{currentMythStatement}".</p>
      {/if}
    {/if}
  </section>
{/if}
```

### `src/routes/app/+page.server.ts` (compareMyth action)
```typescript
// In export const actions: Actions = { ... }
  compareMyth: async ({ request, fetch }) => { // Added fetch for Perplexity API
    const data = await request.formData();
    const mythStatement = data.get('mythStatement') as string;

    if (!mythStatement) {
      return fail(400, { error: 'Myth statement is required for comparison.' });
    }

    const variationsPrompt = `For the myth that "${mythStatement}", identify and describe 2-3 common variations. For each variation, provide a 'name' (e.g., 'The Roman Version'), a 'description', and a summary of 'differences' from the original. If possible, format this as a JSON array of objects within a markdown code block.`;
    
    const similarMythsPrompt = `Find one or two thematically similar myths to "${mythStatement}" but from distinctly different cultures or historical periods. For each, provide a 'name', the 'culture' or period, and a 'comparison' that contrasts its narrative, message, or function with the original myth. If possible, format this as a JSON array of objects within a markdown code block.`;

    let variations = [];
    let similarMyths = [];

    try {
      // Call for Variations
      const variationsResponse = await fetch(process.env.PERPLEXITY_API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY!}` },
        body: JSON.stringify({
          model: 'sonar-large-online',
          messages: [
            { role: 'system', content: "You are an AI assistant specializing in comparative mythology and folklore. Please provide structured JSON output if possible within a markdown code block." },
            { role: 'user', content: variationsPrompt }
          ]
        })
      });
      if (variationsResponse.ok) {
        const result = await variationsResponse.json();
        const content = result.choices[0]?.message?.content || "";
        try {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) variations = JSON.parse(jsonMatch[1]);
            else console.warn("Could not parse JSON for variations, content was: ", content.substring(0, 200));
        } catch (e) { console.error("Error parsing variations JSON:", e, "Content:", content.substring(0,200)); }
      } else {
          console.error("Sonar API error for variations: ", await variationsResponse.text());
      }

      // Call for Similar Myths
      const similarMythsResponse = await fetch(process.env.PERPLEXITY_API_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY!}` },
        body: JSON.stringify({
          model: 'sonar-large-online',
          messages: [
            { role: 'system', content: "You are an AI assistant specializing in comparative mythology and folklore. Please provide structured JSON output if possible within a markdown code block." },
            { role: 'user', content: similarMythsPrompt }
          ]
        })
      });
      if (similarMythsResponse.ok) {
        const result = await similarMythsResponse.json();
        const content = result.choices[0]?.message?.content || "";
        try {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) similarMyths = JSON.parse(jsonMatch[1]);
            else console.warn("Could not parse JSON for similar myths, content was: ", content.substring(0,200));
        } catch (e) { console.error("Error parsing similar myths JSON:", e, "Content:", content.substring(0,200)); }
      } else {
          console.error("Sonar API error for similar myths: ", await similarMythsResponse.text());
      }
      
      return { success: true, variations, similarMyths };

    } catch (e: any) {
      console.error('Error calling Sonar API for myth comparison:', e);
      return fail(500, { error: e.message || 'An unexpected server error occurred during myth comparison.' });
    }
  },
```