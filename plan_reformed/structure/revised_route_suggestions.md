# Revised Route Structure Suggestions (Sonar API Integration Focus)

This document proposes an updated route structure for the Myth Buster application, specifically considering the integration of advanced Sonar API-driven features while maintaining user flow clarity.

## Guiding Principles:

1.  **Core Simplicity:** `/app` (verification) and `/game` remain primary, straightforward access points.
2.  **Progressive Disclosure:** Advanced analysis and tools are revealed contextually or in dedicated sections to avoid overwhelming users.
3.  **Logical Grouping:** Functionalities with similar purposes or an exploratory nature are grouped.
4.  **Intuitive Naming:** Routes clearly indicate their function.
5.  **Authentication Context:** Personalized and history-based features are tied to user profiles.

## Proposed Route Structure:

### I. Core User-Facing Routes

*   `/`
    *   **Description:** Landing Page.
    *   **Sonar-Enhanced Potential:**
        *   Interactive "Mini-Myth" Quick Check (pre-defined or quick Sonar call).
        *   "Myth of the Day/Week" Showcase (curated or Sonar-suggested) linking to `/app`.
        *   Dynamic Community/Platform Stats.

*   `/app`
    *   **Description:** Main Myth Verification Interface.
    *   **URL Structure:** `/app` (for input), `/app/result?id=[verificationId]` or `/app?myth=[encodedMyth]` (for displaying results).
    *   **Sonar-Powered Contextual Features within Results View:**
        *   **Deep Dive Tabs/Sections:**
            *   "Multi-Perspective Analysis": Sonar gathers diverse viewpoints, debates, and nuances.
            *   "Historical Evolution & Origin": Sonar traces the myth's history and origin.
            *   "Why This Myth Spreads": Sonar provides psychological/sociological context.
            *   "Cross-Cultural Comparison": Sonar explores similar myths in other cultures.
            *   "Underlying Question": Sonar explores deeper human curiosities the myth might address.
        *   **Expanded Explanations:**
            *   "ELI5 Version" / "Expert Persona" Mode: Sonar re-frames explanations for different audiences.
        *   **Interactive Elements:**
            *   "Dig Deeper" / "Follow the Evidence": Clicking parts of the explanation or citations triggers focused Sonar queries.
            *   Citations with "Analyze Source" option (hover/click for Sonar-generated source summary).
        *   **Content Generation:**
            *   Automated list of "Related Questions/Myths/Variations" (Sonar-generated).
        *   **Data Classification:**
            *   Dynamic "Myth Categorization" (Sonar-suggested categories for the verified myth).
        *   **User Interaction (Optional):**
            *   "User Confidence Input" before submission.
            *   "Community Insights" tab for user-generated context on the verified myth (authenticated users).

*   `/game`
    *   **Description:** Myth Busting Game.
    *   **Sonar-Enhanced Game Modes/Content:**
        *   `/game/settings` (or modal): To select themes, difficulty. Sonar can inform available themes or generate them.
        *   `/game/themed/:themeName`: For "Themed Game Rounds" with Sonar-generated questions.
        *   `/game/challenge/explain-the-flaw`: "Explain the Flaw" game mode where Sonar generates false statements and distractors for explanations.
        *   Dynamic Difficulty Adjustment based on performance, with Sonar generating appropriately challenging statements.
    *   **Other Game Features:**
        *   (Consider) `/game/leaderboard`.

*   `/community`
    *   **Description:** Community Hub.
    *   **Existing:** Signup count and dialog.
    *   **New Sub-routes/Features (Potentially Sonar-assisted for content moderation/suggestion):**
        *   `/community/submit-myth`: For "Community Myth Submissions."
        *   `/community/vote`: For voting on submitted myths.
        *   Main `/community` page: Could feature a "Personalized Community Feed" or trending community-submitted myths.

*   `/about`
    *   **Description:** About the Project.

### II. User Authentication & Profile Routes (`(auth)` group)

*   `/signin`, `/signup`, `/signout` (POST endpoint)
*   `/profile`
    *   **Description:** User Profile Management.
    *   **New Sub-routes:**
        *   `/profile/history`: For "Myth History."
        *   `/profile/bookmarks`: For "Bookmarked Myths."
        *   `/profile/achievements`: For "Profile-Based Gamification Badges."
        *   `/profile/settings`: General account settings.
        *   (Consider) `/profile/recommendations`: Personalized myth suggestions from Sonar (alternative to `/explore/recommendations`).

### III. New Top-Level Sections for Specialized Sonar-Powered Tools

*   `/tools/`
    *   **Description:** A section for distinct analytical tools leveraging Sonar.
    *   `/tools/fact-checker`: For the "Fact-Checking Assistant" (analyzing text blocks/URLs for multiple claims).
    *   `/tools/debate-generator`: For the "Myth Debate Generator" (presenting FOR/AGAINST arguments).
    *   `/tools/prebunking-prompts`: For "Pre-bunking" trending topics by generating common misconceptions and critical questions.

### IV. New Top-Level Sections for Discovery, Learning & Exploration

*   `/explore/`
    *   **Description:** A section for curated and Sonar-driven content discovery.
    *   `/explore/myth-origins`: A browsable archive of "Myth Origin Stories" (Sonar-generated narratives).
    *   `/explore/collections` or `/explore/themes/:themeName`: For "Themed Myth Collections/Playlists" (content can be curated or suggested by Sonar).
    *   `/explore/recommendations`: For "Personalized Myth Recommendations" (Sonar-powered, for logged-in users).

### V. API Endpoints

*   `/api/`
    *   `/api/community/signup` (Existing)
    *   New endpoints as needed for community submissions, voting, comments, user history syncing, etc.
    *   `/api/v1/...` (For potential future "Public API for Developers").

## Navigation Considerations:

*   **Main Navbar:**
    *   Core: Home (`/`), Verify (`/app`), Game (`/game`).
    *   Secondary: Community (`/community`), About (`/about`).
    *   New Sections: "Tools" (`/tools`) and "Explore" (`/explore`) can be added as top-level items or grouped under a "More" dropdown to manage navbar complexity.
*   **User Dropdown (Authenticated):**
    *   Profile (`/profile`), History, Bookmarks, Achievements, Settings, Sign Out.
*   **Contextual Links:** "Dive Deeper" options and links to related tools should be embedded within relevant content (e.g., `/app` results page).

This refined structure ensures that new Sonar-powered features enhance the core user experience progressively and are discoverable through logical pathways, whether as contextual deep-dives or as standalone tools for exploration.