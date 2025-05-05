<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Check } from 'lucide-svelte';

	// Features array
	let features = $state([
		{
			id: 'item-1',
			title: 'Myth Verification Interface',
			description:
				"Our clean, intuitive interface allows you to input any statement for verification. You'll receive a clear verdict (True, False, or Inconclusive) with comprehensive explanations and reliable sources."
		},
		{
			id: 'item-2',
			title: 'Visual & Audio Cues',
			description:
				'Engaging visual indicators show you the verdict at a glance: green check for true statements, red X for false ones, and purple question mark for inconclusive results. Optional audio cues enhance the experience.'
		},
		{
			id: 'item-3',
			title: 'Confidence Meter',
			description:
				"Test your intuition by indicating how confident you are in a statement's truth before seeing the verdict. Compare your guess with the actual result for a fun, educational experience."
		},
		{
			id: 'item-4',
			title: 'Myth Origin Stories',
			description:
				'Discover the fascinating historical and cultural origins of common myths. Understanding where misconceptions come from helps prevent their spread and deepens your knowledge.'
		}
	]);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Key Features</Card.Title>
		<Card.Description>What makes Myth Buster special</Card.Description>
	</Card.Header>
	<Card.Content>
		<Accordion.Root type="single" class="w-full">
			{#each features as feature}
				<Accordion.Item value={feature.id}>
					<Accordion.Trigger>
						<div class="flex items-center gap-2">
							<Check class="h-4 w-4 text-emerald-500" />
							<span>{feature.title}</span>
						</div>
					</Accordion.Trigger>
					<Accordion.Content>
						<p class="p-2 text-sm text-muted-foreground">
							{feature.description}
						</p>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</Card.Content>
</Card.Root>
