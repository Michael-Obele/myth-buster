# Technical Implementation Details

This document outlines the technical approach and implementation details of the Myth Buster application, focusing on the core technologies and architectural patterns used based on the current codebase.

## 1. Svelte 5 Core Concepts

The project fully leverages Svelte 5's new rune-based reactivity system, which provides a more explicit and granular way to manage component state and dependencies.

-   **Reactivity (`$state`, `$derived`):** `$state` is used for all mutable component-local state. `$derived` is used for values computed from `$state` variables, ensuring they react automatically to changes in their dependencies. This replaces the traditional `let x = ...; $: y = x * 2;` syntax with a more functional approach.

    Example from `myth-buster/src/routes/app/components/MythInput.svelte`:

    ```myth-buster/src/routes/app/components/MythInput.svelte#L8-14
    	// Use $state for reactive variables
    	let myth: string = $state('');
    	let isRecording: boolean = $state(false);
    	let loading: boolean = $state(false);
    	let characterCount = $derived(myth.length);
    	let maxLength = 500;
    	let isValid = $derived(myth.trim().length > 0);
    ```

-   **Props (`$props`):** Component properties are defined using the `$props()` rune, providing type safety and making props reactive by default.

    Example from `myth-buster/src/routes/app/components/CitationList.svelte`:

    ```myth-buster/src/routes/app/components/CitationList.svelte#L9-14
    	// Props using Svelte 5 syntax
    	let {
    		citations = []
    	}: {
    		citations: Citation[];
    	} = $props();
    ```

-   **Event Handling:** Standard DOM event handling syntax is used (e.g., `onclick` instead of `on:click`). For custom events or more complex scenarios, the standard `CustomEvent` and `dispatchEvent` are used, often implicitly handled by component libraries like shadcn-svelte.

    Example from `myth-buster/src/routes/game/+page.svelte`:

    ```myth-buster/src/routes/game/+page.svelte#L192-206
    							<Button
    								type="button"
    								variant="ghost"
    								size="icon"
    								class="absolute right-0 top-0 h-full px-3 py-2"
    								onclick={() => (showPassword = !showPassword)}
    							>
    								{#if showPassword}
    									<EyeOff class="h-4 w-4" />
    								{#else}
    									<Eye class="h-4 w-4" />
    								{/if}
    							</Button>
    ```

-   **Effects (`$effect`):** The `$effect` rune is used for creating side effects that depend on reactive state. This is typically used for synchronizing state with external APIs, logging, or performing DOM manipulations that cannot be done declaratively.

    Example from `myth-buster/src/routes/app/components/HistoryTimeline.svelte`:

    ```myth-buster/src/routes/app/components/HistoryTimeline.svelte#L95-100
    	// Setup animation on mount or when relatedMyth changes
    	$effect(() => {
    		if (container && relatedMyth) {
    			setTimeout(animateItem, 100); // Small delay to ensure element is rendered
    		}
    	});
    ```

-   **Slots (`children` prop):** The new snippet system is utilized where components need to render content passed from their parent. Default slot content is accessed via the `children` prop obtained from `$props()`.

    Example from `myth-buster/src/routes/+layout.svelte`:

    ```myth-buster/src/routes/+layout.svelte#L3-4
    	import '../app.css';
    	let { children } = $props();
    ```

## 2. SvelteKit Features

SvelteKit's full-stack capabilities are fundamental to the project's architecture.

-   **File-based Routing:** The application's structure is defined by the file system within `src/routes/`, including nested routes (`(auth)/`).
-   **Layouts:** `+layout.svelte` and `+layout.server.ts` are used to define shared UI (Navbar) and server-side logic (loading user data) across multiple routes.
-   **Page/Server Load Functions:** `+page.server.ts` files are used to fetch data on the server before the page is rendered, handle form action results, and manage server-side state (like in-memory cache). `+page.ts` files handle client-side loading logic or pass form data from the server to the page components.
-   **Form Actions:** `actions` defined in `+page.server.ts` handle POST requests from HTML forms. This is used for user authentication (`/signin`, `/signup`, `/profile`) and for triggering myth verification (`/app`, `/game`) to keep sensitive API keys server-side. The `enhance` action from `$app/forms` is used on the client to progressively enhance these forms with client-side control and feedback.

    Example form enhancement from `myth-buster/src/routes/(auth)/signup/+page.svelte`:

    ```myth-buster/src/routes/(auth)/signup/+page.svelte#L46-67
    				method="POST"
    				class="space-y-4"
    				use:enhance={() => {
    					// Set loading state to true when form is being submitted
    					isLoading = true;

    					return async ({ result }) => {
    						console.log('Form submission result:', result);

    						if (result.type === 'redirect') {
    							// Wait for 100ms to ensure session is set properly
    							await new Promise((resolve) => setTimeout(resolve, 100));
    							// Navigate to the redirected location
    							goto(result.location);
    						} else {
    							// Only reset loading state if not redirecting
    							isLoading = false;
    							// Apply the result (errors, etc.)
    							await applyAction(result);
    						}
    					};
    				}}
    			>
    ```

