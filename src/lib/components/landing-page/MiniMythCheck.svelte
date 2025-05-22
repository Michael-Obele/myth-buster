<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Progress from '$lib/components/ui/progress/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import { AlertTriangle, Info, LoaderCircle } from 'lucide-svelte';
	import { fly, fade } from 'svelte/transition';

	type Myth = {
		statement: string;
		verdict: boolean;
		explanation: string;
	};

	let myths: Myth[] = $state([]);
	let isLoading: boolean = $state(true);
	let error: string | null = $state(null);

	let currentMythIndex = $state(0);
	let selectedAnswer = $state<boolean | null>(null);
	let showExplanation = $state(false);
	let isAnimating = $state(false);
	let progressValue = $state(0);

	// Function to handle user's answer
	function handleAnswer(answer: boolean) {
		if (isAnimating || selectedAnswer !== null) return;

		selectedAnswer = answer;
		showExplanation = true;
	}

	// Function to move to the next myth
	function nextMyth() {
		isAnimating = true;
		showExplanation = false;
		selectedAnswer = null;

		// Update the current myth index
		if (currentMythIndex < myths.length - 1) {
			currentMythIndex++;
		} else {
			currentMythIndex = 0;
		}

		// Reset animation state after a delay
		setTimeout(() => {
			isAnimating = false;
		}, 500);
	}

	// Automatically update progress value when current myth changes
	$effect(() => {
		if (myths.length > 0) {
			progressValue = ((currentMythIndex + 1) / myths.length) * 100;
		} else {
			progressValue = 0;
		}
	});

	// Get current myth
	const currentMyth = $derived(myths[currentMythIndex]);

	// Determine if user was correct
	const isCorrect = $derived(
		selectedAnswer !== null && currentMyth && selectedAnswer === currentMyth.verdict
	);

	onMount(async () => {
		isLoading = true;
		error = null;
		try {
			const response = await fetch('/api/minimyths');
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || `Failed to fetch myths: ${response.status} ${response.statusText}`
				);
			}
			const data = await response.json();
			if (Array.isArray(data) && data.length > 0) {
				myths = data;
			} else if (Array.isArray(data) && data.length === 0) {
				// This case might happen if the API route returns an empty array successfully
				// but indicates no myths were processed (e.g. all API calls within the route failed)
				error = 'No myths are available at the moment. Please try again later.';
			} else {
				// This handles cases where the response is not an array or an unexpected structure
				throw new Error('Invalid data format received for myths.');
			}
		} catch (e: any) {
			console.error('Error fetching myths:', e);
			error = e.message || 'An unexpected error occurred while fetching myths.';
			myths = []; // Ensure myths is empty on error
		} finally {
			isLoading = false;
		}
	});
</script>

