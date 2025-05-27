<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		BookOpen,
		Brain,
		ChevronLeftIcon,
		FlaskConical,
		Globe,
		Laptop,
		Palette,
		Scale,
		ScrollText,
		Video,
		type Icon as IconType
	} from '@lucide/svelte';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';

	let { data }: { data: PageData } = $props();

	const iconMap: Record<string, typeof IconType> = {
		BookOpen,
		Brain,
		FlaskConical,
		Globe,
		Laptop,
		Palette,
		Scale,
		ScrollText,
		Video,
		Default: BookOpen // Fallback icon
	};

	// Map track categories to icon names
	const categoryIconMap: Record<string, string> = {
		Science: 'FlaskConical',
		History: 'ScrollText',
		Technology: 'Laptop',
		'Arts & Culture': 'Palette',
		Geography: 'Globe',
		Society: 'Scale',
		Psychology: 'Brain',
		Entertainment: 'Video',
		Literature: 'BookOpen'
		// Add more mappings as needed based on your track categories
	};

	function getDifficultyClass(difficulty: 'easy' | 'medium' | 'hard' | undefined) {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-500/20 text-green-400 border-green-500/50';
			case 'medium':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
			case 'hard':
				return 'bg-red-500/20 text-red-400 border-red-500/50';
			default:
				return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
		}
	}
</script>

<RouteHead
	title="Learning Tracks - Myth Buster"
	description="Choose a learning track and test your knowledge on specific topics."
	keywords={['learning tracks', 'quiz', 'knowledge test', 'myth buster', 'education', 'topics']}
	author="Myth Buster Team"
	ogTitle="Learning Tracks - Myth Buster"
	ogDescription="Choose a learning track and test your knowledge on specific topics."
	ogType="website"
	ogSiteName="Myth Buster"
	ogLocale="en_US"
	robots="index, follow"
	twitterCard="summary_large_image"
	twitterTitle="Learning Tracks - Myth Buster"
	twitterDescription="Choose a learning track and test your knowledge on specific topics."
/>

<div class="container mx-auto min-h-screen max-w-5xl px-4 py-8 text-white">
	<div class="mb-8 text-center">
		<h1 class="text-4xl font-bold tracking-tight">Learning Tracks</h1>
		<p class="text-muted-foreground mt-2 text-lg">
			Deepen your knowledge by tackling themed myth challenges.
		</p>
	</div>

	{#if data.tracks && data.tracks.length > 0}
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.tracks as track (track.id)}
				{@const iconName = categoryIconMap[track.category] || 'Default'}
				{@const Icon = iconMap[iconName]}
				<Card.Root
					class="border-border/50 bg-card/80 hover:shadow-primary/30 flex flex-col overflow-hidden shadow-lg transition-all"
				>
					<Card.Header class="flex flex-row items-start gap-4 space-y-0 p-4 pb-3">
						<div
							class="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg"
						>
							<Icon class="h-6 w-6" />
						</div>
						<div class="flex-1">
							<Card.Title class="group-hover:text-primary text-lg font-semibold">
								{track.title}
							</Card.Title>
							<div class="mt-1 flex items-center gap-2">
								<Badge variant="secondary" class="text-xs">{track.category}</Badge>
								<Badge variant="outline" class="text-xs {getDifficultyClass(track.difficulty)}">
									{track.difficulty.charAt(0).toUpperCase() + track.difficulty.slice(1)}
								</Badge>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="flex-1 p-4 pt-0">
						<p class="text-muted-foreground text-sm">{track.description}</p>
					</Card.Content>
					<Card.Footer class="p-4 pt-2">
						<Button
							href={`/tracks/${track.id}?title=${encodeURIComponent(track.title)}&category=${encodeURIComponent(track.category)}&difficulty=${track.difficulty}&totalMyths=${track.totalMyths || 0}&icon=${encodeURIComponent(track.icon || 'BookOpen')}`}
							class="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
						>
							Start Track ({track.totalMyths || 0} Myths)
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<div class="mt-16 flex flex-col items-center justify-center text-center">
			<BookOpen class="text-muted-foreground mb-4 h-16 w-16" />
			<h2 class="text-2xl font-semibold">No Learning Tracks Available Yet</h2>
			<p class="text-muted-foreground mt-2">Please check back later as we add new challenges!</p>
			<Button href="/game" variant="outline" class="mt-6">Back to Main Game</Button>
		</div>
	{/if}

	<div class="mt-12 text-center">
		<Button href="/game" variant="outline" class="text-primary">
			<ChevronLeftIcon />
			Back to Random Game Mode</Button
		>
	</div>
</div>