-   **Server Endpoints:** `+server.ts` files are used to create custom API endpoints for specific tasks, such as the community signup (`/api/community/signup/+server.ts`) or the signout action (`/signout/+server.ts`).

    Example Signout endpoint from `myth-buster/src/routes/(auth)/signout/+server.ts`:

    ```myth-buster/src/routes/(auth)/signout/+server.ts#L1-8
    import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/session';
    import { redirect } from '@sveltejs/kit';
    import type { RequestHandler } from './$types';

    export const POST: RequestHandler = async (event) => {
      const { locals, cookies } = event;
      if (locals.session) {
        await invalidateSession(locals.session.id);
    ```

## 3. API Integration (Perplexity Sonar)

The Perplexity Sonar API is the core backend for verifying myths and generating game content. API requests are performed server-side within `+page.server.ts` files to protect the `PERPLEXITY_API_KEY` environment variable.

-   **Server-Side Fetch:** `fetch` calls are made within the server-side load functions and actions.
-   **Prompt Engineering:** System and user prompts are carefully constructed to guide the AI to return results in the desired JSON format, including verdict, explanation, citations, origin, related myth, and why it's believed.
-   **Response Parsing:** The raw API response, which includes Markdown code blocks, is parsed to extract the JSON object and format it for the frontend. Basic error handling for parsing is included.

    Example API call and response processing logic from `myth-buster/src/routes/app/+page.server.ts`:

    ```myth-buster/src/routes/app/+page.server.ts#L74-157
    	try {
    		// Make the POST request to the Perplexity API
    		const resp = await fetch(PERPLEXITY_API_URL, {
    			method: 'POST',
    			headers: {
    				'Content-Type': 'application/json',
    				Authorization: `Bearer ${apiKey}` // Include the API key in the Authorization header
    			},
    			body: JSON.stringify(payload) // Send the payload as a JSON string
    		});

    		console.log('Perplexity API status:', resp.status);

    		// Check if the API response indicates an error
    		if (!resp.ok) {
    			console.error(`API returned error status: ${resp.status}`);

    			// Return a structured error response for the frontend
    			return {
    				success: false,
    				error: `API returned status ${resp.status}`,
    				data: {
    					verdict: 'inconclusive',
    					explanation:
    						'Unable to verify this myth due to an API error. Please try again later or contact support if the issue persists.',
    					citations: [],
    					mythOrigin: '',
    					relatedMyth: '', // Include new fields in error response
    					whyBelieved: '' // Include new fields in error response
    				}
    			};
    		}

    		// Parse the JSON response from the API
    		let answer;
    		try {
    			answer = await resp.json();
    		} catch (jsonError) {
    			console.error('Failed to parse JSON response:', jsonError);

    			// Return a structured error response for JSON parsing issues
    			return {
    				success: false,
    				error: 'Invalid response from API',
    				data: {
    					verdict: 'inconclusive',
    					explanation:
    						'Unable to verify this myth due to an error processing the response. Please try again later.',
    					citations: [],
    					mythOrigin: '',
    					relatedMyth: '', // Include new fields in error response
    					whyBelieved: '' // Include new fields in error response
    				}
    			};
    		}
    // ... (response processing follows)
    ```

## 4. State Persistence

Client-side state persistence is achieved using the `runed` library's `PersistedState` module, which synchronizes specified `$state` variables with browser `localStorage`. This is primarily used in the Game route to remember the user's score, streak, and game settings between visits.

Example usage in `myth-buster/src/routes/game/+page.svelte`:

