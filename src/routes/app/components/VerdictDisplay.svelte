<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'svelte-motion';
	import { Check, X, HelpCircle, Share2 } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	// Props using Svelte 5 syntax
	let {
		verdict = '',
		myth = ''
	}: {
		verdict: string;
		myth: string;
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
					<Check class="h-6 w-6" />
				{:else if verdict === 'false'}
					<X class="h-6 w-6" />
				{:else}
					<HelpCircle class="h-6 w-6" />
				{/if}
			</div>
			<h2 class="text-3xl font-bold text-white">
				{verdictText()}
			</h2>
		</div>

		<div class="mt-4 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<Button
					variant="ghost"
					size="sm"
					class="gap-2 text-sm text-muted-foreground hover:text-primary"
				>
					<Share2 class="h-4 w-4" />
					Share
				</Button>
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
