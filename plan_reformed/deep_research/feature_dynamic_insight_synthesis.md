# Feature: Dynamic Insight Synthesis

**Parent Plan:** [Deep Research Overview](./deep_research_overview.md)

## 1. Concept

Synthesize the information gathered from *all* explored research facets: Multi-Angle Investigation (lenses), Advanced Evidence Deconstruction (key findings from source analyses), Comparative Myth Analysis, and Longitudinal Information Trace. This feature aims to identify overarching themes, contradictions, connections, and provide a holistic summary insight.

## 2. Deep Research Angle

This is the capstone deep research feature, demonstrating:
*   **Higher-Order Thinking:** Moving from information gathering and analysis to true synthesis.
*   **Holistic Understanding:** Helping users see the "big picture" that emerges from diverse inquiries.
*   **Knowledge Creation:** Transforming scattered data points into structured insights.
*   **Sophisticated API Use:** Crafting a complex prompt that asks Sonar to perform a high-level cognitive task based on multiple inputs, ideally requesting a structured JSON output.

## 3. Sonar API Usage

After the user has engaged with at least two different research activities (e.g., explored two lenses, or one lens and one source analysis, or a comparison):
*   A "Synthesize All Insights" button becomes active.
*   This triggers a server action that compiles all relevant gathered data.
*   A comprehensive prompt is sent to Sonar API.

**Example Prompt (Conceptual):**

`Sonar, you are an AI research synthesizer. Based on the following multifaceted research conducted on the myth "[original myth statement]", please synthesize the findings.
The research includes:

1.  **Multi-Angle Lens Analyses:**
    *   Historical Lens: "[Summary of historical lens findings]"
    *   Scientific Lens: "[Summary of scientific lens findings]"
    *   (other lenses as explored...)

2.  **Key Evidence Deconstruction Insights:**
    *   Analysis of Source X (related to [myth aspect]): "[Key finding from Source X analysis]"
    *   (other key source analyses summaries...)

3.  **Comparative Myth Analysis Insights (if available):**
    *   Variations: "[Summary of key variations and their significance]"
    *   Similar Myths: "[Summary of insights from comparing with similar myths]"

4.  **Longitudinal Information Trace (if available):**
    *   Key Evolutionary Points: "[Summary of how understanding of the myth's topic evolved]"

Synthesize these diverse inputs into a structured JSON output with the following keys:
*   \`overallInsight\` (string): A concise, overarching insight or summary statement about the myth based on all research.
*   \`keyThemes\` (array of objects, each with \`title: string\` and \`description: string\`): 3-5 dominant themes that emerge across the different analyses.
*   \`pointsOfContention\` (array of objects, each with \`description: string\`): Key contradictions, discrepancies, or areas of debate found.
*   \`unexpectedConnections\` (array of objects, each with \`description: string\`): Surprising links or relationships identified between different pieces of information.
*   \`unansweredQuestions\` (array of objects, each with \`question: string\`): New questions or areas for further research highlighted by the synthesis.

Ensure the JSON is well-formed and directly usable.`

## 4. Flow

1.  Button "Synthesize All Insights" appears/activates once sufficient research activities are completed (e.g., results from at least two lenses, or a lens and a source analysis, etc.).
2.  Clicking triggers `?/synthesizeInsights` server action.
3.  Server action collects all relevant data:
    *   Summaries/results from all explored `activeResearchLenses`.
    *   Key findings from `currentSourceAnalysisResult` (if any, might need to store a list of these).
    *   Results from `comparativeAnalysis`.
    *   Results from `longitudinalTrace`.
4.  Constructs the comprehensive Sonar API prompt.
5.  Sonar API processes and (ideally) returns structured JSON.
6.  Server action parses this JSON (or the text if JSON fails) and returns it.
7.  Client-side UI updates to display the synthesized themes, connections, overall insight, etc., using shadcn-svelte `Card` or similar.

## 5. Key Components

*   `src/routes/app/components/InsightSynthesisDisplay.svelte` (or integrated into `+page.svelte`): Handles the display of synthesized information.
*   `src/routes/app/+page.svelte`: Manages synthesis state, collects data from other features, and triggers the action.
*   `src/routes/app/+page.server.ts`: Contains the `synthesizeInsights` action with complex prompt engineering and JSON parsing.

