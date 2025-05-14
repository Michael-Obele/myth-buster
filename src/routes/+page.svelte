<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Flame, Check, X, BookOpen, ArrowRight } from 'lucide-svelte';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import SparklesText from '$lib/components/blocks/SparklesText.svelte';
	import BackgroundBoxes from '$lib/components/blocks/BackgroundBoxes.svelte';
	const attention = '/lottie/attention.json';
	const flame = '/lottie/flame.json';

	// Reactive state for animations
	let hoverState = $state({
		cta: false,
		card1: false,
		card2: false,
		card3: false
	});

	type Key = 'cta' | 'card1' | 'card2' | 'card3';

	// Function to toggle hover state
	function toggleHover(key: Key, value: boolean) {
		hoverState[key] = value;
	}

	// Generate random particles for the floating elements
	const particles = $state(
		Array.from({ length: 15 }, () => ({
			size: Math.random() * 6 + 2,
			left: Math.random() * 100,
			top: Math.random() * 100,
			opacity: Math.random() * 0.5 + 0.3,
			duration: Math.random() * 10 + 15,
			delay: -Math.random() * 15
		}))
	);

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

	const howItWorksSteps = [
		{
			number: 1,
			title: 'Enter Your Myth',
			color: 'bg-primary text-white',
			ring: 'ring-white dark:ring-gray-900',
			iconBg: 'bg-primary dark:bg-blue-900',
			titleColor: 'text-primary',
			description: 'Type in any statement, claim, or myth you want to verify into the input field.'
		},
		{
			number: 2,
			title: 'AI Analysis',
			color: 'bg-purple-500 text-white',
			ring: 'ring-white dark:ring-gray-900',
			iconBg: 'bg-purple-500 dark:bg-blue-900',
			titleColor: 'text-purple-500',
			description:
				'Our AI, powered by the Sonar API, analyzes the statement using advanced research and reliable sources.'
		},
		{
			number: 3,
			title: 'Get Results',
			color: 'bg-emerald-500 text-white',
			ring: 'ring-white dark:ring-gray-900',
			iconBg: 'bg-emerald-500 dark:bg-blue-900',
			titleColor: 'text-emerald-500',
			description:
				'Receive a detailed verdict (True/False/Inconclusive) with explanations and verifiable citations.'
		}
	];
</script>

