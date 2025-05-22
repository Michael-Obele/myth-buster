# Myth Buster - Learning Track Page Flow (`/game/tracks/[trackId]`)

This document details the data flow and component interaction for playing a specific learning track in the Myth Buster application.

## Overview

When a user selects a learning track, they are navigated to the `/game/tracks/[trackId]` page. This page is responsible for:
1.  Loading initial track metadata.
2.  Sequentially fetching and displaying myths related to that track.
3.  Allowing the user to answer each myth and see results.
4.  Tracking progress through the track.

## I. Initial Page Load & Track Metadata

**File:** `myth-buster/src/routes/game/tracks/[trackId]/+page.server.ts`

1.  **SvelteKit `load` Function:**
    *   When the user navigates to `/game/tracks/[trackId]?title=...&category=...`, SvelteKit's server-side `load` function in `+page.server.ts` is executed.
    *   It extracts `trackId` from `params` and other track metadata (like `title`, `category`, `difficulty`, `totalMyths`, `icon`) from `url.searchParams`.
    *   It validates these parameters.
    *   It returns an object containing this metadata. This object becomes the `data` prop (referred to as `pageLoadData` in the Svelte component) for `+page.svelte`.

    ```typescript
    // myth-buster/src/routes/game/tracks/[trackId]/+page.server.ts (snippet from load function)
    export const load: PageServerLoad = async ({ params, url }) => {
        console.log('[TRACK LOAD] Function called.');
        console.log('[TRACK LOAD] Params:', params);
        console.log('[TRACK LOAD] URL Search Params:', Object.fromEntries(url.searchParams));

        const trackId = params.trackId;
        const trackTitle = url.searchParams.get('title');
        const trackCategory = url.searchParams.get('category');
        const trackDifficulty = url.searchParams.get('difficulty');
        const totalMythsStr = url.searchParams.get('totalMyths');
        const icon = url.searchParams.get('icon');

        if (!trackTitle || !trackCategory || !trackDifficulty || !totalMythsStr || !icon) {
            throw SvelteKitError(
                400,
                'Missing required track metadata in URL parameters (title, category, difficulty, totalMyths, icon).'
            );
        }
        const totalMyths = parseInt(totalMythsStr, 10);
        // ... validation ...

        const returnData = {
            trackId,
            trackTitle: decodeURIComponent(trackTitle),
            trackCategory: decodeURIComponent(trackCategory),
            trackDifficulty,
            trackIcon: decodeURIComponent(icon),
            totalMythsInTrack: totalMyths,
            initialMyth: null // No myth data loaded initially by `load`
        };
        console.log('[TRACK LOAD] Returning data:', returnData);
        return returnData;
    };
    ```

## II. Client-Side Initialization & First Myth Request

**File:** `myth-buster/src/routes/game/tracks/[trackId]/+page.svelte`