## 6. Pseudocode Snippets

### `src/routes/app/+page.svelte` (Relevant parts)
```svelte
<script lang="ts">
  // ... all previous $state variables for lenses, source analysis, comparison, trace ...
  // Ensure currentMythStatement, activeResearchLenses, currentSourceAnalysisResult, 
  // comparativeAnalysis, longitudinalTrace are defined as in their respective feature files.
  import * as Card from '$lib/components/ui/card'; 
  import { Button } from '$lib/components/ui/button';
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  interface SynthesisOutput {
    overallInsight: string | null;
    keyThemes: Array<{ title: string; description: string }>;
    pointsOfContention: Array<{ description: string }>;
    unexpectedConnections: Array<{ description: string }>;
    unansweredQuestions?: Array<{ question: string }>; // Optional
  }
  interface SynthesisResultState {
    data: SynthesisOutput | null;
    loading: boolean;
    error: string | null;
    synthesized: boolean;
  }
  let insightSynthesisResult: SynthesisResultState | null = $state(null);

  const completedLensAnalyses = $derived(activeResearchLenses.filter(lens => lens.result && !lens.error));

  const canSynthesize = $derived(
    (completedLensAnalyses.length >= 1 || 
     (currentSourceAnalysisResult && currentSourceAnalysisResult.analysis) || 
     (comparativeAnalysis && comparativeAnalysis.analyzed && !comparativeAnalysis.error) ||
     (longitudinalTrace && longitudinalTrace.analyzed && !longitudinalTrace.error)
    ) && 
    completedLensAnalyses.length + 
    (currentSourceAnalysisResult?.analysis ? 1:0) + 
    (comparativeAnalysis?.analyzed && !comparativeAnalysis.error ? 1:0) + 
    (longitudinalTrace?.analyzed && !longitudinalTrace.error ? 1:0) >= 2 
  );


  const handleSynthesizeInsightsSubmit: SubmitFunction = ({formData}) => {
    insightSynthesisResult = { data: null, loading: true, error: null, synthesized: false };
    
    const lensDataForSynthesis = completedLensAnalyses.map(l => ({ name: l.name, result: l.result.substring(0, 1000) })); 
    formData.set('lensResults', JSON.stringify(lensDataForSynthesis));
    
    if (currentSourceAnalysisResult?.analysis) {
      formData.set('sourceAnalysisSummary', JSON.stringify({ summary: currentSourceAnalysisResult.analysis.substring(0,1000) }));
    }
    if (comparativeAnalysis?.analyzed && !comparativeAnalysis.error) {
      formData.set('comparativeAnalysisSummary', JSON.stringify({
          variations: comparativeAnalysis.variations.map(v => v.description.substring(0,500)),
          similarMyths: comparativeAnalysis.similarMyths.map(s => s.comparison.substring(0,500))
      }));
    }
    if (longitudinalTrace?.analyzed && !longitudinalTrace.error && longitudinalTrace.trace) {
      formData.set('longitudinalTraceSummary', JSON.stringify({ trace: longitudinalTrace.trace.substring(0,1000) }));
    }

    return async ({ result, update }) => {
      await update();
      if (result.type === 'success' && result.data) {
        insightSynthesisResult = { data: result.data as SynthesisOutput, loading: false, error: null, synthesized: true };
      } else if (result.type === 'error' || result.type === 'failure') {
        insightSynthesisResult = { data: null, loading: false, error: (result.data as any)?.error || 'Synthesis failed', synthesized: true };
      }
    };
  };
</script>

<!-- Button to trigger Synthesis -->
{#if canSynthesize && (!insightSynthesisResult || !insightSynthesisResult.synthesized)}
  <section class="my-8 p-6 border rounded-lg bg-green-50 dark:bg-green-900/30">
    <h2 class="text-2xl font-bold mb-4">Synthesize All Research Insights</h2>
    <p class="text-muted-foreground mb-6">Combine all findings to uncover overarching themes, connections, and a holistic understanding.</p>
    <form method="POST" action="?/synthesizeInsights" use:enhance={handleSynthesizeInsightsSubmit}>
      <input type="hidden" name="mythStatement" value={currentMythStatement} />
      <Button type="submit" size="lg" disabled={insightSynthesisResult?.loading}>
        {#if insightSynthesisResult?.loading}Synthesizing...{:else}Generate Synthesis{/if}
      </Button>
    </form>
  </section>
{/if}

<!-- Display Synthesis Results -->
{#if insightSynthesisResult && insightSynthesisResult.synthesized && !insightSynthesisResult.loading}
  <section class="my-8 p-6 border rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Synthesized Research Report</h2>
    {#if insightSynthesisResult.error}
      <p class="text-destructive">Error in synthesis: {insightSynthesisResult.error}</p>
    {:else if insightSynthesisResult.data}
      {#if insightSynthesisResult.data.overallInsight}
        <Card.Root class="mb-6">
          <Card.Header><Card.Title>Overall Insight</Card.Title></Card.Header>
          <Card.Content><p class="text-lg">{insightSynthesisResult.data.overallInsight}</p></Card.Content>
        </Card.Root>
      {/if}

      {#if insightSynthesisResult.data.keyThemes?.length > 0}
        <h3 class="text-xl font-semibold mt-6 mb-3">Key Themes</h3>
        <div class="grid md:grid-cols-2 gap-4">
          {#each insightSynthesisResult.data.keyThemes as theme}
            <Card.Root>
              <Card.Header><Card.Title>{theme.title}</Card.Title></Card.Header>
              <Card.Content><p>{theme.description}</p></Card.Content>
            </Card.Root>
          {/each}
        </div>
      {/if}

      {#if insightSynthesisResult.data.pointsOfContention?.length > 0}
        <h3 class="text-xl font-semibold mt-6 mb-3">Points of Contention / Contradictions</h3>
        <ul class="list-disc pl-5 space-y-2">
          {#each insightSynthesisResult.data.pointsOfContention as point}
            <li>{point.description}</li>
          {/each}
        </ul>
      {/if}

      {#if insightSynthesisResult.data.unexpectedConnections?.length > 0}
        <h3 class="text-xl font-semibold mt-6 mb-3">Unexpected Connections</h3>
         <ul class="list-disc pl-5 space-y-2">
          {#each insightSynthesisResult.data.unexpectedConnections as connection}
            <li>{connection.description}</li>
          {/each}
        </ul>
      {/if}
       {#if insightSynthesisResult.data.unansweredQuestions?.length > 0}
        <h3 class="text-xl font-semibold mt-6 mb-3">Further Questions Raised</h3>
         <ul class="list-disc pl-5 space-y-2">
          {#each insightSynthesisResult.data.unansweredQuestions as item}
            <li>{item.question}</li>
          {/each}
        </ul>
      {/if}
    {:else}
      <p class="text-muted-foreground">Synthesis did not produce data.</p>
    {/if}
  </section>
{/if}
```