<!-- Animated background with grid pattern -->
<div class="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
	<!-- Grid pattern overlay -->
	<div class="absolute inset-0 bg-grid-black/[0.07] dark:bg-grid-white/[0.05]"></div>
	<!-- Background boxes for additional visual effect -->
	<BackgroundBoxes
		className="opacity-50"
		boxClassName="border border-slate-700/20"
		pattern="grid"
		patternColor="slate-700"
		quantity={15}
	>
		<!-- Main content -->
		<main
			class="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 text-foreground"
		>
			<!-- Hero section -->
			<section class="mb-16 flex flex-col items-center text-center">
				<div class="flex items-end">
					<div class="mb-6 flex items-center gap-3">
						<LordIcon
							src={attention}
							trigger="loop"
							stroke="thick"
							target="section"
							state="hover-draw"
							class="relative top-10 mb-10 size-20 text-muted-foreground transition-colors hover:text-primary sm:mx-2"
							colors="primary:white"
						/>

						<LordIcon
							src={flame}
							trigger="loop-on-hover"
							stroke="thick"
							target="div"
							class="size-16 font-extrabold text-primary sm:mx-2"
							state="hover-draw"
							colors="primary:#10B981,secondary:white"
						/>
						<a href="/app">
							<SparklesText
								text="Myth Buster"
								class="font-serif text-5xl font-bold tracking-tight text-primary md:text-6xl"
							/>
						</a>

						<Badge class="bg-primary/20 text-primary hover:text-white">AI Powered</Badge>
					</div>
				</div>

				<p class="mb-8 max-w-2xl text-center text-xl leading-loose text-muted-foreground">
					<span class="text-2xl font-semibold text-primary">Uncover</span>
					the
					<span class="handwritten-underline relative z-10 text-2xl font-semibold text-primary"
						>truth</span
					>
					behind common
					<span
						class="mx-2 bg-gradient-to-r from-purple-500 to-emerald-500 bg-clip-text text-2xl font-semibold tracking-wide text-transparent"
						>myths</span
					>
					and misconceptions with our AI-powered myth-busting tool. Leveraging the Sonar API, we provide
					detailed explanations, reliable sources, and aim to help you separate fact from fiction.
				</p>

				<!-- Animated CTA button wrapper -->
				<div
					class="relative"
					tabindex="0"
					role="button"
					onmouseenter={() => toggleHover('cta', true)}
					onmouseleave={() => toggleHover('cta', false)}
				>
					<div
						class="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-purple-600 via-primary to-emerald-600 opacity-70 blur transition duration-1000"
						class:opacity-100={hoverState.cta}
						class:scale-105={hoverState.cta}
					></div>
					<Button
						href="/app"
						class="relative flex items-center gap-2 rounded-lg px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105"
					>
						Start Busting Myths
						<ArrowRight class="h-5 w-5" />
					</Button>
				</div>
			</section>

			<!-- Feature cards -->

			<!-- Mobile Timeline (visible on mobile only) -->
			<ol class="relative block border-s border-gray-200 dark:border-gray-700 md:hidden">
				{#each featureCards as card (card.title)}
					<li class="mb-10 ms-6">
						<span
							class="absolute flex h-6 w-6 items-center justify-center {card.iconBg} -start-3 rounded-full ring-8 ring-white dark:ring-gray-900"
						>
							{#if card.icon}
								<card.icon class="h-2.5 w-2.5 {card.iconColor}" />
							{/if}
						</span>
						<h3 class="mb-1 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
							{card.title}
						</h3>
						<p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
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
						onmouseenter={() => toggleHover(card.hoverKey, true)}
						onmouseleave={() => toggleHover(card.hoverKey, false)}
					>
						<div
							class={`absolute -inset-0.5 rounded-xl ${card.gradient} opacity-0 blur transition duration-300 group-hover:opacity-70`}
							class:opacity-50={hoverState[card.hoverKey]}
						></div>
						<Card.Root
							class={`relative h-full overflow-hidden rounded-xl border-2 ${card.border} bg-background/80 backdrop-blur`}
						>
							<Card.Header class="pb-4">
								<div
									class={`mb-2 flex h-12 w-12 items-center justify-center rounded-full ${card.iconBg}`}
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

			<!-- How it works section -->

			<div id="how-it-works" class="mt-20 w-full max-w-4xl scroll-mt-14">
				<h2 class="mb-8 text-center font-serif text-3xl font-bold">How It Works</h2>

				<!-- Mobile Timeline (block md:hidden) -->
				<ol class="relative block border-s border-gray-200 dark:border-gray-700 md:hidden">
					{#each howItWorksSteps as step}
						<li class="mb-10 ms-6">
							<span
								class={`absolute flex h-6 w-6 items-center justify-center ${step.iconBg} -start-3 rounded-full ${step.ring} ${step.color}`}
							>
								<span class="font-bold">{step.number}</span>
							</span>
							<h3 class={`mb-1 text-lg font-semibold dark:text-white ${step.titleColor}`}>
								{step.title}
							</h3>
							<p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">
								{step.description}
							</p>
						</li>
					{/each}
				</ol>

				<!-- Desktop Timeline (hidden on mobile) -->
				<div class="relative hidden md:block">
					<!-- Timeline line -->
					<div
						class="absolute left-1/2 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-purple-500 to-emerald-500"
					></div>
					{#each howItWorksSteps as step, i}
						<div class="relative mb-12 flex flex-col md:flex-row">
							<div class={`flex-1 pb-8 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
								{#if i % 2 === 0}
									<h3 class={`mb-2 text-xl font-bold ${step.titleColor}`}>
										{step.number}. {step.title}
									</h3>
									<p class="text-muted-foreground">{step.description}</p>
								{/if}
							</div>
							<div
								class="absolute left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full {step.color}"
							>
								{step.number}
							</div>
							<div class={`flex-1 pb-8 ${i % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`}>
								{#if i % 2 !== 0}
									<h3 class={`mb-2 text-xl font-bold ${step.titleColor}`}>
										{step.number}. {step.title}
									</h3>
									<p class="text-muted-foreground">{step.description}</p>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Final CTA -->
			<div class="mt-16 text-center">
				<p class="mb-6 text-xl text-muted-foreground">Ready to separate fact from fiction?</p>
				<Button
					href="/app"
					variant="outline"
					class="border-primary px-8 py-4 text-lg text-primary hover:bg-primary/80"
				>
					Start Busting Myths Now
				</Button>
			</div>
		</main>
	</BackgroundBoxes>
</div>

<style>
	@keyframes float {
		0% {
			transform: translateY(0) translateX(0);
		}
		50% {
			transform: translateY(-20px) translateX(10px);
		}
		100% {
			transform: translateY(0) translateX(0);
		}
	}

	.floating-particle {
		animation-name: float;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		position: absolute;
	}

	.handwritten-underline {
		/* Use an SVG as a background image with two wavy lines */
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"><path d="M0,5 L5,4 L10,6 L15,5 L20,5" stroke="green" fill="none"/><path d="M0,8 L5,7 L10,9 L15,8 L20,8" stroke="green" fill="none"/></svg>');

		/* Repeat the background image horizontally */
		background-repeat: repeat-x;

		/* Position the background at the bottom of the element */
		background-position: bottom;

		/* Add padding below the text to make space for the underline */
		padding-bottom: 10px;
	}
</style>