1.  **Receiving Props:** The Svelte component receives `pageLoadData` (from the server `load` function) and an initial `formProp` (which will be `null` or `undefined` before any actions complete) via `$props()`.
2.  **`onMount` Hook:**
    *   When the component mounts, the `onMount` lifecycle function is executed.
    *   It checks if a myth statement is already loaded (`!currentMythStatement`) and if the track isn't already marked as completed (`!showTrackCompletedMessage`).
    *   If these conditions are met, it programmatically submits a hidden form (`generateMythFormElement`).
    *   This form POSTs to the `?/generateMyth` action, sending all necessary track metadata (from `pageLoadData`) and `mythIndex: 0` to request the first myth.

    ```svelte
    // myth-buster/src/routes/game/tracks/[trackId]/+page.svelte (snippet from <script>)
    let { data: pageLoadData, form: formProp }: { data: PageData; form: GameActionData } = $props();
    let generateMythFormElement: HTMLFormElement | null = $state(null);
    // ... other state variables ...

    onMount(() => {
        if (generateMythFormElement && !currentMythStatement && !showTrackCompletedMessage) {
            console.log('[TrackPlayer onMount] Attempting to load first myth.');
            const formData = new FormData(generateMythFormElement);
            formData.set('mythIndex', '0'); // Fetch first myth (0-indexed)
            formData.set('trackTitle', pageLoadData.trackTitle);
            formData.set('trackCategory', pageLoadData.trackCategory);
            formData.set('trackDifficulty', pageLoadData.trackDifficulty);
            formData.set('totalMythsInTrack', pageLoadData.totalMythsInTrack.toString());

            if (typeof generateMythFormElement.requestSubmit === 'function') {
                generateMythFormElement.requestSubmit();
            } else {
                generateMythFormElement.submit();
            }
        }
    });
    ```

    The hidden form in the template:
    ```svelte
    // myth-buster/src/routes/game/tracks/[trackId]/+page.svelte (snippet from template)
    <form
        method="POST"
        action="?/generateMyth"
        bind:this={generateMythFormElement}
        use:enhance={() => {
            isGenerating = true;
            return async ({ update }) => {
                await update({ reset: false }); // SvelteKit updates formProp
                // After refactor, formProp will be handled by handleFormResult(formProp)
                isGenerating = false;
            };
        }}
    >
        <!-- Hidden inputs for track details and mythIndex are populated here -->
        <input type="hidden" name="trackTitle" value={pageLoadData.trackTitle} />
        <input type="hidden" name="trackCategory" value={pageLoadData.trackCategory} />
        <!-- ... other hidden inputs ... -->
        <input type="hidden" name="mythIndex" value={hasAnswerResultForDisplay ? currentMythIndexInTrack + 1 : currentMythIndexInTrack} />
        
        <!-- Button to trigger this form, initially shows "Loading Myth..." -->
        <Button type="submit" disabled={isGenerating || ...}>
            {#if isGenerating}
                Loading...
            {:else if ...}
                Next Myth
            {:else}
                Loading Myth...
            {/if}
        </Button>
    </form>
    ```

## III. Myth Generation (Server-Side Action)

**File:** `myth-buster/src/routes/game/tracks/[trackId]/+page.server.ts`

1.  **`generateMyth` Action:**
    *   This server action receives the form data submitted by the client.
    *   It extracts `trackId`, `trackTitle`, `trackCategory`, `trackDifficulty`, `totalMythsInTrack`, and `mythIndex`.
    *   It validates these parameters.
    *   If `mythIndex` is valid (within the bounds of `totalMythsInTrack`):
        *   It attempts to retrieve the myth from a cache (currently disabled for debugging).
        *   **API Call (if not cached):**
            *   It constructs a specific system prompt using `TRACK_MYTH_GENERATION_SYSTEM_PROMPT_TEMPLATE`, providing the AI with the track's context and the specific myth number being requested (e.g., "generating myth number 1 of 4 for track 'Space Exploration Myths'").
            *   It makes a POST request to the Perplexity API (`PERPLEXITY_API_URL`).
            *   It parses the JSON response, expecting a `GameStatement` object (statement, isTrue, explanation, citations).
            *   The received `GameStatement` is (conceptually) cached.
        *   It returns a `GenerateActionResult` object which includes:
            *   `success: true`
            *   The `GameStatement` data (`statement`, `isTrue`, etc.).
            *   Track context: `trackId`, `trackTitle`, `currentMythIndex`, `totalMythsInTrack`, `isLastMythInTrack`.
            *   `action: 'generateMyth'` (crucial for client-side type guards).
    *   If `mythIndex` is out of bounds (track completed), it returns a `GenerateActionResult` with `success: false`, `trackCompleted: true`, and an appropriate error message.
    *   If any other error occurs (API error, parsing error), it returns a `fail(...)` with `success: false` and an error message.

    ```typescript
    // myth-buster/src/routes/game/tracks/[trackId]/+page.server.ts (snippet from generateMyth action)
    export const actions: Actions = {
        generateMyth: async ({ request, params }) => {
            // ... (formData parsing and validation) ...

            if (mythIndex >= 0 && mythIndex < totalMythsInTrack) {
                // ... (caching logic - currently bypassed) ...

                if (!gameStatement) { // If not from cache
                    try {
                        const systemPromptContent = TRACK_MYTH_GENERATION_SYSTEM_PROMPT_TEMPLATE(...);
                        const payload = { model: 'sonar', messages: [...] };
                        const resp = await fetch(PERPLEXITY_API_URL, { ... });
                        // ... (API response handling and parsing) ...
                        gameStatement = JSON.parse(jsonMatch[1]) as GameStatement;
                        // ... (validation of gameStatement) ...
                        cacheTrackMyth(cacheKey, gameStatement);
                    } catch (error: any) {
                        return fail(500, { /* ... error details ... */ action: 'generateMyth', success: false });
                    }
                }
                // ... (handle if gameStatement is still null) ...

                const resultData = {
                    success: true,
                    ...gameStatement,
                    trackId, trackTitle, currentMythIndex: mythIndex, totalMythsInTrack,
                    isLastMythInTrack: mythIndex === totalMythsInTrack - 1,
                    cached: fromCache,
                    action: 'generateMyth' // Important for client-side processing
                } as GenerateActionResult;
                return resultData;
            } else { // Track completed or invalid index
                return fail(400, { /* ... track completed details ... */ action: 'generateMyth', success: false, trackCompleted: true });
            }
        },
        // ... checkAnswer action ...
    };
    ```