<Card.Root class="mx-auto my-12 w-full max-w-2xl overflow-hidden">
	{#if isLoading}
		<Card.Content class="flex min-h-96 flex-col items-center justify-center p-6 text-center">
			<LoaderCircle class="mb-4 h-10 w-10 animate-spin text-primary" />
			<p class="text-lg text-muted-foreground">Conjuring myths...</p>
		</Card.Content>
	{:else if error}
		<Card.Content class="flex min-h-96 flex-col items-center justify-center p-6 text-center">
			<AlertTriangle class="mb-4 h-12 w-12 text-destructive" />
			<p class="text-lg font-semibold text-destructive">Oops! Something went wrong.</p>
			<p class="text-muted-foreground">{error}</p>
			<Button
				variant="outline"
				class="mt-6"
				onclick={() => {
					// Attempt to refetch
					onMount(async () => {
						// Re-run onMount logic
						isLoading = true;
						error = null;
						try {
							const response = await fetch('/api/minimyths');
							if (!response.ok) {
								const errorData = await response.json();
								throw new Error(
									errorData.error ||
										`Failed to fetch myths: ${response.status} ${response.statusText}`
								);
							}
							const data = await response.json();
							if (Array.isArray(data) && data.length > 0) {
								myths = data;
							} else if (Array.isArray(data) && data.length === 0) {
								error = 'No myths are available at the moment. Please try again later.';
							} else {
								throw new Error('Invalid data format received for myths.');
							}
						} catch (e: any) {
							console.error('Error fetching myths:', e);
							error = e.message || 'An unexpected error occurred while fetching myths.';
							myths = [];
						} finally {
							isLoading = false;
						}
					});
				}}>Try Again</Button
			>
		</Card.Content>
	{:else if myths.length > 0}
		<Card.Header class="pb-0">
			<Card.Title class="text-center text-xl sm:text-2xl">Mini-Myth Quick Check</Card.Title>
			<Card.Description class="mb-2 text-center"
				>Test your knowledge: Is this statement true or false?</Card.Description
			>
		</Card.Header>

		<Card.Content class="pt-0">
			<!-- Progress indicator -->
			<div class="mb-4 mt-2 w-full">
				<Progress.Root value={progressValue} class="h-2"></Progress.Root>
				<p class="mt-1 text-right text-xs text-muted-foreground">
					Myth {currentMythIndex + 1} of {myths.length}
				</p>
			</div>

			<!-- Myth statement -->
			<div class="my-6 flex min-h-20 items-center justify-center">
				{#if currentMyth}
					{#key currentMythIndex}
						<p
							class="text-center text-lg font-medium sm:text-xl"
							in:fly={{ y: 20, duration: 400, delay: 200 }}
							out:fade={{ duration: 200 }}
						>
							{currentMyth.statement}
						</p>
					{/key}
				{/if}
			</div>

			<!-- True/False buttons -->
			<div class="my-4 flex justify-center gap-4">
				<Button
					variant={selectedAnswer === true
						? currentMyth?.verdict === true
							? 'default'
							: 'destructive'
						: 'outline'}
					size="lg"
					onclick={() => handleAnswer(true)}
					disabled={selectedAnswer !== null || !currentMyth}
					class={selectedAnswer === true && currentMyth?.verdict === true
						? 'bg-green-600 hover:bg-green-700'
						: ''}
				>
					{#if selectedAnswer === true && currentMyth?.verdict === true}
						<CheckIcon class="mr-2 h-5 w-5" />
					{/if}
					True
				</Button>

				<Button
					variant={selectedAnswer === false
						? currentMyth?.verdict === false
							? 'default'
							: 'destructive'
						: 'outline'}
					size="lg"
					onclick={() => handleAnswer(false)}
					disabled={selectedAnswer !== null || !currentMyth}
					class={selectedAnswer === false && currentMyth?.verdict === false
						? 'bg-green-600 hover:bg-green-700'
						: ''}
				>
					{#if selectedAnswer === false && currentMyth?.verdict === false}
						<CheckIcon class="mr-2 h-5 w-5" />
					{/if}
					False
				</Button>
			</div>

			<!-- Explanation section -->
			{#if showExplanation}
				<div
					class="mt-6 rounded-md bg-accent p-4 text-accent-foreground"
					in:fly={{ y: 10, duration: 300 }}
				>
					<div class="mb-2 flex items-center gap-2">
						{#if isCorrect}
							<div class="rounded-full bg-green-600 p-1 text-white">
								<CheckIcon size={16} />
							</div>
							<p class="font-medium">Correct!</p>
						{:else}
							<div class="rounded-full bg-destructive p-1 text-destructive-foreground">
								<XIcon size={16} />
							</div>
							<p class="font-medium">Not quite.</p>
						{/if}
					</div>
					<p>{currentMyth?.explanation}</p>
					<div class="mt-4 flex justify-end">
						<Button onclick={nextMyth}>Next Myth</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	{:else}
		<!-- This block handles the case where myths array is empty after loading (e.g., API returned empty or error was handled by setting myths to []) -->
		<Card.Content class="flex min-h-96 flex-col items-center justify-center p-6 text-center">
			<Info class="mb-4 h-12 w-12 text-muted-foreground" />
			<p class="text-lg font-semibold">No Myths Available</p>
			<p class="text-muted-foreground">
				It seems there are no myths to display at the moment. Please check back later.
			</p>
		</Card.Content>
	{/if}
</Card.Root>
