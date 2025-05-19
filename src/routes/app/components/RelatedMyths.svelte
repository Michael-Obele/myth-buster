<script lang="ts">
	import { animate } from 'svelte-motion';
	import { ArrowRight } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';

	// Props using Svelte 5 syntax
	let {
		relatedMyth = ''
	}: {
		relatedMyth: string;
	} = $props();

	// Container ref for animations (keeping for now, might remove if not needed)
	let container: HTMLElement;

	// Animate the item if it exists
	function animateItem(): void {
		if (!container) return;

		const item = container.querySelector<HTMLElement>('.myth-item');
		if (item) {
			// Run the animation with properly typed parameters
			animate(item, { x: [15, 0], opacity: [0, 1] } as any, { duration: 0.4 });
		}
	}

	// Setup animation on mount or when relatedMyth changes
	$effect(() => {
		if (container && relatedMyth) {
			setTimeout(animateItem, 100); // Small delay to ensure element is rendered
		}
	});
</script>

<div class="rounded-lg border border-primary/20 p-4">
	<h3 class="mb-3 text-lg font-medium">Related Myth</h3>

	<div class="space-y-3" bind:this={container}>
		{#if relatedMyth}
			<div class="myth-item opacity-0">
				<div
					class="flex items-start justify-between rounded-md border border-primary/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
				>
					<div class="flex flex-col gap-2">
						<p class="font-medium">{relatedMyth}</p>
						<!-- Category badge removed as we only have a string -->
					</div>
					<form method="POST" action="/app?/verifyMyth" class="inline-flex">
						<input type="hidden" name="myth" value={relatedMyth} />
						<Button variant="ghost" size="sm" type="submit" aria-label="Verify myth">
							<ArrowRight class="h-4 w-4" />
						</Button>
					</form>
				</div>
			</div>
		{:else}
			<p class="text-muted-foreground">No related myth provided.</p>
		{/if}
	</div>
</div>
