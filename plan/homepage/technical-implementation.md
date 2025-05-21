# Technical Implementation Plan

This document outlines the technical approach for redesigning the `+page.svelte` landing page, focusing on Svelte 5 best practices, state management, component integration, and other relevant engineering considerations.

## 1. Svelte 5 Core Concepts

The redesign will fully leverage Svelte 5's new features:

-   **Reactivity (`$state`, `$derived`):**
    -   Use `let myValue = $state(initialValue);` for all reactive component-level state.
    -   Utilize `let derivedValue = $derived(expression);` or `let derivedValue = $derived.by(() => { ... });` for values computed from other stateful variables. This replaces `$: derived = ...` syntax.
    -   Avoid manual `$effect` for simple derived values where `$derived` is more appropriate.
-   **Props (`$props`):**
    -   Define component props using `let { prop1, prop2 = defaultValue, ...rest } = $props();`.
    -   Specify prop types: `let { name, age }: { name: string, age: number } = $props();`.
    -   Remember that props obtained via `$props()` are reactive.
-   **Event Handling:**
    -   Use the new event handling syntax: `<button onclick={() => { ... }}>` (no colon).
    -   For `preventDefault` or `once`, use helper functions as per Svelte 5 guidance if needed, though standard event object methods (`event.preventDefault()`) are preferred.
-   **Slots (`children` prop):**
    -   Access default slot content via `let { children } = $props();`.
    -   Render default slot content using `{@render children()}`.
    -   Named slots will follow the new Svelte 5 patterns if required, though for the landing page, default slots in layout components are more likely.
-   **Effects (`$effect`):**
    -   Use `$effect` primarily for side effects that need to run in response to state changes and don't fit into `$derived` or lifecycle functions (e.g., manual DOM manipulations, setting up non-Svelte event listeners, certain data fetching scenarios tied to reactive state).
    -   Remember `$effect` runs after the DOM has been updated.
    -   Be mindful of dependency tracking within `$effect`: it only tracks values read during its *last* execution.
-   **Lifecycle Functions:**
    -   `onMount`, `onDestroy`, `beforeUpdate`, `afterUpdate` remain available and should be used as appropriate.
    -   `$effect` can often replace `onMount` for reactive setup if the effect depends on state that might change.

## 2. State Management

-   **Local Component State:** For the landing page, most state will likely be local to individual components and managed using `$state`.
-   **Shared State (Minimal):** If any state needs to be shared between sibling components not easily managed by props, consider:
    -   **Context API:** For deeply nested hierarchies if it becomes necessary (unlikely for this page).
    -   **Svelte Stores (as a last resort):** If truly global state for the landing page emerges, a simple store (`writable` from `svelte/store`) could be used, but the preference is to keep state local with Svelte 5's primitives.
-   **No Complex State Machines Expected:** The landing page's interactivity is not anticipated to require complex state machines like XState.

## 3. Data Flow

-   **Props Down:** Data will primarily flow downwards from parent components to child components via props (`$props()`).
-   **Events Up:** Child components will communicate changes or actions back to parent components using standard DOM event dispatching (`dispatch('eventName', detail)`) or by passing callback functions as props.
-   **Data Fetching:**
    -   The current `+page.svelte` does not appear to have complex data fetching requirements that would necessitate `+page.ts` or `+page.server.ts` for initial load.
    -   If any dynamic content (e.g., "Myth of the Day") is fetched client-side after load, use the `fetch` API within an `onMount` or an `$effect` triggered by a user action.

## 4. Component Strategy

-   **`shadcn-svelte-next`:**
    -   Utilize components as per `ui-components.md`.
    -   Follow the installation and usage patterns from the `shadcn-svelte-next` documentation (e.g., `bunx shadcn-svelte@latest add <component>`).
    -   Customize styling via Tailwind CSS utility classes passed to the components or by overriding styles carefully if needed.
-   **`svelte-magic-ui`:**
    -   Integrate animation and interactive components as planned in `ui-components.md` and `animations-transitions.md`.
    -   Ensure compatibility and performance when combining with `shadcn-svelte-next` components.
-   **Custom Components:** Develop new Svelte components for specific sections (e.g., `HeroSection.svelte`, `StatsHighlight.svelte`) to encapsulate structure and logic.
    -   Keep components focused and reusable where possible.

## 5. TypeScript Usage

-   **Strict Type Safety:** Maintain strict TypeScript usage throughout.
    -   Define types for props, state, and any complex data structures.
    -   Use `*.ts` files for utility functions or type definitions.
    -   **No `ts-ignore` or `any`:** Avoid using `// @ts-ignore` or the `any` type unless absolutely unavoidable and well-justified.
-   **Type Inference:** Leverage TypeScript's type inference where possible, but be explicit with types for clarity and safety, especially at component boundaries.

## 6. Build and Development

-   **`bun`:** Use `bun` for all package management and script execution (`bun install`, `bun run dev`, `bun run build`, `bun run check`).
-   **SvelteKit:** The project is already set up with SvelteKit, which handles routing, building, and development server.
-   **Linting and Formatting:** Ensure Prettier and ESLint (if configured) are used to maintain code consistency.

## 7. Asset Handling

-   **Images:** Place static images in the `static/` directory or import them directly into components if they need processing by Vite (e.g., for optimized versions or if they are part of the component bundle).
-   **Icons (`lucide-svelte`):** Import and use icons directly as Svelte components as per `lucide-svelte` documentation.
-   **Custom SVGs:** If any custom SVGs are needed beyond Lucide, they can be imported as components or used directly.

## 8. Performance Considerations

-   **Lazy Loading:** For off-screen images or heavy components, consider lazy loading strategies (e.g., Intersection Observer API) if initial page load becomes slow.
-   **Code Splitting:** SvelteKit handles code splitting by route automatically. Ensure components are structured to benefit from this.
-   **Animation Performance:** As detailed in `animations-transitions.md`, prioritize CSS animations and Svelte transitions. Test JavaScript-based animations (`svelte-motion`, `svelte-magic-ui`) for performance.
-   **`prefers-reduced-motion`:** Implement fallbacks for users who prefer reduced motion.

## 9. Accessibility (A11y)

-   **Semantic HTML:** Use appropriate HTML5 semantic elements.
-   **ARIA Attributes:** Apply ARIA attributes where necessary to enhance accessibility for interactive components.
-   **Keyboard Navigation:** Ensure all interactive elements are keyboard navigable and operable.
-   **Color Contrast:** Verify sufficient color contrast for text and UI elements.
-   **`shadcn-svelte-next` Accessibility:** These components are generally built with accessibility in mind, but always test.

## 10. Deployment

-   Deployment will continue through the existing project setup (presumably Vercel, Netlify, or similar, as common with SvelteKit).
-   Ensure `bun run build` produces a production-ready build without errors.

By adhering to these technical guidelines, the redesigned landing page will be modern, performant, maintainable, and leverage the best of Svelte 5 and the chosen UI libraries.
