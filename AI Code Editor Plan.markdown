# AI Code Editor Plan

This plan outlines the development of an AI-powered code editor web app, built with Svelte 5, shadcn-svelte, lucide-svelte, and Tailwind CSS, leveraging the Perplexity Sonar API for the Myth Buster app’s hackathon submission. The editor enhances the development experience with AI-assisted code suggestions, error detection, myth-related snippets, and a myth-themed UI, targeting the “Most Fun / Creative Project” category.

## Project Overview
- **Purpose**: Develop a lightweight, AI-driven code editor integrated with the Myth Buster app, offering real-time coding assistance, myth-related code examples, and an intuitive, myth-themed interface.
- **Target Audience**: Hackathon judges, developers, and Myth Buster app users experimenting with Svelte 5 code in a fun, myth-themed environment.
- **Category**: Most Fun / Creative Project, with potential for Best Deep Research Project using Sonar’s advanced features.
- **Tech Stack**:
  - **Frontend**: Svelte 5 (runes for reactivity)
  - **UI Components**: shadcn-svelte (Bits UI)
  - **Styling**: Tailwind CSS
  - **Icons**: lucide-svelte
  - **AI Integration**: Perplexity Sonar API (real-time search, citations, reasoning) [Sonar API Documentation](https://docs.perplexity.ai/docs)
  - **Documentation Reference**: Svelte 5 syntax via https://svelte.dev/llms-full.txt

## Features and Requirements
1. **Code Editor Interface**:
   - Resizable editor (CodeMirror wrapper or shadcn-svelte Textarea with custom highlighting) for Svelte 5 code.
   - Syntax highlighting for Svelte 5 runes (`$state`, `$derived`, `$effect`).
   - shadcn-svelte Card, Tabs, Button for accessible UI.
   - Tailwind CSS for responsive styling and animations (e.g., hover transitions).
2. **AI Code Suggestions**:
   - Query Sonar API for context-aware code completions (e.g., “Svelte 5 myth fetch component”).
   - Show suggestions in shadcn-svelte Popover with Sonar citations.
   - Include loading state with shadcn-svelte Skeleton.
3. **Myth-Related Snippets**:
   - Prebuilt snippets for Myth Buster tasks (e.g., API calls, result UI).
   - Accessible via shadcn-svelte Dropdown Menu with lucide-svelte BookOpen icon.
   - Stored in JSON, filterable by category (e.g., API, UI).
4. **Error Detection**:
   - Use Sonar reasoning to catch Svelte 5 syntax errors or best practices.
   - Display in shadcn-svelte Alert with lucide-svelte AlertTriangle icon.
   - Offer actionable fixes (e.g., “Use `$state` for reactivity”).
5. **Interactive Tutorials**:
   - Mini-tutorials for Svelte 5 features (e.g., runes), triggered via shadcn-svelte Dialog.
   - Include myth-themed examples (e.g., “Build myth result card”).
   - Use lucide-svelte PlayCircle and Tailwind CSS animated transitions.
6. **Theme Toggle**:
   - Dark/light mode switch with shadcn-svelte Switch and lucide-svelte Moon/Sun icons.
   - Persist in local storage with Svelte 5 `$state`.
   - Tailwind CSS dark mode classes for seamless switching.
7. **Myth-Busting Challenges**:
   - Code true/false verdict components for myth sets (e.g., 5 science myths).
   - Use shadcn-svelte Progress and lucide-svelte Check for completion.
8. **Myth Origin Stories**:
   - Collapsible myth origin section via Sonar API.
   - Use shadcn-svelte Accordion with Tailwind CSS slide-in animation.
9. **Quick Quiz Mode**:
   - Rapid-fire true/false myth quiz with 10-second timer.
   - shadcn-svelte Timer with lucide-svelte Clock and Tailwind CSS urgency animation.
10. **Myth vs. Myth**:
    - Compare two myths in shadcn-svelte Splitter with resizable split-screen.
    - Style with Tailwind CSS parchment-like panels.
11. **Seasonal/Themed Myths**:
    - Curate holiday/seasonal myths (e.g., Halloween ghosts).
    - Show with shadcn-svelte Badge and lucide-svelte Pumpkin/Snowflake icons.
12. **Confidence Meter**:
    - Slider for myth verdict confidence (“Not Sure” to “100% Certain”).
    - shadcn-svelte Slider with Tailwind CSS smooth animations.
13. **Myth-Busting Streaks**:
    - Track consecutive myths coded/explored in shadcn-svelte Badge.
    - lucide-svelte Flame with Tailwind CSS pulse animation.
14. **Audio Cues**:
    - Optional verdict sounds (ding for “True,” buzz for “False”).
    - Toggle with shadcn-svelte Switch and lucide-svelte Volume icon.

## Design and Theme
- **Color Theme: Enchanted Codex**:
  - **Deep Slate Blue** (`#1E293B`, `slate-900`): Editor/UI background (dark mode).
  - **Parchment Beige** (`#F5E8C7`, `stone-100`): Panels, Popovers, Cards.
  - **Emerald Green** (`#10B981`, `emerald-500`): True verdicts, Buttons, Check icons.
  - **Crimson Red** (`#EF4444`, `red-500`): False verdicts, Alerts, AlertTriangle.
  - **Amethyst Purple** (`#8B5CF6`, `purple-500`): Inconclusive, Sliders, seasonal Badges.
  - **Soft Ivory** (`#F3F4F6`, `gray-100`): Primary text (code, labels).
  - **Stone Gray** (`#9CA3AF`, `gray-400`): Secondary text (citations, placeholders).
  - **Light Mode**:
    - Background: Warm Ivory (`#FEFCE8`, `stone-50`).
    - Secondary: Light Slate (`#E2E8F0`, `slate-200`).
    - Text: Charcoal (`#1F2937`, `gray-900`).
  - **Tailwind Config**: Extend with `codex` colors (e.g., `codex-slate`, `codex-emerald`).
- **Design Pattern: Mythic Manuscript**:
  - **Parchment Backgrounds**: `bg-gradient-to-br from-codex-parchment to-codex-light-ivory` for Cards, Popovers, Dialogs; `shadow-sm shadow-codex-stone` for depth.
  - **Ornamental Borders**: `border-2 border-codex-emerald rounded-md` for Cards, Tabs.
  - **Animated Flourishes**:
    - Verdict reveals: `transition-opacity duration-300`, scale-up Check/X icons.
    - Hover: `hover:ring-2 ring-codex-amethyst`, `animate-pulse`.
    - Quiz timer: `animate-spin` ring in `codex-crimson`.
    - Streaks: `animate-bounce` Flame in `codex-emerald`.
  - **Typography**: `font-mono` (JetBrains Mono) for code; `font-serif` (EB Garamond) for UI headers.
  - **Icons**: lucide-svelte BookOpen, Sparkles, Clock, Pumpkin; styled with `stroke-codex-emerald`, `hover:scale-110`.
  - **Layout**: Centered editor Card, Resizable sidebar (snippets, tutorials), Tabs for modes, Splitter for myth comparisons, all styled as parchment pages.
  - **Responsive**: Tailwind `md:flex`, `sm:grid`; shadcn-svelte Scroll Area for lists.

## Development Tasks
- **Setup**:
  - Initialize SvelteKit with Svelte 5: `npx sv create`.
  - Install shadcn-svelte: `npx shadcn-svelte@next init`.
  - Install lucide-svelte: `npm install lucide-svelte`.
  - Configure Tailwind CSS with `codex` theme, animations (e.g., `flourish` keyframe), and fonts (JetBrains Mono, EB Garamond).
  - Set up shadcn-svelte component aliases.
- **Editor Implementation**:
  - Build editor with shadcn-svelte Textarea or CodeMirror, styled with `bg-codex-slate text-codex-ivory`.
  - Add Svelte 5 rune highlighting per https://svelte.dev/llms-full.txt.
  - Use shadcn-svelte Card, Tabs, Button with `border-codex-emerald`.
- **Sonar API Integration**:
  - Obtain Sonar API key.
  - Create SvelteKit `+server.ts` for secure API requests.
  - Implement suggestions and error detection in Popover/Alert; show citations in shadcn-svelte List with `bg-codex-parchment`.
- **Snippets and Tutorials**:
  - Store snippets in JSON, access via Dropdown Menu with BookOpen icon.
  - Build tutorials in Dialog with myth examples, styled with `font-serif` and slide-in animations.
- **Additional Features**:
  - Implement challenges, origins, quizzes, myth comparisons, seasonal themes, confidence meter, streaks, audio cues using shadcn-svelte components, lucide-svelte icons, and Tailwind animations.
  - Style with `codex` colors and parchment textures.
- **Polish and Optimization**:
  - Add theme toggle with Switch, Moon/Sun icons, and `dark:` classes.
  - Optimize with Svelte 5 reactivity, lazy-loaded suggestions.
  - Ensure responsiveness with shadcn-svelte Resizable, Scroll Area, and Tailwind `md:`, `sm:` classes.
  - Debug Svelte 5 rune issues.
- **Testing**:
  - Test editor, API, and feature interactions.
  - Verify accessibility with shadcn-svelte ARIA components.
  - Check Tailwind responsiveness.
- **Submission Preparation**:
  - Record 3-minute demo video showing editor, AI features, Myth Buster integration.
  - Create private GitHub repo with README detailing:
    - Sonar API usage (suggestions, errors, citations).
    - shadcn-svelte, lucide-svelte, Tailwind CSS, and Enchanted Codex theme.
    - Svelte 5 syntax adherence.
  - Share repo with `james.liounis@perplexity.ai`, `testing@devpost.com`.
  - Submit YouTube video (public) and Devpost form.

## Success Criteria
- **Technical Implementation**: High-quality Svelte 5 code with shadcn-svelte, Tailwind CSS, and robust Sonar API use.
- **Design**: Intuitive, animated UI with Enchanted Codex theme, Mythic Manuscript pattern, and accessibility.
- **Impact**: Enhances Myth Buster app development, appealing to developers and judges.
- **Creativity**: Combines AI coding with myth-busting, delivering a fun, unique tool.

## Risks & Mitigations
- **Risk**: Svelte 5 compatibility with shadcn-svelte.
  - **Mitigation**: Use latest shadcn-svelte, check community fixes.
- **Risk**: Sonar API rate limits/latency.
  - **Mitigation**: Cache queries, use shadcn-svelte Skeleton.
- **Risk**: Performance with large codebases.
  - **Mitigation**: Optimize Svelte 5 reactivity, limit suggestions.
- **Risk**: Tailwind CSS configuration errors.
  - **Mitigation**: Follow shadcn-svelte Tailwind guide, test theme.

## Resources
- **Docs**:
  - shadcn-svelte: https://next.shadcn-svelte.com
  - Svelte 5: https://svelte.dev/llms-full.txt
  - lucide-svelte: https://lucide.dev
  - Sonar API: https://docs.perplexity.ai/docs
  - Tailwind CSS: https://tailwindcss.com
- **Tutorials**: Huntabyte’s shadcn-svelte guides, Joy of Code’s SvelteKit tutorials, Tailwind CSS docs.
- **Community**: r/sveltejs, shadcn-svelte GitHub, Tailwind CSS Discord.