```myth-buster/src/routes/game/+page.svelte#L44-50
	// Use PersistedState for values we want to persist across sessions
	const scoreState = new PersistedState('mythBusterScore', 0);
	const highScoreState = new PersistedState('mythBusterHighScore', 0);
	const streakState = new PersistedState('mythBusterStreak', 0);
	const categoryState = new PersistedState('mythBusterCategory', 'general');
	const difficultyState = new PersistedState('mythBusterDifficulty', 'medium');
	const confidenceState = new PersistedState('mythBusterConfidence', 50);
```

## 5. UI Components and Styling

-   **Shadcn-Svelte:** Provides a collection of accessible, composable UI components (`Button`, `Card`, `Input`, `Dialog`, `Tabs`, etc.) that are easily styled with Tailwind CSS.
-   **Tailwind CSS:** Used for utility-first styling, enabling rapid UI development and customization. Includes custom color palettes and theme configurations.
-   **Lucide-Svelte:** Integrated for a consistent set of vector icons used throughout the application.
-   **Svelte-Motion/Svelte-Magic-UI/Lottie:** Used for various animations and visual effects, enhancing the user experience on the landing page and within components like `VerdictDisplay` and `MythInput`.

    Example of using Shadcn-svelte components and Lucide icons in `myth-buster/src/routes/app/components/MythInput.svelte`:

    ```myth-buster/src/routes/app/components/MythInput.svelte#L2-6
    	import { Textarea } from '$lib/components/ui/textarea';
    	import { Button } from '$lib/components/ui/button';
    	import { Mic, SendIcon } from 'lucide-svelte';
    	import { enhance } from '$app/forms';
    	import type { SubmitFunction } from '@sveltejs/kit';
    ```

## 6. Authentication Implementation

A custom authentication system is built using SvelteKit's server-side features.

-   **Server-Side User Management:** Logic for creating users (`createUser`), retrieving users (`getUserByUsername`, `getUserByEmail`), and verifying passwords (`verifyPassword`) resides in server-side code (`$lib/server/user`).
-   **Session Management:** Session tokens are generated (`generateSessionToken`) and stored, linking them to user IDs (`createSession`, `invalidateSession`). Session validity is checked on incoming requests.
-   **Cookie Handling:** The session token is stored in an HTTP-only cookie (`setSessionTokenCookie`, `deleteSessionTokenCookie`) for security.
-   **Locals Integration:** User and session data are loaded into SvelteKit's `locals` object in a root hook (implicitly used by the layout server file) to be available throughout requests.
-   **Form Actions:** Sign-in, sign-up, profile updates, and password changes are handled via dedicated server actions, ensuring sensitive data is processed server-side.

    Example authentication action (`/signin`) from `myth-buster/src/routes/(auth)/signin/+page.server.ts`:

    ```myth-buster/src/routes/(auth)/signin/+page.server.ts#L46-85
    		// Verify the password
    		console.log(`Sign In: Verifying password for user ID: ${user.id}`);
    		const validPassword = await verifyPassword(user.id, password);

    		if (!validPassword) {
    			console.log('Sign In: Invalid password');
    			form.errors.password = ['Invalid username or password'];
    			return fail(400, { form });
    		}

    		// Generate a session token and create a session
    		console.log('Sign In: Authentication successful, creating session');
    		const token = generateSessionToken();
    		const session = await createSession(token, user.id);

    		// Set the session cookie
    		setSessionTokenCookie({ cookies } as any, token, session.expiresAt);
    		console.log('Sign In: Session cookie set');

    		// Set the user and session in locals
    		locals.user = user;
    		locals.session = session;

    		// Redirect to the app
    		console.log('Sign In: Complete, redirecting to homepage');
    		// Make sure we're using a 303 status code for redirecting after a POST
    		throw redirect(303, '/');
    ```

## 7. Data Handling and Types

-   **TypeScript:** The project is built with TypeScript, enforcing type safety throughout the codebase, especially for API responses, form data, and component props.
-   **Data Flow:** Data flows from server load functions/actions to page components via props (`data`, `form`). State changes within components are managed with Svelte 5 runes. Interactions that require server communication trigger form actions.
-   **API Response Structure:** Server-side logic processes the raw API response to fit predefined TypeScript interfaces for consistent data handling on the frontend.

## 8. Build and Development

-   **Bun:** Used as the package manager and runtime (`bun install`, `bun run dev`, `bun run build`, `bun check`).
-   **Vite:** SvelteKit uses Vite for fast development builds and optimized production builds.
-   **TypeScript Compilation:** Handled by SvelteKit and Vite.
-   **Tailwind Compilation:** Handled by Vite.