## IV. Processing Action Results & Displaying Myth (Client-Side)

**File:** `myth-buster/src/routes/game/tracks/[trackId]/+page.svelte`

1.  **`formProp` Update:** After the `?/generateMyth` action completes, SvelteKit updates the `formProp` in the `+page.svelte` component with the `GenerateActionResult` returned by the server.
2.  **Refactored Logic (No `$effect`s for form processing):**
    *   The `enhance` callback for the `generateMyth` form will now look like:
        ```typescript
        // myth-buster/src/routes/game/tracks/[trackId]/+page.svelte (enhance for generateMyth)
        use:enhance={() => {
            isGenerating = true;
            return async ({ result, update }) => {
                await update({ reset: false }); // This makes SvelteKit update formProp
                isGenerating = false;
                // After formProp is updated, explicitly handle it:
                if (result.type === 'success' || result.type === 'failure') { // Check if data is available
                  handleFormResult(formProp); // Pass the updated formProp
                } else if (result.type === 'error') {
                  // Handle client-side fetch error before server action was reached
                  toast.error(result.error.message || 'Failed to request new myth.');
                  handleFormResult(null); // Or an error-specific object
                }
            };
        }}
        ```
3.  **`handleFormResult(actionResult: GameActionData)` function:**
    *   This new function replaces the old `processFormResult` and the effects that called it.
    *   It receives the `actionResult` (which is the `formProp` after an action).
    *   It uses type guards (`isGenerateResult`, `isCheckAnswerResult`) to determine the type of action result.
    *   **If `isGenerateResult(actionResult)` and `actionResult.success`:**
        *   It updates client-side state variables:
            *   `currentMythStatement = actionResult.statement;`
            *   `currentMythIsTrue = actionResult.isTrue;`
            *   `currentMythExplanation = actionResult.explanation;`
            *   `currentMythCitations = actionResult.citations || [];`
            *   `currentMythIndexInTrack = actionResult.currentMythIndex ?? 0;`
            *   `isLastMythInTrack = actionResult.isLastMythInTrack ?? false;`
            *   `showTrackCompletedMessage = false;`
            *   `currentAnswerSubmission = null;` (resets button loading for answer)
            *   `confidence = 50;` (resets confidence slider)
        *   This triggers Svelte's reactivity, and the template updates to show the new myth.
    *   **If `actionResult.trackCompleted`:**
        *   Sets `showTrackCompletedMessage = true;`
        *   Clears `currentMythStatement`.
    *   **If `actionResult.error`:**
        *   Displays a toast notification: `toast.error(actionResult.error);`
    *   The same pattern applies if `isCheckAnswerResult(actionResult)`.

    ```typescript
    // myth-buster/src/routes/game/tracks/[trackId]/+page.svelte (new function)
    function handleFormResult(actionResult: GameActionData) {
        if (!actionResult) {
            // Potentially handle null/undefined if formProp could be reset externally
            currentMythStatement = null; // Clear current myth if form is cleared
            // any other cleanup
            return;
        }

        console.log('[TrackPlayer] Handling form result:', actionResult);

        if (isGenerateResult(actionResult)) {
            if (actionResult.success) {
                currentMythStatement = actionResult.statement;
                currentMythIsTrue = actionResult.isTrue;
                currentMythExplanation = actionResult.explanation;
                currentMythCitations = actionResult.citations || [];
                currentMythIndexInTrack = actionResult.currentMythIndex ?? 0;
                isLastMythInTrack = actionResult.isLastMythInTrack ?? false;
                showTrackCompletedMessage = false;
                currentAnswerSubmission = null;
                confidence = 50; 
            } else if (actionResult.trackCompleted) {
                showTrackCompletedMessage = true;
                justFinishedTrackTitle = actionResult.trackTitle || pageLoadData.trackTitle;
                currentMythStatement = null;
            }
            if (actionResult.error) {
                toast.error(actionResult.error);
            }
        } else if (isCheckAnswerResult(actionResult)) {
            // ... (logic for handling checkAnswer results, updating score, streak) ...
            // Example:
            if (actionResult.success) {
                updateScore(score + actionResult.points);
                if (actionResult.result === 'correct') { /* ... */ }
                else { /* ... */ }
            }
            if (actionResult.error) {
                toast.error(actionResult.error);
            }
        }
    }
    ```

