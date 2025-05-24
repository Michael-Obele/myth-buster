<script lang="ts">
	import { Link, ExternalLink } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	// Define Citation type for better type safety
	type Citation = {
		title: string;
		url: string;
	};

	// Props using Svelte 5 syntax
	let {
		citations = []
	}: {
		citations: Citation[];
	} = $props();
</script>

<Card.Root class="w-full rounded-lg border border-primary/20">
	<Card.Header class="flex flex-row items-center justify-between rounded-t-lg px-4 py-3">
		<Card.Title class="flex items-center gap-2 text-lg">
			<Link class="h-5 w-5 text-primary" />
			Citations ({citations.length})
		</Card.Title>
	</Card.Header>
	<Card.Content class="px-4 pb-4 pt-1">
		<ScrollArea class="min-h-[30rem] rounded-md border p-4">
			<ul class="space-y-3">
				{#each citations as citation, i}
					<li
						class="flex items-start gap-3 rounded-md border border-primary/20 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
					>
						<Badge variant="outline" class="mt-0.5 h-5 flex-shrink-0 text-primary">
							{i + 1}
						</Badge>
						<div>
							<p class="font-medium">{citation.title}</p>
							<a
								href={citation.url}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center gap-1 text-sm text-primary hover:underline"
							>
								{citation.url}
								<ExternalLink class="h-3 w-3" />
							</a>
						</div>
					</li>
				{/each}
			</ul>
		</ScrollArea>
	</Card.Content>
</Card.Root>
