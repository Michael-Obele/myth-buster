<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Flame, Check, X, BookOpen, ArrowRight } from 'lucide-svelte';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import SparklesText from '$lib/components/blocks/SparklesText.svelte';
	import BackgroundBoxes from '$lib/components/blocks/BackgroundBoxes.svelte';

	// Import our new landing page components
	import EnhancedHero from '$lib/components/landing-page/EnhancedHero.svelte';
	import AlternatingFeature from '$lib/components/landing-page/AlternatingFeature.svelte';
	import GamePreview from '$lib/components/landing-page/GamePreview.svelte';
	import HowItWorks from '$lib/components/landing-page/HowItWorks.svelte';
	import StatsHighlight from '$lib/components/landing-page/StatsHighlight.svelte';
	import Globe from '$lib/components/blocks/Globe.svelte';

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

	// Content for alternating features
	const featureContent = $state([
		{
			title: 'Verify Any Claim Instantly',
			description:
				"Our AI-powered analysis can verify any statement in seconds, providing a definitive verdict with supporting evidence. Whether it's a viral social media post or a surprising 'fact' you heard, we've got you covered.",
			imgSrc:
				'https://images.unsplash.com/photo-1661956602944-249bcd04b63f?q=80&w=1470&auto=format&fit=crop',
			imgAlt: 'AI analyzing data visualization',
			reversed: false
		},
		{
			title: 'Learn the Origins of Common Myths',
			description:
				'Beyond just fact-checking, discover where popular myths originated and how they became widespread. Understanding the history of misinformation helps prevent its future spread.',
			imgSrc:
				'https://images.unsplash.com/photo-1616526596850-1285b9f0e9b8?q=80&w=1528&auto=format&fit=crop',
			imgAlt: 'Ancient myths depicted in art',
			reversed: true
		}
	]);

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
			<!-- Enhanced Hero Section (using component) -->
			<EnhancedHero />

			<!-- Stats Highlight Section -->
			<StatsHighlight />

			<!-- Mobile Timeline (visible on mobile only) -->
			<ol class="relative block border-s border-gray-200 dark:border-gray-700 md:hidden">
				{#each featureCards as card (card.title)}
					<li class="mb-10 ms-6">
						<span
							class="absolute -start-3 mt-1.5 flex h-10 w-10 items-center justify-center rounded-full shadow-md {card.iconBg}"
						>
							{#if card.icon}
								<svelte:component this={card.icon} class={`h-4 w-4 ${card.iconColor}`} />
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
						on:mouseenter={() => toggleHover(card.hoverKey, true)}
						on:mouseleave={() => toggleHover(card.hoverKey, false)}
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
										<svelte:component this={card.icon} class={`h-6 w-6 ${card.iconColor}`} />
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

			<!-- First Alternating Feature Section -->
			{#each featureContent as content, index}
				<AlternatingFeature
					title={content.title}
					description={content.description}
					imgSrc={content.imgSrc}
					imgAlt={content.imgAlt}
					reversed={content.reversed}
					className="mt-24"
				>
					{#if index === 0}
						<Button href="/app" variant="outline" class="mt-4 border-primary text-primary">
							Try it yourself <ArrowRight class="ml-2 h-4 w-4" />
						</Button>
					{/if}
				</AlternatingFeature>
			{/each}

			<!-- Game Preview Section -->
			<GamePreview />

			<!-- New How It Works Section with Resizable Component -->
			<HowItWorks />

			<div class="flex h-[80vh] w-full items-center justify-center">
				<div
					class="relative flex h-fit w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg border bg-background px-40 pb-40 pt-8 md:pb-60 md:shadow-xl"
				>
					<span
						class="pointer-events-none select-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10"
					>
						Globe
					</span>
					<Globe class="top-28" />
					<div
						class="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]"
					></div>
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
