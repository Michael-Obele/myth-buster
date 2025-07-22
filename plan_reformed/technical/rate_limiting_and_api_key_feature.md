# Rate Limiting and Custom API Key Feature Technical Plan

## 1. Database Schema Design (`prisma/schema.prisma`)

To track global API usage per feature per day, the following model will be added to `prisma/schema.prisma`:

```prisma
// New model for tracking GLOBAL API usage per feature per day
model GlobalApiUsage {
  id        String   @id @default(uuid())
  feature   String   // e.g., "myth_verification", "game_question", "tracks_generation"
  date      DateTime // Date of usage (truncated to the day, e.g., 2025-07-22T00:00:00.000Z)
  count     Int      @default(0)

  @@unique([feature, date]) // Unique constraint for global tracking
}
```

**Schema Explanation:**
*   **`GlobalApiUsage`**: This model tracks the total number of requests made across all users for a specific feature on a given day.
    *   `feature`: Specifies which feature the usage applies to (e.g., "myth_verification", "game_question", "tracks_generation").
    *   `date`: Stores the date (truncated to the day) to enforce daily limits.
    *   `count`: The total number of requests made for that `feature` and `date` globally.

**Note:** The `UserApiKey` model is no longer needed in the database, as user-provided API keys will be stored server-side in an HttpOnly session cookie.

## 2. Rate-Limiting Logic Outline (`src/routes/app/+page.server.ts`)

The rate-limiting logic will be implemented in server-side code (e.g., `src/routes/app/+page.server.ts` or a dedicated utility function called from there) for each API endpoint that requires rate limiting.

**Flowchart for Rate-Limiting Logic:**

```mermaid
graph TD
    A[API Request Received] --> B{Is User-Provided API Key in Session Cookie?};
    B -- Yes --> C[Bypass Global Rate Limit, Use Cookie Key for API Call];
    B -- No --> D[Get Current Date (truncated to day)];
    D --> E[Query GlobalApiUsage for feature, date];
    E --> F{Is Global Usage Count >= 10?};
    F -- Yes --> G[Return 429 Too Many Requests Error];
    F -- No --> H[Increment GlobalApiUsage Count by 1];
    H --> I[Proceed with API Call using Default Key];
    C --> J[Return API Response];
    I --> J;
```

**Detailed Steps:**

1.  **Check for User-Provided API Key in Session Cookie:**
    *   The server will check if a Perplexity API key is present in the incoming request's HttpOnly session cookie.
    *   If a key is found in the cookie, use it for the Perplexity API call. **Crucially, bypass all global rate-limiting checks and usage incrementation for this request.**

2.  **Global Rate Limit Check (if no user-provided key in session cookie):**
    *   Determine the `feature` being accessed (e.g., "myth_verification", "game_question", "tracks_generation").
    *   Get the current date, truncated to the start of the day (e.g., `new Date().setHours(0, 0, 0, 0)`).
    *   Query the `GlobalApiUsage` table for a record matching the `feature` and `date`.
    *   If a record exists and its `count` is 10 or more, the request is denied.
    *   Otherwise, increment the `count` for that record. If no record exists, create a new one with `count: 1`.

## 3. Limit-Exceeded Behavior

When the global daily limit for a specific feature is reached (10 requests):

*   **HTTP Response:** The server will return an HTTP `429 Too Many Requests` status code.
*   **Error Message:** The response body will include a clear JSON error message, such as:
    ```json
    {
      "error": "Daily global limit exceeded for this feature. Please try again tomorrow or provide your custom API key to bypass limits."
    }
    ```
*   **User Interface Feedback:** The frontend will display a user-friendly message, informing all users that the global daily limit has been reached for that feature and suggesting that they can provide their own Perplexity API key to bypass it.
*   **Logging:** An entry will be logged on the server side, recording the `feature` and the `global_limit_exceeded` event for monitoring.

## 4. Custom API Key Strategy

User-provided Perplexity API keys will be handled as follows:

*   **HttpOnly Session Cookie Storage:** API keys will be sent from the client to the server. On the server (e.g., in `src/routes/(auth)/profile/+page.server.ts` when the user submits the key), after validation, the key will be stored in an **HttpOnly, Secure session cookie**. This cookie will be sent with subsequent requests from the client to the server. The key will **not** be persisted to the database or stored in client-side local storage.
*   **Input Mechanism:** A dedicated input field will be provided on the user's profile page (`src/routes/(auth)/profile/+page.svelte`) where authenticated users can enter their Perplexity API key.
*   **Server-Side Handling:** All API key validation, storage in the session cookie, and usage will occur exclusively on the server. Keys will never be directly exposed to client-side JavaScript.
*   **Validation:** Upon submission, the provided API key will be validated by making a minimal, non-resource-intensive test call to the Perplexity API. Only valid keys will be stored in the session cookie.
*   **Bypass Logic:** When any user makes a request, the system will first check if a valid Perplexity API key is present in the incoming request's HttpOnly session cookie. If present, this key will be used for the API call, and the request will **bypass the global rate-limiting checks and usage tracking**.

## 5. Game-Specific Tracking

The "10 questions for the game" limit will be tracked distinctly using the existing `GlobalApiUsage` model:

*   **Feature Differentiation:** When a game question is asked, the `feature` field in the `GlobalApiUsage` model will be set to `"game_question"`.
*   **Independent Counting:** Due to the unique constraint `@@unique([feature, date])` on the `GlobalApiUsage` model, the `count` for `"game_question"` will be entirely separate from other features like `"myth_verification"`.
*   **Universal Application:** The same global rate-limiting logic (10 requests per day) will apply to `"game_question"` as to other features, ensuring consistent enforcement across the application.

## 6. Tracks Generation Tracking

The "10 requests per day for tracks generation" limit will be tracked distinctly using the existing `GlobalApiUsage` model:

*   **Feature Differentiation:** When a track is generated, the `feature` field in the `GlobalApiUsage` model will be set to `"tracks_generation"`.
*   **Independent Counting:** Due to the unique constraint `@@unique([feature, date])` on the `GlobalApiUsage` model, the `count` for `"tracks_generation"` will be entirely separate from other features.
*   **Universal Application:** The same global rate-limiting logic (10 requests per day) will apply to `"tracks_generation"`, ensuring consistent enforcement across the application.