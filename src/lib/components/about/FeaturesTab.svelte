<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import type { ComponentType } from 'svelte';

	// Define prop type
	type Feature = {
		title: string;
		description: string;
		icon: ComponentType;
		priority: 'core' | 'important' | 'nice';
	};

	// Define prop
	const { features } = $props<{ features: Feature[] }>();

	// Group features by priority
	let coreFeatures: Feature[] = $derived(features.filter((f: Feature) => f.priority === 'core'));
	let importantFeatures: Feature[] = $derived(features.filter((f: Feature) => f.priority === 'important'));
	let niceToHaveFeatures: Feature[] = $derived(features.filter((f: Feature) => f.priority === 'nice'));

	const priorityOrder = ['core', 'important', 'nice'];

	let groupedFeatures = $derived(
		priorityOrder.map((priority) => ({
			priorityLabel:
				priority === 'core'
					? 'Core Features'
					: priority === 'important'
						? 'Important Enhancements'
						: 'Nice-to-Have Features',
			priorityKey: priority,
			items: features.filter((f: Feature) => f.priority === priority)
		}))
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Key Features</Card.Title>
		<Card.Description>What makes Myth Buster special, organized by priority.</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		{#each groupedFeatures as group (group.priorityKey)}
			{#if group.items.length > 0}
				<div>
					<h3 class="mb-3 text-lg font-semibold text-primary">{group.priorityLabel}</h3>
					<Accordion.Root type="single" class="w-full">
						{#each group.items as feature, i (feature.title)}
							<Accordion.Item value={`${group.priorityKey}-item-${i}`}>
					<Accordion.Trigger>
						<div class="flex items-center gap-2">
							{#key feature.icon}
								<feature.icon class="h-4 w-4 text-primary" />
							{/key}
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
				</div>
			{/if}
		{/each}
	</Card.Content>
</Card.Root>
