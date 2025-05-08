# Myth Buster Web App Plan

This plan outlines the development of a myth-busting web app, built with Svelte 5, shadcn-svelte, lucide-svelte, and Tailwind CSS, leveraging the Perplexity Sonar API for the hackathon submission. Users ask if a statement is true, receiving a detailed answer (emphasizing debunking falsehoods) with informative truths, resource links, and engaging visual/audio cues, targeting the “Most Fun / Creative Project” category.

## Project Overview
- **Purpose**: Create a web app where users input statements to verify their truth, receiving detailed debunking for falsehoods, enriched with facts, Sonar API citations, and myth-themed visual/audio cues.
- **Target Audience**: Hackathon judges and curious users seeking to debunk myths with an engaging, interactive experience.
- **Category**: Most Fun / Creative Project, with potential for Best Deep Research Project using Sonar’s advanced features.
- **Tech Stack**:
  - **Frontend**: Svelte 5 (runes for reactivity)
  - **UI Components**: shadcn-svelte (Bits UI)
  - **Styling**: Tailwind CSS
  - **Icons**: lucide-svelte
  - **AI Integration**: Perplexity Sonar API (real-time search, citations, reasoning) [Sonar API Documentation](https://docs.perplexity.ai/docs)
  - **Documentation Reference**: Svelte 5 syntax via https://svelte.dev/llms-full.txt

## Features and Requirements
1. **Myth Verification Interface**:
   - Input field for statements (e.g., “Does cracking knuckles cause arthritis?”) using shadcn-svelte Textarea.
   - Detailed verdict (True/False/Inconclusive) in shadcn-svelte Card, emphasizing debunking for falsehoods with informative truths.
   - Resource links from Sonar API in shadcn-svelte List with `bg-codex-parchment`.
   - Tailwind CSS animations for verdict reveal (e.g., fade-in).
2. **Visual Cues**:
   - Verdict-specific visuals in Cards:
     - **True**: lucide-svelte Check (`fill-codex-emerald`) with scale-up animation.
     - **False**: lucide-svelte X (`fill-codex-crimson`) with shake animation.
     - **Inconclusive**: lucide-svelte HelpCircle (`fill-codex-amethyst`) with pulse animation.
   - Loading state with shadcn-svelte Skeleton and Tailwind `animate-spin`.
3. **Audio Cues**:
   - Optional sounds: ding for “True,” buzz for “False,” hum for “Inconclusive.”
   - Toggle via shadcn-svelte Switch with lucide-svelte Volume icon.
4. **Confidence Meter**:
   - Slider for users to indicate confidence in the statement’s truth (“Not Sure” to “100% Certain”) before verdict.
   - shadcn-svelte Slider with Tailwind CSS smooth animations (`bg-codex-amethyst`).
5. **Myth Origin Stories**:
   - Collapsible section with historical/cultural myth origins via Sonar API.
   - shadcn-svelte Accordion with Tailwind CSS slide-in animation.
6. **Myth-Busting Streaks**:
   - Track consecutive myths verified in shadcn-svelte Badge.
   - lucide-svelte Flame with Tailwind CSS pulse animation (`fill-codex-emerald`).
7. **Seasonal/Themed Myths**:
   - Curate holiday/seasonal myths (e.g., Halloween ghosts) for inspiration.
   - Show in shadcn-svelte Badge with lucide-svelte Pumpkin/Snowflake icons.
8. **Theme Toggle**:
   - Dark/light mode switch with shadcn-svelte Switch and lucide-svelte Moon/Sun icons.
   - Persist in local storage with Svelte 5 `$state`.
   - Tailwind CSS dark mode classes.
9. **Myth Busting Game**:
   - Interactive game where AI generates random facts/myths for users to evaluate.
   - True/False selection with confidence slider (1-100%).
   - Immediate feedback with explanations and evidence.
   - Score tracking based on correctness and confidence level.
   - Streak counter for consecutive correct answers.
   - Visual feedback for correct/incorrect responses.
   - Educational content explaining the truth behind each statement.

## Design and Theme
- **Color Theme: Enchanted Codex**:
  - **Deep Slate Blue** (`#1E293B`, `slate-900`): App/UI background (dark mode).
  - **Parchment Beige** (`#F5E8C7`, `stone-100`): Cards, Accordions, Lists.
  - **Emerald Green** (`#10B981`, `emerald-500`): True verdicts, Buttons, Check icons.
  - **Crimson Red** (`#EF4444`, `red-500`): False verdicts, X icons.
  - **Amethyst Purple** (`#8B5CF6`, `purple-500`): Inconclusive, Sliders, seasonal Badges.
  - **Soft Ivory** (`#F3F4F6`, `gray-100`): Primary text (labels, citations).
  - **Stone Gray** (`#9CA3AF`, `gray-400`): Secondary text (placeholders).
  - **Light Mode**:
    - Background: Warm Ivory (`#FEFCE8`, `stone-50`).
    - Secondary: Light Slate (`#E2E8F0`, `slate-200`).
    - Text: Charcoal (`#1F2937`, `gray-900`).
  - **Tailwind Config**: Extend with `codex` colors (e.g., `codex-slate`, `codex-emerald`).
- **Design Pattern: Mythic Manuscript**:
  - **Parchment Backgrounds**: `bg-gradient-to-br from-codex-parchment to-codex-light-ivory` for Cards, Accordions; `shadow-sm shadow-codex-stone` for depth.
  - **Ornamental Borders**: `border-2 border-codex-emerald rounded-md` for Cards.
  - **Animated Flourishes**:
    - Verdict reveals: `transition-opacity duration-300`, scale-up Check/X/HelpCircle.
    - Hover: `hover:ring-2 ring-codex-amethyst`, `animate-pulse`.
    - Streaks: `animate-bounce` Flame in `codex-emerald`.
  - **Typography**: `font-serif` (EB Garamond) for headers; `font-sans` (system-ui) for body text.
  - **Icons**: lucide-svelte Check, X, HelpCircle, Flame, Pumpkin; styled with `stroke-codex-emerald`, `hover:scale-110`.
  - **Layout**: Centered input/verdict Card, Resizable sidebar (origins, seasonal myths), styled as parchment pages.
  - **Responsive**: Tailwind `md:flex`, `sm:grid`; shadcn-svelte Scroll Area for citations.

## Development Tasks
- **Setup**:
  - Initialize SvelteKit with Svelte 5: `npx sv create`.
  - Install shadcn-svelte: `npx shadcn-svelte@next init`.
  - Install lucide-svelte: `npm install lucide-svelte`.
  - Configure Tailwind CSS with `codex` theme, animations (e.g., `flourish` keyframe), fonts (EB Garamond, system-ui).
  - Set up shadcn-svelte component aliases.
- **Core Implementation**:
  - Build verification UI with shadcn-svelte Textarea, Card, List for inputs, verdicts, citations; style with `bg-codex-slate text-codex-ivory`.
  - Add confidence meter with shadcn-svelte Slider.
  - Implement verdict display with visual cues (Check/X/HelpCircle) and animations.
- **Sonar API Integration**:
  - Obtain Sonar API key.
  - Create SvelteKit `+server.ts` for secure API requests.
  - Fetch verdicts, debunking details, and origins; show citations in List with `bg-codex-parchment`.
- **Additional Features**:
  - Implement origins (Accordion), streaks (Badge), seasonal myths (Badge), audio cues (Switch) with shadcn-svelte components, lucide-svelte icons, and Tailwind animations.
  - Style with `codex` colors and parchment textures.
  - Develop Myth Busting Game with:
    - Server API endpoint to generate random facts/myths via Sonar API.
    - Game UI with statement display, confidence slider, and True/False buttons.
    - Score tracking and streak counter using Svelte 5 `$state`.
    - Feedback system with explanations and visual cues for correct/incorrect answers.
- **Polish and Optimization**:
  - Add theme toggle with Switch, Moon/Sun icons, and `dark:` classes.
  - Optimize with Svelte 5 reactivity, cached API queries.
  - Ensure responsiveness with shadcn-svelte Resizable, Scroll Area, and Tailwind `md:`, `sm:` classes.
  - Debug Svelte 5 rune issues.
- **Testing**:
  - Test verification, API, visual/audio cues, and feature interactions.
  - Verify accessibility with shadcn-svelte ARIA components.
  - Check Tailwind responsiveness.
- **Submission Preparation**:
  - Record 3-minute demo video showing myth verification, debunking, and cues.
  - Create private GitHub repo with README detailing:
    - Sonar API usage (verification, citations, origins).
    - shadcn-svelte, lucide-svelte, Tailwind CSS, and Enchanted Codex theme.
    - Svelte 5 syntax adherence.
  - Share repo with `james.liounis@perplexity.ai`, `testing@devpost.com`.
  - Submit YouTube video (public) and Devpost form.

## Success Criteria
- **Technical Implementation**: High-quality Svelte 5 code with shadcn-svelte, Tailwind CSS, and robust Sonar API use.
- **Design**: Engaging, animated UI with Enchanted Codex theme, Mythic Manuscript pattern, and accessibility.
- **Impact**: Delivers clear, informative myth debunking, appealing to judges and users.
- **Creativity**: Enhances myth verification with visual/audio cues, creating a fun, unique web app.

## Risks & Mitigations
- **Risk**: Svelte 5 compatibility with shadcn-svelte.
  - **Mitigation**: Use latest shadcn-svelte, check community fixes.
- **Risk**: Sonar API rate limits/latency.
  - **Mitigation**: Cache queries, use shadcn-svelte Skeleton.
- **Risk**: Performance with complex verdicts.
  - **Mitigation**: Optimize Svelte 5 reactivity, limit API calls.
- **Risk**: Tailwind CSS configuration errors.
  - **Mitigation**: Follow shadcn-svelte Tailwind guide, test theme.

## Research and Analysis
After researching and thinking through the plan for the Myth Buster app, I’ve evaluated its alignment with the hackathon goals and its core purpose: verifying statements and debunking myths with detailed, engaging answers. Below is a comprehensive analysis and recommendations to ensure the plan is effective and feasible within the hackathon timeframe.

### Project Overview
The Myth Buster app aims to allow users to verify statements and receive detailed responses, focusing on debunking falsehoods with evidence. This purpose is clear and aligns well with the hackathon’s goals, particularly for the "Most Fun / Creative Project" category. The target audience—curious users interested in truth and myths—and the category selection seem appropriate and well-defined.

### Tech Stack
The proposed tech stack includes:
- **Svelte 5**: A modern, lightweight framework for building interactive UIs.
- **shadcn-svelte** and **lucide-svelte**: For reusable components and icons, enhancing development speed and visual appeal.
- **Tailwind CSS**: For rapid, customizable styling.
- **Sonar API**: To provide real-time information and citations, critical for the app’s verification functionality.

These choices are cohesive, modern, and suitable for a hackathon project. The Sonar API integration is especially vital, as it powers the app’s core feature—delivering accurate, sourced answers.

### Feature Analysis
The plan outlines several features. Here’s an evaluation of each, with recommendations for prioritization:

1. **Myth Verification Interface**  
   - **Description**: Users input a statement, and the app displays a verdict (true, false, mixed) with citations.  
   - **Assessment**: This is the app’s backbone and must be fully implemented. It directly supports the goal of verifying statements and debunking myths.  
   - **Priority**: High (essential).

2. **Visual Cues**  
   - **Description**: Icons and animations (e.g., green check for true, red X for false) with a loading state.  
   - **Assessment**: Enhances user engagement and clarity without overcomplicating the app. The loading state improves UX during API calls.  
   - **Priority**: High (core enhancement).

3. **Audio Cues**  
   - **Description**: Optional sounds for verdicts (e.g., a chime for true).  
   - **Assessment**: Adds a fun, creative element but should be toggleable to respect user preferences.  
   - **Priority**: High (simple to implement, aligns with "fun" category).

4. **Confidence Meter**  
   - **Description**: Users guess the verdict before seeing the answer, with feedback.  
   - **Assessment**: An interactive twist that encourages critical thinking, but it’s not essential for the initial version.  
   - **Priority**: Medium (nice-to-have, consider if time allows).

5. **Myth Origin Stories**  
   - **Description**: Historical context for myths.  
   - **Assessment**: Adds depth but could overshadow the verification focus. Better suited for a later iteration.  
   - **Priority**: Low (post-hackathon feature).

6. **Myth-Busting Streaks**  
   - **Description**: Tracks consecutive myth verifications for gamification.  
   - **Assessment**: Encourages engagement but should remain subtle to avoid shifting focus.  
   - **Priority**: Medium (optional, time-dependent).

7. **Seasonal/Themed Myths**  
   - **Description**: Content tied to holidays or events.  
   - **Assessment**: Keeps the app fresh but is non-essential for the initial submission.  
   - **Priority**: Low (future update).

8. **Theme Toggle**  
   - **Description**: Dark/light mode switch.  
   - **Assessment**: A standard accessibility feature that’s easy to implement and improves UX.  
   - **Priority**: Medium (recommended but not critical).

#### Recommendation
For the hackathon, prioritize:
- **Core Features**: Myth Verification Interface, Visual Cues, Audio Cues.  
- **Secondary Features**: Confidence Meter, Theme Toggle (if time permits).  
- **Later Features**: Myth Origin Stories, Streaks, Seasonal Myths (post-hackathon).  
This ensures a focused, polished app that meets the core purpose while staying manageable within the deadline.

### Design and Theme
- **Enchanted Codex Color Theme**: A mystical palette that fits the myth-busting concept.  
- **Mythic Manuscript Pattern**: A textured background for visual cohesion.  

These choices create a unique, engaging identity that complements the app’s purpose without adding complexity. They’re ideal for standing out in the "Most Fun / Creative Project" category.

### Development Tasks
The plan includes standard setup steps (e.g., initializing Svelte, configuring Tailwind) and focuses on:
- Building the verification interface.  
- Integrating the Sonar API for real-time data.  

#### Key Focus
- **Sonar API Integration**: This is critical for delivering accurate verdicts and citations. Test it thoroughly with various inputs to ensure reliability.  
- **Scope Management**: Start with the core features and add secondary ones only if time allows. A smaller, well-executed feature set beats an overstretched, buggy app.

### Submission Preparation
The plan includes a 3-minute demo video, which is sufficient to showcase:
- Inputting a statement.  
- Displaying a verdict with visual/audio cues.  
- Showing citations for credibility.  

#### Tip
Highlight the debunking process and creative design in the video to emphasize the app’s fun and functional aspects.

### Risks and Mitigations
Potential risks include:
- **Svelte 5 Compatibility**: Test early with shadcn-svelte and lucide-svelte.  
- **API Limits**: Cache responses or limit queries during the demo.  
- **Performance**: Optimize animations and API calls.  
- **Tailwind Setup**: Follow documentation closely to avoid delays.  

The mitigations are practical and should keep development on track.

### Final Recommendations
1. **Prioritize Core Features**: Focus on the Myth Verification Interface, Visual Cues, and Audio Cues for a strong, functional app.  
2. **Perfect the API**: Ensure Sonar API integration is robust—it’s the app’s foundation.  
3. **Leverage Design**: Use the Enchanted Codex theme and Mythic Manuscript pattern to create a memorable look.  
4. **Manage Time**: Hackathons are time-constrained—aim for quality over quantity in features.  
5. **Demo Smartly**: Showcase the app’s myth-debunking power and creative flair in the video.  

With these adjustments, the Myth Buster app is well-positioned to shine in the hackathon.

## Resources
- **Docs**:
  - shadcn-svelte: https://next.shadcn-svelte.com
  - Svelte 5: https://svelte.dev/llms-full.txt
  - lucide-svelte: https://lucide.dev
  - Sonar API: https://docs.perplexity.ai/docs
  - Tailwind CSS: https://tailwindcss.com
- **Tutorials**: Huntabyte’s shadcn-svelte guides, Joy of Code’s SvelteKit tutorials, Tailwind CSS docs.
- **Community**: r/sveltejs, shadcn-svelte GitHub, Tailwind CSS Discord.