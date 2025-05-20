<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { ArrowRight, Trophy, Brain, Zap } from 'lucide-svelte';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import InteractiveHover from '../blocks/InteractiveHover.svelte';
	import { goto } from '$app/navigation';

	type GameFeature = {
		title: string;
		description: string;
		type: 'knowledge' | 'gameplay' | 'progress';
	};

	const gameFeatures = $state<GameFeature[]>([
		{
			type: 'knowledge',
			title: 'Test Your Knowledge',
			description:
				'Challenge yourself with AI-generated facts and myths. Can you tell which is which?'
		},
		{
			type: 'gameplay',
			title: 'Quick Gameplay',
			description:
				'Perfect for short breaks, play for just a few minutes or challenge yourself with longer sessions.'
		},
		{
			type: 'progress',
			title: 'Track Your Progress',
			description: 'Build streaks and see how your myth-busting skills improve over time.'
		}
	]);
</script>

<section
	class="relative my-12 h-fit w-full rounded-xl bg-gradient-to-b from-slate-900 to-slate-800 py-16"
>
	<div class="absolute inset-0 bg-grid-white/[0.05]"></div>
	<div class="relative z-10 mx-auto max-w-7xl px-4">
		<div class="mb-12 text-center">
			<h2 class="mb-4 font-underdog text-4xl font-bold text-white">Challenge Your Beliefs</h2>
			<p class="mx-auto max-w-2xl text-xl text-slate-300">
				Our Myth Busting Game takes fact-checking to the next level with an interactive, engaging
				experience.
			</p>
		</div>

		<div class="grid items-center gap-12 md:grid-cols-2">
			<section class="overflow-hidden rounded-lg border border-slate-700 shadow-2xl">
				<div class="relative bg-slate-800 pb-[75%]">
					<!-- 4:3 aspect ratio -->
					<div class="absolute inset-0 flex h-full w-full flex-col items-center justify-center p-8">
						<div class="max-w-sm space-y-4 text-center">
							<div
								class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/20"
							>
								<LordIcon
									src="https://cdn.lordicon.com/lewtedlh.json"
									trigger="loop-on-hover"
									target="section"
									stroke="regular"
									state="hover-pinch"
									class="size-14"
									mobileLoop={true}
									colors="primary:white,secondary:#10B981"
								></LordIcon>
							</div>
							<h3 class="text-2xl font-bold text-white">Challenge Mode</h3>
							<p class="text-slate-300">
								Can you identify 10 myths in a row? Test your knowledge and build streaks for higher
								scores.
							</p>
							<Button href="/game" variant="default" class="mt-4">
								Play Now
								<ArrowRight class="ml-2 h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</section>

			<div class="space-y-6">
				{#each gameFeatures as feature}
					<Card.Root class="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
						<Card.Header class="flex flex-row items-start space-x-4 pb-2">
							<div class="mt-1 rounded-md bg-primary/20 p-2">
								{#if feature.type === 'knowledge'}
									<Brain class="h-5 w-5 text-primary" />
								{:else if feature.type === 'gameplay'}
									<Zap class="h-5 w-5 text-primary" />
								{:else}
									<Trophy class="h-5 w-5 text-primary" />
								{/if}
							</div>
							<div>
								<Card.Title class="text-xl text-white">{feature.title}</Card.Title>
								<Card.Description class="text-slate-300">{feature.description}</Card.Description>
							</div>
						</Card.Header>
					</Card.Root>
				{/each}

				<div class="pt-4">
					<!-- <Button
						href="/game"
						variant="outline"
						class="border-primary text-primary hover:bg-primary/20 hover:text-white"
					>
						Explore the Game
						<ArrowRight class="ml-2 h-4 w-4" />
					</Button> -->
					<InteractiveHover
						onclick={() => goto('/game')}
						class="w-72 transition-all duration-300"
						text="Explore the Game"
					/>
				</div>
			</div>
		</div>
	</div>
</section>
