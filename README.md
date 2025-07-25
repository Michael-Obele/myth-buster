# Myth Buster: Deep Dive - AI-Powered Research Assistant

**Unveiling Truth Beyond the Surface with Perplexity Sonar API**

**Hackathon Submission:** Perplexity Sonar API Hackathon - Aiming for "Best Deep Research Project"

Myth Buster is an interactive web application transforming myth verification into a profound, **user-guided research journey**. Leveraging the Perplexity Sonar API, it acts as a dynamic AI research assistant empowering users to uncover layers of information, critically examine evidence, explore diverse contexts, and **synthesize knowledge into coherent understanding**.

**Live Demo**: [https://myth-buster.netlify.app/](https://myth-buster.netlify.app/)

---

## Table of Contents

- [The Challenge: Nuance in Misinformation](#the-challenge-nuance-in-misinformation)
- [Core Deep Research Capabilities](#core-deep-research-capabilities-hackathon-focus--app)
- [Architecture & Sonar API Integration](#architecture--sonar-api-integration)
- [Other Implemented Features](#other-implemented-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development](#development)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Database Setup (Prisma)](#database-setup-prisma)
  - [Running Dev Server](#running-dev-server)
  - [Building](#building)
- [Future Vision](#future-vision)
- [Pricing](#pricing)
- [License](#license)

---

## The Challenge: Nuance in Misinformation

Distinguishing fact from fiction requires more than simple true/false. Misinformation often has deep roots and nuanced contexts. Myth Buster provides **sophisticated tools for deep exploration**, turning users into active investigators.

## Core Deep Research Capabilities (Hackathon Focus - `/app`)

Our `/app` interface features three integrated pillars for in-depth inquiry, providing a guided, user-driven research experience:

1.  **Multi-Angle Investigation:** Explore myths from predefined or **custom user-defined perspectives** (Historical, Scientific, Cultural, Psychological, Economic, Political, or your own). Facilitates comprehensive analysis from diverse viewpoints.
    *   *Details: [Enhanced Multi-Angle Investigation](./plan_reformed/deep_research/feature_multi_angle_investigation_enhanced.md)*

2.  **Evidence Deconstruction & Source Analysis:** Critically evaluate sources cited by the AI. Select any source and launch targeted Sonar analysis using predefined types (Reliability, Methodology, Contradictions, Corroboration) or **custom questions** about the source.
    *   *Details: [Advanced Evidence Deconstruction](./plan_reformed/deep_research/feature_evidence_deconstruction_advanced.md)*

3.  **Dynamic Insight Synthesis:** After exploring multiple angles and sources, synthesize findings to identify **overarching themes, contradictions, and connections**, fostering higher-order thinking and nuanced conclusions.
    *   *Details: [Dynamic Insight Synthesis](./plan_reformed/deep_research/feature_dynamic_insight_synthesis.md)*

An overview of these core capabilities is available here: [Deep Research Capabilities Plan](./plan_reformed/deep_research/deep_research_capabilities.md).

## Architecture & Sonar API Integration

Built with SvelteKit and Svelte 5 runes, Myth Buster's architecture supports this deep research flow:

*   **SvelteKit Form Actions:** Power each research step (`?/researchLens`, `?/analyzeSource`, `?/synthesizeInsights`), keeping API keys secure.
*   **Svelte 5 State Management:** `$state` and `$derived` runes manage dynamic research state for a reactive UI.
*   **Contextual API Calls:** Sequential and contextual Sonar calls gather information based on user actions and previous results.
*   **Advanced Prompt Engineering:** Tailored prompts for each task, including user-defined input, guide Sonar's analysis.

More implementation details: [Deep Research Implementation Plan](./plan_reformed/deep_research/deep_research_implementation.md) and [Technical Implementation Details](./plan_reformed/technical/implementation_details.md).

## Other Implemented Features

*   **Myth Verification (`/app`):** Standard AI verdict, explanation, citations.
*   **Myth Busting Game (`/game`):** Interactive true/false game, score/streak tracking, Sonar-generated Learning Tracks. ([AI-Driven Learning Track Generation Logic](./plan_reformed/technical/ai_learning_track_generation.md))
*   **User Authentication:** Sign up, sign in, profile management (`/profile`).
*   **Community (`/community`):** Discord waitlist (future features planned).
*   **Landing Page (`/`):** Mini-Myth quick check, stats.
*   **About (`/about`):** Project info, tech stack, team.

General feature overview: [Myth Buster Overview](./plan_reformed/core/myth_buster_overview.md).

## Technology Stack

*   **Framework**: SvelteKit
*   **Language**: TypeScript
*   **UI Components**: Shadcn-svelte
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide-svelte
*   **Animations**: Svelte-motion, Svelte-Magic-UI, Lottie/LordIcon
*   **Core AI API**: Perplexity Sonar API
*   **State Management**: Svelte 5 Runes, PersistedState
*   **Database**: Prisma ORM (PostgreSQL)
*   **Build Tool**: Vite
*   **Package Manager**: Bun

Tech stack details: [Technology Stack](./plan_reformed/technical/technology_stack.md).

## Project Structure

```markdown
myth-buster/
├── .svelte-kit/         # SvelteKit build output (generated)
├── src/
│   ├── lib/               # Reusable components, utilities, and server modules
│   │   ├── components/    # Shared Svelte components (UI, blocks, layout, game)
│   │   ├── server/        # Server-side logic (auth, db, API helpers)
│   │   ├── stores/        # Svelte stores / Runed state management
│   │   └── types.ts       # Shared TypeScript types
│   ├── routes/            # Application routes (pages and endpoints) - Powered by SvelteKit Layouts and Actions
│   │   ├── (auth)/        # Authentication routes (signin, signup, profile)
│   │   ├── api/           # Custom API endpoints (e.g., /api/minimyths, /api/community)
│   │   ├── app/           # Core Myth Verification & Deep Research Interface - Central to Hackathon Focus
│   │   ├── game/          # Myth Busting Game & Learning Tracks Interface
│   │   ├── community/     # Community Hub (Signup, future features)
│   │   ├── about/         # About Page
│   │   ├── +layout.svelte # Root layout (e.g., Navbar wrapper)
│   │   └── +page.svelte   # Landing page
│   └── app.css          # Global Tailwind styles
├── static/                # Static assets (images, fonts, lottie animations)
├── prisma/                # Prisma Schema & Migrations (Database for auth/community)
├── tests/                 # Test files (unit, e2e) - Planned
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── package.json           # Project dependencies and scripts (using Bun)
├── README.md              # Project overview (this file)
└── ... (other configuration files)
```

## Development

Standard Bun/Node.js setup.

### Installation

```bash
bun install
```

### Configuration

```bash
cp .env.example .env
```

Update your `.env` file with your API keys and database connection string.

---

### Database Setup (Prisma)

Myth Buster uses Prisma ORM for database management (PostgreSQL recommended).

1. **Update the DATABASE_URL** in your `.env` file:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
    ```

2. **Initialize your database:**

    ```bash
    bunx prisma generate  # Generate Prisma Client
    bunx prisma db push   # Push schema changes to database
    ```

    For development, you can use Prisma Studio to manage your data:

    ```bash
    bunx prisma studio
    ```

<details>
    <summary>How to Set Up a Local PostgreSQL Database</summary>
    <ol>
        <li>Download and install PostgreSQL from the <a href="https://www.postgresql.org/download/">official website</a>.</li>
        <li>During installation, set a username and password for the PostgreSQL superuser (e.g., <code>postgres</code>).</li>
        <li>Once installed, open the PostgreSQL shell or a GUI tool like pgAdmin.</li>
        <li>Create a new database:
            <pre><code>CREATE DATABASE mythbuster;</code></pre>
        </li>
        <li>Update your <code>.env</code> file with the connection string:
            <pre><code>DATABASE_URL="postgresql://<username>:<password>@localhost:5432/mythbuster"</code></pre>
        </li>
        <li>Test the connection by running:
            <pre><code>bunx prisma db pull</code></pre>
        </li>
    </ol>
</details>

---

### Running Dev Server

Add `PERPLEXITY_API_KEY` to `.env`.

```bash
bun run dev
```

**Note:** The Vite development server runs on port **5173** by default. Access your app at `http://localhost:5173`.

### Building

```bash
bun run build
```

---

## Future Vision

Expand deep research (Comparative Analysis, Longitudinal Trace - [Deep Research Overview](./plan_reformed/deep_research/deep_research_overview.md)), enhance error handling/caching ([Future Enhancements Roadmap](./plan_reformed/future_enhancements/roadmap.md)), improve onboarding, and implement community features. Aim to be a premier tool for guided, deep inquiry, with consideration for expanded capabilities and premium access in the future.

More feature ideas: [Additional Suggested Features](./plan_reformed/future_enhancements/additional_suggested_features.md) and [Sonar API-Focused Future Features](./plan_reformed/future_enhancements/sonar_focused_features.md).

---

## Pricing

See our [Pricing Structure](./plan_reformed/pricing_structure.md) for details on Free, Pro, and Max plans.

## License

**License**: Proprietary 2025 MiniApps. All rights reserved.

Myth Buster showcases Perplexity Sonar API's power for user-driven deep research, empowering individuals to navigate complex information landscapes with confidence and critical insight.