<script lang="ts">
	import { Check, Search, FileText } from '@lucide/svelte';
	import FeatureCard from '$lib/components/blocks/FeatureCard.svelte';

	const cycle = '/lottie/cycle.json';
	const press = '/lottie/press.json';
	const privacy = '/lottie/privacy.json';

	// Using $state for reactivity in Svelte 5
	const howItWorksData = $state([
		{
			id: 1,
			title: 'Enter Your Myth',
			content: 'Type in any statement, claim, or myth you want to verify into the input field.',
			image: press,
			icon: Search
		},
		{
			id: 2,
			title: 'AI Analysis',
			content: 'Our AI analyzes the statement using advanced research and reliable sources.',
			image: cycle,
			icon: FileText
		},
		{
			id: 3,
			title: 'Get Results',
			content:
				'Receive a detailed verdict (True/False/Inconclusive) with explanations and verifiable citations.',
			image: privacy,
			icon: Check
		}
	]);
</script>

<section class="w-full py-16">
	<div class="mx-auto max-w-6xl px-4">
		<h2 class="mb-12 text-center font-underdog text-3xl font-bold md:text-4xl">How It Works</h2>

		<FeatureCard data={howItWorksData} />

		<!-- Mobile view: vertical steps -->
		<div class="space-y-8 md:hidden">
			{#each howItWorksData as step, i}
				<div class="flex items-start space-x-4">
					<div class="shrink-0">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
						>
							{i + 1}
						</div>
					</div>
					<div>
						<h3 class="text-xl font-semibold">{step.title}</h3>
						<p class="mt-2 text-muted-foreground">{step.content}</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- Desktop view: horizontal connected steps -->
		<div class="hidden grid-cols-3 gap-4">
			{#each howItWorksData as step, i}
				<div class="relative rounded-lg border bg-card p-6">
					{#if i > 0}
						<!-- Connector line -->
						<div class="absolute -left-4 top-1/2 h-0.5 w-4 bg-muted-foreground/30"></div>
					{/if}
					<div class="flex flex-col items-center text-center">
						<div
							class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white"
						>
							{#if step.title === 'Enter Your Myth'}
								<Search class="h-7 w-7" />
							{:else if step.title === 'AI Analysis'}
								<FileText class="h-7 w-7" />
							{:else}
								<Check class="h-7 w-7" />
							{/if}
						</div>
						<h3 class="mb-2 text-xl font-semibold">{step.title}</h3>
						<p class="text-muted-foreground">{step.content}</p>
					</div>
				</div>
			{/each}

			<!-- Connection line between steps -->
			<!-- <div class="relative mt-8 hidden md:block">
				<div
					class="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-primary via-purple-500 to-emerald-500"
				></div>
			</div> -->
		</div>
	</div>
</section>