### `src/routes/app/+page.server.ts` (synthesizeInsights action)
```typescript
import { fail } from '@sveltejs/kit'; // Ensure fail is imported
// In export const actions: Actions = { ... }
  synthesizeInsights: async ({ request, fetch }) => { // Added fetch
    const data = await request.formData();
    const mythStatement = data.get('mythStatement') as string;
    
    if (!mythStatement) {
      return fail(400, { error: 'Myth statement is required for synthesis.' });
    }

    let researchInputs = `Research on the myth: "${mythStatement}"\n\n`;

    const lensResultsJson = data.get('lensResults') as string | undefined;
    if (lensResultsJson) {
      try {
        const lensResults = JSON.parse(lensResultsJson);
        if (Array.isArray(lensResults) && lensResults.length > 0) {
          researchInputs += "Multi-Angle Lens Analyses:\n";
          lensResults.forEach((lens: any) => { // Define 'any' or a proper type
            researchInputs += `- ${lens.name}: ${lens.result}\n`;
          });
          researchInputs += "\n";
        }
      } catch (e) { console.warn("Could not parse lensResults for synthesis"); }
    }

    const sourceAnalysisJson = data.get('sourceAnalysisSummary') as string | undefined;
     if (sourceAnalysisJson) {
      try {
        const sourceData = JSON.parse(sourceAnalysisJson);
        researchInputs += `Key Evidence Deconstruction Insight: ${sourceData.summary}\n\n`;
      } catch (e) { console.warn("Could not parse sourceAnalysisSummary for synthesis"); }
    }

    const comparativeAnalysisJson = data.get('comparativeAnalysisSummary') as string | undefined;
    if (comparativeAnalysisJson) {
      try {
        const compData = JSON.parse(comparativeAnalysisJson);
        researchInputs += "Comparative Myth Analysis Insights:\n";
        if(compData.variations && Array.isArray(compData.variations)) researchInputs += `- Variations Summary: ${compData.variations.join(', ')}\n`;
        if(compData.similarMyths && Array.isArray(compData.similarMyths)) researchInputs += `- Similar Myths Summary: ${compData.similarMyths.join(', ')}\n`;
        researchInputs += "\n";
      } catch (e) { console.warn("Could not parse comparativeAnalysisSummary for synthesis"); }
    }
    
    const longitudinalTraceJson = data.get('longitudinalTraceSummary') as string | undefined;
    if (longitudinalTraceJson) {
      try {
        const traceData = JSON.parse(longitudinalTraceJson);
        researchInputs += `Longitudinal Information Trace Summary: ${traceData.trace}\n\n`;
      } catch (e) { console.warn("Could not parse longitudinalTraceSummary for synthesis"); }
    }

    const systemPrompt = `You are an AI research synthesizer. Your task is to analyze a collection of research findings about a specific myth and produce a structured synthesis. The output MUST be a single well-formed JSON object. Do not include any text outside of this JSON object, including no markdown code block specifiers.`;
    const userPrompt = `Based on the following multifaceted research inputs:

