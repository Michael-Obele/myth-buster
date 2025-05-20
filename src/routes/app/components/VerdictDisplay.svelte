<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'svelte-motion';
	import { Check, X, HelpCircle, Share2 } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import ShareOptions from './ShareOptions.svelte';

	const wrong = '/lottie/wrong.json';
	const right = '/lottie/right.json';
	const unsure = '/lottie/unsure.json';

	// Props using Svelte 5 syntax
	let {
		verdict = '',
		myth = '',
		explanation = ''
	}: {
		verdict: string;
		myth: string | undefined;
		explanation: string;
	} = $props();

	// Reactive state
	let isRevealed: boolean = $state(false);
	let container: HTMLElement;

	// Derived values for verdict styling
	let verdictColor = $derived(() => {
		switch (verdict) {
			case 'true':
				return 'bg-emerald-500';
			case 'false':
				return 'bg-red-500';
			default:
				return 'bg-purple-500';
		}
	});

	let verdictGradient = $derived(() => {
		switch (verdict) {
			case 'true':
				return 'from-emerald-600/20 to-emerald-400/10';
			case 'false':
				return 'from-red-600/20 to-red-400/10';
			default:
				return 'from-purple-600/20 to-purple-400/10';
		}
	});

	let verdictText = $derived(() => {
		switch (verdict) {
			case 'true':
				return 'True (Confirmed!)';
			case 'false':
				return 'False (Busted!)';
			default:
				return 'Inconclusive';
		}
	});

	// Animation functions
	onMount(() => {
		setTimeout(() => {
			isRevealed = true;
			animateReveal();
		}, 500);
	});

	function animateReveal() {
		if (!container) return;

		// First animate container
		animate(container, { scale: [0.9, 1.05, 1], opacity: [0, 1] } as any, {
			duration: 0.6,
			ease: 'easeOut'
		});

		// Then animate children with staggered delay
		const children = Array.from(container.children);
		children.forEach((child, i) => {
			const delay = 0.6 + i * 0.15;
			animate(child, { y: [15, 0], opacity: [0, 1] } as any, { delay, duration: 0.4 });
		});
	}
</script>

<div class="space-y-4">
	<div
		class="rounded-lg border border-primary/20 bg-gradient-to-br {verdictGradient} p-6"
		bind:this={container}
		class:opacity-0={!isRevealed}
	>
		<div class="mb-4 flex items-center gap-3">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg {verdictColor}"
			>
				{#if verdict === 'true'}
					<LordIcon
						src={wrong}
						state="hover-up"
						trigger="loop"
						stroke="thick"
						colors="primary:#10B981,secondary:#10b981"
						class="absolute bottom-0 left-0 z-0 size-20"
					/>
				{:else if verdict === 'false'}
					<LordIcon
						src={wrong}
						trigger="loop"
						state="in-reveal"
						stroke="thick"
						target="#hero"
						colors="primary:#10B981,secondary:#10b981"
						class="size-8 shrink-0 md:block md:size-12"
					/>
				{:else}
					<LordIcon
						src={unsure}
						trigger="loop"
						stroke="thick"
						target="#hero"
						colors="primary:#10B981,secondary:#10b981"
						class="size-8 shrink-0 md:block md:size-12"
					/>
				{/if}
			</div>
			<h2 class="text-3xl font-bold text-white">
				{verdictText()}
			</h2>
		</div>

		<div class="mt-4 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<ShareOptions {verdict} {myth} {explanation} />
			</div>
		</div>
	</div>

	<div>
		<h3 class="mb-2 font-medium text-muted-foreground">Myth that was analyzed</h3>
		<div class="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm">
			{myth}
		</div>
	</div>
</div>
