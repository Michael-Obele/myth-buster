<script lang="ts">
	import { animate } from 'svelte-motion';
	import { ArrowRight } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	// Props using Svelte 5 syntax
	let {
		mythText = ''
	}: {
		mythText: string;
	} = $props();

	// Define the type for our myth items
	type RelatedMyth = {
		text: string;
		category: 'health' | 'science' | 'history' | string;
	};

	// This would typically come from an API based on the current myth
	// For now, we'll use some static examples
	const relatedMyths: RelatedMyth[] = [
		{
			text: 'Does eating carrots improve your eyesight?',
			category: 'health'
		},
		{
			text: 'Can you see the Great Wall of China from space?',
			category: 'science'
		},
		{
			text: 'Does cracking your knuckles cause arthritis?',
			category: 'health'
		},
		{
			text: 'Do we only use 10% of our brain?',
			category: 'science'
		}
	];

	// Container ref for animations
	let container: HTMLElement;

	// Animate myths with staggered reveal
	function animateItems(): void {
		if (!container) return;

		const items = Array.from(container.querySelectorAll<HTMLElement>('.myth-item'));
		items.forEach((item, i) => {
			const delay = i * 100; // Staggered delay

			// Run the animation with properly typed parameters
			animate(item, 
				{ x: [15, 0], opacity: [0, 1] } as any, 
				{ delay, duration: 0.4 }
			);
		});
	}

	// Setup animation on mount
	onMount(() => {
		if (container) {
			setTimeout(animateItems, 400);
		}
	});

	// Get category color
	function getCategoryColor(category: RelatedMyth['category']): string {
		switch (category) {
			case 'health':
				return 'bg-emerald-500/20 text-emerald-500';
			case 'science':
				return 'bg-blue-500/20 text-blue-500';
			case 'history':
				return 'bg-amber-500/20 text-amber-500';
			default:
				return 'bg-primary/20 text-primary';
		}
	}
</script>

<div class="rounded-lg border border-primary/20 p-4">
	<h3 class="mb-3 text-lg font-medium">Related Myths</h3>

	<div class="space-y-3" bind:this={container}>
		{#each relatedMyths as myth, i}
			<div class="myth-item opacity-0">
				<div
					class="flex items-start justify-between rounded-md border border-primary/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
				>
					<div class="flex flex-col gap-2">
						<p class="font-medium">{myth.text}</p>
						<Badge variant="outline" class={`w-fit ${getCategoryColor(myth.category)}`}>
							{myth.category}
						</Badge>
					</div>
					<form method="POST" action="/app?/verifyMyth" class="inline-flex">
						<input type="hidden" name="myth" value={myth.text} />
						<Button variant="ghost" size="sm" type="submit" aria-label="Verify myth">
							<ArrowRight class="h-4 w-4" />
						</Button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>
