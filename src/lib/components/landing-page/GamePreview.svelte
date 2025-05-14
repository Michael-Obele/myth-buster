<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowRight, Trophy, Brain, Zap } from 'lucide-svelte';

	type GameFeature = {
		title: string;
		description: string;
		type: 'knowledge' | 'gameplay' | 'progress';
	};

	const gameFeatures = $state<GameFeature[]>([
		{
			type: 'knowledge',
			title: 'Test Your Knowledge',
			description: 'Challenge yourself with AI-generated facts and myths. Can you tell which is which?'
		},
		{
			type: 'gameplay',
			title: 'Quick Gameplay',
			description: 'Perfect for short breaks, play for just a few minutes or challenge yourself with longer sessions.'
		},
		{
			type: 'progress',
			title: 'Track Your Progress',
			description: 'Build streaks and see how your myth-busting skills improve over time.'
		}
	]);
</script>

<section class="py-16 w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl my-12 relative overflow-hidden">
	<div class="absolute inset-0 bg-grid-white/[0.05]"></div>
	<div class="relative z-10 max-w-7xl mx-auto px-4">
		<div class="text-center mb-12">
			<h2 class="text-4xl font-bold font-serif mb-4 text-white">Challenge Your Beliefs</h2>
			<p class="text-xl text-slate-300 max-w-2xl mx-auto">
				Our Myth Busting Game takes fact-checking to the next level with an interactive, engaging experience.
			</p>
		</div>

		<div class="grid md:grid-cols-2 gap-12 items-center">
			<div class="rounded-lg overflow-hidden shadow-2xl border border-slate-700">
				<div class="relative pb-[75%] bg-slate-800"> <!-- 4:3 aspect ratio -->
					<div class="absolute inset-0 p-8 flex flex-col h-full w-full justify-center items-center">
						<div class="text-center space-y-4 max-w-sm">
							<div class="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
								<Trophy class="w-10 h-10 text-primary" />
							</div>
							<h3 class="text-2xl font-bold text-white">Challenge Mode</h3>
							<p class="text-slate-300">
								Can you identify 10 myths in a row? Test your knowledge and build streaks for higher scores.
							</p>
							<Button href="/game" variant="default" class="mt-4">
								Play Now
								<ArrowRight class="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-6">
				{#each gameFeatures as feature}
					<Card.Root class="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
						<Card.Header class="flex flex-row items-start space-x-4 pb-2">
							<div class="mt-1 bg-primary/20 p-2 rounded-md">
								{#if feature.type === 'knowledge'}
									<Brain class="h-5 w-5 text-primary" />
								{:else if feature.type === 'gameplay'}
									<Zap class="h-5 w-5 text-primary" />
								{:else}
									<Trophy class="h-5 w-5 text-primary" />
								{/if}
							</div>
							<div>
								<Card.Title class="text-white text-xl">{feature.title}</Card.Title>
								<Card.Description class="text-slate-300">{feature.description}</Card.Description>
							</div>
						</Card.Header>
					</Card.Root>
				{/each}
				
				<div class="pt-4">
					<Button href="/game" variant="outline" class="border-primary text-primary hover:bg-primary/20">
						Explore the Game
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
