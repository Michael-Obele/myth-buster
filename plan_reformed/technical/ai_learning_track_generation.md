# AI-Driven Learning Track Generation Logic

This document outlines the two-stage AI-powered process for generating and playing "Gamified Learning Tracks" in the Myth Buster application. This approach aims to provide dynamic and themed content for users.

## Stage 1: Track Concept Generation

*   **Responsible Route:** `/tracks`
*   **Server File:** `myth-buster/src/routes/tracks/+page.server.ts`
*   **User Action:** User navigates to the `/tracks` page.
*   **Process:**
    1.  The `load` function in `+page.server.ts` is triggered.
    2.  It checks a server-side cache for a list of pre-existing "learning track concepts."
    3.  **API Call (if not cached or expired):**
        *   An API call is made to the Perplexity Sonar API.
        *   A specialized system prompt (`TRACK_CONCEPT_SYSTEM_PROMPT`) instructs the AI to act as a learning track designer.
        *   The AI is asked to generate a list of diverse track concepts (e.g., 5 concepts).
        *   For each concept, the AI provides:
            *   `id`: A unique, URL-friendly slug (e.g., "ancient-civilization-myths").
            *   `title`: A catchy and descriptive title.
            *   `description`: A brief (1-2 sentences) summary.
            *   `category`: A relevant category (e.g., "History", "Science").
            *   `difficulty`: Intended difficulty ("easy", "medium", "hard").
            *   `icon`: A suggested Lucide Svelte icon name.
            *   `totalMyths`: The number of myths this track should contain (e.g., 3-5).
        *   The AI is instructed to return this as a JSON array of track concept objects.
    4.  **Response Handling:**
        *   The server parses the AI's JSON response.
        *   The list of generated track concepts is cached on the server (e.g., for 6 hours) to reduce redundant API calls.
        *   The list of track concepts (without the actual myth statements yet) is passed to the client.
    5.  **Client-Side Display (`/tracks/+page.svelte`):**
        *   The page receives the list of track concepts.
        *   Each concept is displayed as a card (showing title, description, icon, etc.).
        *   A "Start Track" button on each card is linked to the main game page (`/game`), passing all details of the selected track concept (id, title, category, difficulty, totalMyths) as URL query parameters.

## Stage 2: Individual Myth Generation within a Selected Track

*   **Responsible Route:** `/game` (when a track is selected)
*   **Server File:** `myth-buster/src/routes/game/+page.server.ts`
*   **User Action:** User clicks "Start Track" on the `/tracks` page, or "Next Question" while playing a track.
*   **Process:**
    1.  **Navigation & Parameter Passing:** The user is navigated to `/game?trackId=...&title=...&category=...&difficulty=...&totalMyths=...`.
    2.  **Client-Side Setup (`/game/+page.svelte`):**
        *   On page load (or when track parameters change), the `onMount` script (or a reactive effect) reads the track details from the URL query parameters.
        *   These details are stored in the component's state (e.g., `activeTrackId`, `activeTrackTitle`, `currentMythIndexInTrack`).
    3.  **Form Submission to `generate` Action:**
        *   To fetch the first myth (or subsequent myths), the client submits a form to the `generate` action in `/game/+page.server.ts`.
        *   This form includes hidden inputs carrying all the track parameters (`trackId`, `trackTitle`, `trackCategory`, `trackDifficulty`, `totalMythsInTrack`) and the current `mythIndex` for the track.
    4.  **Server-Side Myth Generation (`/game/+page.server.ts` - `generate` action):**
        *   The `generate` action detects that track parameters are present.
        *   **API Call:**
            *   It constructs a dynamic system prompt using `TRACK_MYTH_GENERATION_SYSTEM_PROMPT_TEMPLATE`. This prompt instructs the AI:
                *   "You are generating myth number `{mythIndex + 1}` of `{totalMythsInTrack}` for the track titled '`{trackTitle}`' (Category: `{trackCategory}`, Difficulty: `{trackDifficulty}`)."
                *   The AI is asked to provide a single, distinct true/false myth statement with its explanation and citations, fitting the track's theme and current position.
            *   An API call is made to Perplexity Sonar with this specific, contextual prompt.
        *   **Response Handling:**
            *   The server parses the AI's JSON response, expecting a single `GameStatement` object (statement, isTrue, explanation, citations).
            *   This individual myth statement can optionally be cached (e.g., key: `track_{trackId}_myth_{mythIndex}`).
        *   The `generate` action returns the fetched `GameStatement` along with the current track progress information (`trackId`, `trackTitle`, `currentMythIndex`, `totalMythsInTrack`, `isLastMythInTrack`).
    5.  **Client-Side Display (`/game/+page.svelte`):**
        *   The page receives the new myth and updates the display.
        *   The track progress (e.g., "Myth 2 of 4") and progress bar are updated.
    6.  **Loop:** Steps 3-5 repeat as the user clicks "Next Question," incrementing `mythIndex` until all myths in the track are completed.

## Separation of Concerns

*   **`/tracks/+page.server.ts`**: Acts as a "curriculum designer," generating high-level ideas and structures for learning tracks. It does *not* generate the individual myth statements.
*   **`/game/+page.server.ts`**: Acts as the "content generator" for actual gameplay. When provided with the context of a specific learning track and myth index, it generates that particular myth. If no track context is given, it falls back to generating random myths.

This two-stage dynamic generation approach aims for a balance between providing diverse, themed content and managing API usage efficiently.
