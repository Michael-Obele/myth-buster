<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Check, X, BookOpen } from '@lucide/svelte';

	const featureCards: {
		hoverKey: Key;
		gradient: string;
		border: string;
		icon: any; // Using any for Svelte component type
		iconBg: string;
		iconColor: string;
		title: string;
		description: string;
		samplePrefix: string;
		samplePrefixColor: string;
		sampleText: string;
	}[] = [
		{
			hoverKey: 'card1',
			gradient: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
			border: 'border-emerald-500/30',
			icon: Check,
			iconBg: 'bg-emerald-500/20',
			iconColor: 'text-emerald-500',
			title: 'Verify Myths',
			description:
				'Input any statement or myth and get an accurate verdict (True/False/Inconclusive) backed by reliable sources from the Sonar API.',
			samplePrefix: 'True:',
			samplePrefixColor: 'text-emerald-500',
			sampleText: 'Bulls are colorblind and react to movement, not the color red.'
		},
		{
			hoverKey: 'card2',
			gradient: 'bg-gradient-to-r from-red-600 to-red-400',
			border: 'border-red-500/30',
			icon: X,
			iconBg: 'bg-red-500/20',
			iconColor: 'text-red-500',
			title: 'Debunk Falsehoods',
			description:
				'Get detailed explanations that correct misconceptions with factual information and citations.',
			samplePrefix: 'False:',
			samplePrefixColor: 'text-red-500',
			sampleText:
				'We only use 10% of our brain. This is a common misconception with no scientific basis.'
		},
		{
			hoverKey: 'card3',
			gradient: 'bg-gradient-to-r from-purple-600 to-purple-400',
			border: 'border-purple-500/30',
			icon: BookOpen,
			iconBg: 'bg-purple-500/20',
			iconColor: 'text-purple-500',
			title: 'Explore Origins',
			description:
				'If available, learn where myths originated and how they became part of popular culture, supported by sources.',
			samplePrefix: 'Origin:',
			samplePrefixColor: 'text-purple-500',
			sampleText:
				'The myth about carrots improving night vision was British propaganda during WWII.'
		}
	];

	type Key = 'cta' | 'card1' | 'card2' | 'card3';
	function isKey(key: unknown): key is Key {
		return key === 'cta' || key === 'card1' || key === 'card2' || key === 'card3';
	}

	// Reactive state for animations
	let hoverState = $state({
		cta: false,
		card1: false,
		card2: false,
		card3: false
	});

	// Function to toggle hover state
	function toggleHover(key: Key, value: boolean) {
		hoverState[key] = value;
	}
</script>

<!-- Mobile Timeline (visible on mobile only) -->
<ol class="relative block border-s-2 border-gray-200 dark:border-gray-700 md:hidden">
	{#each featureCards as card (card.title)}
		<li class="mb-10 ms-7">
			<span
				class="absolute -start-5 mt-1.5 flex size-10 items-center justify-center rounded-full shadow-md {card.iconBg}"
			>
				{#if card.icon}
					<card.icon class={`size-4 ${card.iconColor}`} />
				{/if}
			</span>
			<h3 class="mb-1 text-lg font-semibold">{card.title}</h3>
			<p class="mb-4 text-base font-normal text-muted-foreground">
				{card.description}
			</p>
			<div class="rounded-lg bg-muted/50 p-3 text-sm">
				<span class={`font-mono ${card.samplePrefixColor}`}>{card.samplePrefix}</span>
				{card.sampleText}
			</div>
		</li>
	{/each}
</ol>

<!-- Desktop Grid (hidden on mobile) -->
<div class="hidden w-full max-w-5xl grid-cols-1 gap-8 md:grid md:grid-cols-3">
	{#each featureCards as card (card.title)}
		<div
			class="group relative transition-all duration-300 hover:scale-105"
			role="group"
			onmouseenter={() => isKey(card.hoverKey) && toggleHover(card.hoverKey, true)}
			onmouseleave={() => isKey(card.hoverKey) && toggleHover(card.hoverKey, false)}
		>
			<!-- Gradient backdrop (visible on hover) -->
			<div
				class="absolute inset-0 -z-10 rounded-xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-70 {card.gradient}"
			></div>

			<Card.Root
				class={`h-full border transition-all duration-300 ${
					hoverState[card.hoverKey] ? card.border : 'border-border/50'
				}`}
			>
				<Card.Header>
					<div
						class={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg shadow-sm ${card.iconBg}`}
					>
						{#if card.icon}
							<card.icon class={`h-6 w-6 ${card.iconColor}`} />
						{/if}
					</div>
					<Card.Title class="text-xl font-bold">{card.title}</Card.Title>
					<Card.Description>
						{card.description}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="rounded-lg bg-muted/50 p-3 text-sm">
						<span class={`font-mono ${card.samplePrefixColor}`}>{card.samplePrefix}</span>
						{card.sampleText}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/each}
</div>
