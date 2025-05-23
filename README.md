# Myth Buster Web App

**License**: Proprietary 2025 MiniApps. All rights reserved.

Myth Buster is an interactive web application that helps users verify myths and misconceptions using AI-powered analysis. Built with modern web technologies, it offers both a verification interface and an engaging game mode to test knowledge.

**Live Demo**: [https://myth-buster.netlify.app/](https://myth-buster.netlify.app/)

## Features

### Currently Implemented Features

- **Myth Verification Interface** (`/app`)
  - Submit any statement for AI analysis
  - Receive verdicts (True/False/Inconclusive) with detailed explanations
  - View citations and sources
  - Learn about myth origins and why they're believed
  - Related myths suggestions

- **Myth Busting Game** (`/game`)
  - Interactive true/false game with AI-generated statements
  - Track score and streaks
  - Confidence level input
  - Immediate feedback with explanations
  - Persisted game state between sessions

- **User Authentication**
  - Secure account creation and login
  - Profile management
  - Password changes

- **Community Features** (`/community`)
  - Community signup count
  - Waitlist form for updates

- **Landing Page** (`/`)
  - Interactive "Mini-Myth" quick check
  - Dynamic stats and highlights
  - Feature showcases

- **About Page** (`/about`)
  - Project information
  - Feature list
  - Technology stack details
  - Team information

## Technology Stack

- **Framework**: SvelteKit
- **Language**: TypeScript
- **UI Components**: Shadcn-svelte
- **Styling**: Tailwind CSS
- **Icons**: Lucide-svelte
- **Animations**: Svelte-motion, Svelte-Magic-UI, Lottie
- **API**: Perplexity Sonar API
- **State Management**: Svelte 5 Runes, PersistedState
- **Build Tool**: Vite
- **Package Manager**: Bun

## Project Structure

The application follows standard SvelteKit conventions:

```
myth-buster/
├── src/
│   ├── lib/               # Reusable components and utilities
│   ├── routes/            # Application routes
│   │   ├── (auth)/        # Authentication routes
│   │   ├── app/           # Myth verification
│   │   ├── game/          # Game interface
│   │   ├── community/     # Community features
│   │   └── about/         # About page
│   └── app.css            # Global styles
├── static/                # Static assets
├── prisma/                # Database schema
└── tests/                 # Test files
```

## Development

### Prerequisites

- Node.js (v18+ recommended)
- Bun (or npm/yarn/pnpm)

### Installation

```bash
bun install
```

### Running the Development Server

```bash
bun dev
```

### Building for Production

```bash
bun run build
```

### Previewing Production Build

```bash
bun run preview
```

## Future Roadmap

### Near-Term Enhancements

- Comprehensive error handling system
- Advanced caching mechanism
- User onboarding experience
- Animation polish and microinteractions
- Formalized testing strategy

### Planned Features

- Myth history and bookmarks
- Shareable image generation
- Game leaderboards and achievements
- Themed game rounds
- Community myth submissions
- Personalized myth recommendations

### Long-Term Vision

- Multilingual support
- Public API for developers
- Educational platform integrations
- Advanced analytics and insights
- Premium features for deeper analysis

---

This project was initially built for a hackathon and continues to evolve with new features and improvements.
