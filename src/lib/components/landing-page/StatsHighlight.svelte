<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Brain, Zap, BookOpen, type Icon as IconType } from '@lucide/svelte';
	import NumberTicker from '$lib/components/blocks/NumberTicker.svelte';

	interface Stat {
		icon: typeof IconType;
		value: string;
		label: string;
		description: string;
		color: string;
		bgColor: string;
		duration: number;
		direction: 'up' | 'down';
	}

	const stats: Stat[] = $state([
		{
			icon: Brain,
			value: '100%',
			label: 'Accuracy',
			description: 'Every myth is verified with reliable sources',
			color: 'text-purple-500',
			bgColor: 'bg-purple-500/10',
			direction: 'up',
			duration: 1500
		},
		{
			icon: Zap,
			value: '<2s',
			label: 'Response Time',
			description: 'Get answers almost instantly',
			color: 'text-primary',
			bgColor: 'bg-primary/10',
			direction: 'down',
			duration: 3500
		},
		{
			icon: BookOpen,
			value: '1000+',
			label: 'Myths Debunked',
			description: 'And growing every day with user contributions',
			color: 'text-red-500',
			bgColor: 'bg-red-500/10',
			direction: 'up',
			duration: 2000
		}
	]);
</script>

<section class="w-full py-12">
	<div class="mx-auto max-w-6xl px-4">
		<h2 class="mb-4 text-center font-underdog text-3xl font-bold">Myth Busting by the Numbers</h2>
		<p class="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">
			Our AI-powered platform delivers fast, accurate results to help you separate fact from
			fiction.
		</p>

		<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
			{#each stats as stat}
				<Card.Root
					class="border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:scale-105"
				>
					<Card.Header class="pb-2">
						<div class="flex items-center justify-between">
							<Badge class={stat.bgColor + ' ' + stat.color}>{stat.label}</Badge>
							<div class={stat.bgColor + ' rounded-full p-2'}>
								{#if stat.label === 'Accuracy'}
									<Brain class={'h-5 w-5 ' + stat.color} />
								{:else if stat.label === 'Response Time'}
									<Zap class={'h-5 w-5 ' + stat.color} />
								{:else}
									<BookOpen class={'h-5 w-5 ' + stat.color} />
								{/if}
							</div>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-col gap-1">
							<NumberTicker
								class="text-4xl font-bold tracking-tight"
								direction={stat.direction}
								value={stat.value}
								duration={stat.duration}
							/>
							<p class="text-sm text-muted-foreground">{stat.description}</p>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>
</section>
