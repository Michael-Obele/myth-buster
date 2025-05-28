<script lang="ts">
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { LoaderCircle, Mic, SendIcon } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { animate } from 'svelte-motion';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import TextGenerateEffect from '$lib/components/blocks/TextGenerateEffect.svelte'; // Import TextGenerateEffect
	import { fade } from 'svelte/transition';
	const flame = '/lottie/flame.json';

	// Use $state for reactive variables
	let myth: string = $state('');
	// let loading: boolean = $state(false);
	let characterCount = $derived(myth.length);
	let maxLength = 500;
	let isValid = $derived(myth.trim().length > 0);

	let { handleSubmit, loading } = $props();

	// Placeholder suggestions that will rotate
	const placeholders: string[] = [
		'Does eating carrots improve your eyesight?',
		'Is it dangerous to wake a sleepwalker?',
		'Do we only use 10% of our brain?',
		'Does cracking knuckles cause arthritis?',
		'Is the Great Wall of China visible from space?'
	];
	let currentPlaceholder: number = $state(0);

	// Rotate placeholders every 5 seconds
	function setupPlaceholderRotation() {
		const interval = setInterval(() => {
			currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
		}, 5000);

		return () => clearInterval(interval);
	}

	// Handle form submission
	// const handleSubmit: SubmitFunction = () => {
	// 	loading = true;
	// 	return async ({ update }) => {
	// 		loading = false;
	// 		await update();
	// 	};
	// };

	// Animate input on mount
	function animateInput(node: HTMLElement) {
		animate(node, { y: [20, 0], opacity: [0, 1] } as any, { duration: 0.5, delay: 0.2 });

		setupPlaceholderRotation();
	}

	let formElement: HTMLFormElement | undefined = $state();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.ctrlKey && event.key === 'Enter' && isValid) {
			event.preventDefault();
			formElement?.requestSubmit();
		}
	}
</script>

<form
	class="mx-auto w-full space-y-4"
	method="POST"
	action="?/verifyMyth"
	use:enhance={handleSubmit}
	use:animateInput
	bind:this={formElement}
>
	<div class="relative">
		<Textarea
			name="myth"
			bind:value={myth}
			placeholder={placeholders[currentPlaceholder]}
			class="border-primary/90 focus-visible:ring-primary min-h-32 text-base transition-all duration-300"
			maxlength={maxLength}
			onkeydown={handleKeyDown}
		/>
		<div class="mt-1 flex justify-between text-xs text-white">
			<span>Characters: {characterCount}/{maxLength}</span>
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						<span class="text-white">Press Ctrl+Enter to submit</span>
					</Tooltip.Trigger>
					<Tooltip.Content class="bg-background text-xs">
						<p>Quick submit shortcut</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		</div>
	</div>
	<Button
		type="submit"
		class="from-primary w-full bg-linear-to-r to-purple-600 transition-all duration-300 hover:shadow-lg"
		disabled={!isValid || loading}
	>
		{#if !loading}
			<span class="flex" transition:fade={{ duration: 400, delay: 100 }}>
				<!-- Added delay to fade out -->
				<span>Verify Myth</span>
				<SendIcon class="ml-2 h-4 w-4" />
			</span>
		{:else}
			<span class="flex items-center gap-2" transition:fade={{ duration: 300, delay: 100 }}>
				<!-- Added delay to fade out -->
				<LoaderCircle class="ml-2 h-4 w-4 animate-spin" />
				<span>Analyzing...</span>
			</span>
		{/if}
	</Button>
	{#if loading}
		<div
			transition:fade={{ duration: 400 }}
			class="mx-auto mt-10 flex items-center justify-center gap-2 text-xl font-bold md:text-2xl"
		>
			<LordIcon
				src={flame}
				colors="primary:#10B981,secondary:#10b981"
				class={`size-8 md:size-10`}
			/>
			<!-- Replaced static text with TextGenerateEffect -->
			<TextGenerateEffect
				text="Analyzing your myth... Verifying facts..."
				duration={0.5}
				class="text-md text-white md:text-2xl"
			/>
		</div>
	{/if}
</form>