4.  **Template Rendering:**
    *   The Svelte template uses derived values (`hasValidStatementForDisplay`, `hasAnswerResultForDisplay`) and other state variables to conditionally render different UI sections:
        *   "Loading Myth..." button.
        *   Myth statement and True/False answer buttons.
        *   Answer result (correct/incorrect, explanation, citations).
        *   "Track Completed" dialog.

## V. Answering a Myth

1.  **User Interaction (`+page.svelte`):**
    *   User selects "True" or "False" and (implicitly) their `confidence` level.
    *   Clicking an answer button submits a form to the `?/checkAnswer` action.
    *   Hidden inputs in this form include the `statement`, `isTrue` (the correct answer for the current myth), `explanation`, `citations`, and `confidence`.
2.  **`checkAnswer` Action (`+page.server.ts`):**
    *   Receives the form data.
    *   Compares `userAnswer` to the actual `isTrue`.
    *   Calculates `points` based on correctness and `confidence`.
    *   Returns a `CheckAnswerActionResult` with `success: true`, the `result` ('correct' or 'incorrect'), `points`, and the original myth data. It also includes `action: 'checkAnswer'`.
3.  **Client-Side Result Processing (`+page.svelte`):**
    *   The `enhance` callback for the `checkAnswer` form calls `await update({ reset: false })`.
    *   `formProp` is updated with the `CheckAnswerActionResult`.
    *   `handleFormResult(formProp)` is called.
    *   `handleFormResult` processes the answer, updates the score and streak, and the template re-renders to show the feedback.

## VI. Next Myth / Track Completion

1.  **"Next Myth" Button (`+page.svelte`):**
    *   After an answer is processed, if the track is not complete, the "Next Myth" button is shown.
    *   Clicking it submits the `generateMyth` form again, but this time with `mythIndex` incremented (`currentMythIndexInTrack + 1`).
2.  **Loop:** The flow returns to Step III (Myth Generation).
3.  **Track Completion:**
    *   If the `generateMyth` action is called with a `mythIndex` that is out of bounds, it returns `trackCompleted: true`.
    *   Alternatively, if the last myth is answered correctly, `processFormResult` (via `handleFormResult`) sets `showTrackCompletedMessage = true` if `isLastMythInTrack` was true for that myth.
    *   The "Track Completed" dialog is then shown.

This refactored flow removes the reliance on reactive `$effect`s for processing form results and instead uses a more direct, explicit function call (`handleFormResult`) triggered by the completion of SvelteKit's `enhance` form submissions.