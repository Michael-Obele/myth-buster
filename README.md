# Myth Buster Web App

**License**: Proprietary 2025 MiniApps. All rights reserved.

Myth Buster is a creative, interactive web app that helps users verify the truth of statements and debunk myths with detailed, sourced answers. Built with Svelte 5, shadcn-svelte, lucide-svelte, Tailwind CSS, and powered by the Perplexity Sonar API, it delivers an engaging myth-busting experience with rich visual and audio cues.

**Live Demo:** [https://myth-buster.netlify.app/](https://myth-buster.netlify.app/)

## Features

The following features are available in the initial hackathon submission:

- **Myth Verification Interface**: Enter any statement to get a verdict (True/False/Inconclusive) with detailed explanations and resource links, emphasizing debunking of falsehoods.
- **Visual Cues**: Animated icons and verdict-specific visuals for instant feedback.
- **Responsive Design**: Works seamlessly across devices.
- **Robust Sonar API Integration**: Real-time, cited information for every answer.

The features below are planned, but have not yet been integrated and will not be available in time for the hackathon submission:

- **Audio Cues**: Optional sounds for verdicts, with user toggle.
- **Confidence Meter**: Indicate your confidence before submitting a statement.
- **Myth Origin Stories**: Learn about the historical or cultural origins of myths (collapsible section).
- **Myth-Busting Streaks**: Track consecutive verifications and earn badges.
- **Seasonal/Themed Myths**: Explore curated myths for holidays and seasons.

## Tech Stack

- **Svelte 5** (runes for reactivity)
- **shadcn-svelte** (UI components)
- **lucide-svelte** (icons)
- **Tailwind CSS** (styling)
- **Perplexity Sonar API** (AI-powered myth verification)

## Roadmap & Future Features

Some features will be introduced after the initial release, including:
- **Premium Insight**: Advanced analytics, deeper research, and exclusive myth-busting insights (premium feature, coming soon).
- **Advanced Analytics**: Usage stats, trends, and more.
- **Expanded Myth Origins & Seasonal Content**: More stories and themed myth packs.
- **Onboarding Flow**: An onboarding experience will be added as more features are introduced, to help new users get started and understand the app's capabilities.

## Development

Install dependencies with `bun install` (or `pnpm install`/`yarn install`), then start the development server:

```bash
bun dev
```

## Building for Production

To create a production build:

```bash
bun run build
```

Preview the production build with:

```bash
bun run preview
```

---

This project was built for a hackathon and will continue to evolve.