${researchInputs}

Synthesize these diverse inputs into a single JSON object with the following exact keys and structure:
{
  "overallInsight": "A concise, overarching insight or summary statement about the myth based on all research.",
  "keyThemes": [ { "title": "Theme Title 1", "description": "Description of theme 1." }, { "title": "Theme Title 2", "description": "Description of theme 2." } ],
  "pointsOfContention": [ { "description": "Description of a key contradiction or discrepancy." } ],
  "unexpectedConnections": [ { "description": "Description of a surprising link or relationship identified." } ],
  "unansweredQuestions": [ { "question": "A new question or area for further research highlighted by the synthesis." } ]
}

Ensure all string values are populated appropriately based on the research. If a category (e.g., unexpectedConnections) has no relevant findings, provide an empty array for its value. The overallInsight should be a non-empty string.`;

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
          // response_format: { type: "json_object" } // This would be ideal if supported and reliable
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Sonar API Error for synthesis (${response.status}): ${errorBody}`);
        return fail(response.status, { error: `API Error: ${response.statusText}. ${errorBody.substring(0,500)}` });
      }

      const resultText = await response.text(); 
      let synthesisData: any;

      try {
        synthesisData = JSON.parse(resultText);
      } catch (parseError) {
        console.warn("Failed to parse synthesis JSON directly, trying to extract from markdown:", parseError, "Content:", resultText.substring(0,500));
        const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            synthesisData = JSON.parse(jsonMatch[1]);
          } catch (innerParseError) {
            console.error('Failed to parse extracted synthesis JSON:', innerParseError, "Extracted:", jsonMatch[1].substring(0,500));
            return fail(500, { error: 'Failed to parse synthesis JSON from API response. Content: ' + resultText.substring(0,500) });
          }
        } else {
          console.error('Synthesis response was not valid JSON and not in markdown code block. Content: ' + resultText.substring(0,500));
          return fail(500, { error: 'API returned non-JSON response for synthesis. Content: ' + resultText.substring(0,500) });
        }
      }
      
      if (!synthesisData.overallInsight || !Array.isArray(synthesisData.keyThemes)) {
          console.error('Parsed JSON does not match expected synthesis structure:', synthesisData);
          return fail(500, { error: 'API returned JSON in an unexpected structure for synthesis.' });
      }

      return { success: true, ...synthesisData };

    } catch (e: any) {
      console.error('Error calling Sonar API for synthesis:', e);
      return fail(500, { error: e.message || 'An unexpected server error occurred during synthesis.' });
    }
  },
```