<script lang="ts">
	import { animate } from 'svelte-motion';
	import { ArrowRight } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { onMount } from 'svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	// Props using Svelte 5 syntax
	let {
		relatedMyth = ''
	}: {
		relatedMyth: string;
	} = $props();
</script>

<div class="rounded-lg border border-primary/20 p-4">
	<h3 class="mb-3 text-lg font-medium">Related Myth</h3>

	<ScrollArea class="min-h-[30rem] rounded-md border p-4">
		<div class="space-y-3">
			{#if relatedMyth}
				<div class="myth-item">
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
	</ScrollArea>
</div>
