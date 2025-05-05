<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Flame, Check, X, BookOpen, ArrowRight } from 'lucide-svelte';
	import SparklesText from '$lib/components/SparklesText.svelte';

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
</script>

<!-- Animated background with particles and gradient -->
<div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
	<!-- Animated particles -->
	<div class="absolute inset-0 z-0">
		<div
			class="absolute h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/20 blur-3xl"
		></div>
		<div
			class="absolute bottom-0 right-0 h-[30rem] w-[30rem] translate-x-1/3 translate-y-1/4 rounded-full bg-emerald-500/20 blur-3xl"
		></div>
		<div
			class="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/20 blur-3xl"
		></div>
	</div>

	<!-- Floating elements -->
	<div class="absolute inset-0 z-0 opacity-30">
		{#each particles as particle, i}
			<div
				class="floating-particle"
				style="
					width: {particle.size}px; 
					height: {particle.size}px; 
					left: {particle.left}%; 
					top: {particle.top}%; 
					opacity: {particle.opacity};
					animation-duration: {particle.duration}s;
					animation-delay: {particle.delay}s;
				"
			></div>
		{/each}
	</div>

	<!-- Main content -->
	<main
		class="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16 text-foreground"
	>
		<!-- Hero section -->
		<div class="mb-16 flex flex-col items-center text-center">
			<div class="mb-6 flex items-center gap-3">
				<Flame class="h-10 w-10 animate-pulse text-primary" />
				<SparklesText
					text="Myth Buster"
					class="font-serif text-5xl font-bold tracking-tight text-primary md:text-6xl"
				/>

				<Badge class="bg-primary/20 text-primary">AI Powered</Badge>
			</div>

			<p class="mb-8 max-w-2xl text-center text-xl text-muted-foreground">
				Uncover the truth behind common myths and misconceptions with our AI-powered myth-busting
				tool. Get detailed explanations, reliable sources, and learn the origins of popular myths.
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
		</div>

		<!-- Feature cards -->
		<div class="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
			<!-- Card 1: Verify Myths -->
			<div
				class="group relative transition-all duration-300 hover:scale-105"
				role="group"
				onmouseenter={() => toggleHover('card1', true)}
				onmouseleave={() => toggleHover('card1', false)}
			>
				<div
					class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-400 opacity-0 blur transition duration-300 group-hover:opacity-70"
					class:opacity-50={hoverState.card1}
				></div>
				<Card.Root
					class="relative h-full overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-background/80 backdrop-blur"
				>
					<Card.Header class="pb-4">
						<div
							class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20"
						>
							<Check class="h-6 w-6 text-emerald-500" />
						</div>
						<Card.Title class="text-xl font-bold">Verify Myths</Card.Title>
						<Card.Description>
							Input any statement or myth and get an accurate verdict backed by reliable sources.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="rounded-lg bg-muted/50 p-3 text-sm">
							<span class="font-mono text-emerald-500">True:</span> Bulls are colorblind and react to
							movement, not the color red.
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Card 2: Debunk Falsehoods -->
			<div
				class="group relative transition-all duration-300 hover:scale-105"
				role="group"
				onmouseenter={() => toggleHover('card2', true)}
				onmouseleave={() => toggleHover('card2', false)}
			>
				<div
					class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-600 to-red-400 opacity-0 blur transition duration-300 group-hover:opacity-70"
					class:opacity-50={hoverState.card2}
				></div>
				<Card.Root
					class="relative h-full overflow-hidden rounded-xl border-2 border-red-500/30 bg-background/80 backdrop-blur"
				>
					<Card.Header class="pb-4">
						<div class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
							<X class="h-6 w-6 text-red-500" />
						</div>
						<Card.Title class="text-xl font-bold">Debunk Falsehoods</Card.Title>
						<Card.Description>
							Get detailed explanations that correct misconceptions with factual information.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="rounded-lg bg-muted/50 p-3 text-sm">
							<span class="font-mono text-red-500">False:</span> We only use 10% of our brain. This is
							a common misconception with no scientific basis.
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Card 3: Explore Origins -->
			<div
				class="group relative transition-all duration-300 hover:scale-105"
				role="group"
				onmouseenter={() => toggleHover('card3', true)}
				onmouseleave={() => toggleHover('card3', false)}
			>
				<div
					class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-400 opacity-0 blur transition duration-300 group-hover:opacity-70"
					class:opacity-50={hoverState.card3}
				></div>
				<Card.Root
					class="relative h-full overflow-hidden rounded-xl border-2 border-purple-500/30 bg-background/80 backdrop-blur"
				>
					<Card.Header class="pb-4">
						<div
							class="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20"
						>
							<BookOpen class="h-6 w-6 text-purple-500" />
						</div>
						<Card.Title class="text-xl font-bold">Explore Origins</Card.Title>
						<Card.Description>
							Learn where myths originated and how they became part of popular culture.
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="rounded-lg bg-muted/50 p-3 text-sm">
							<span class="font-mono text-purple-500">Origin:</span> The myth about carrots improving
							night vision was British propaganda during WWII.
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<!-- How it works section -->
		<div class="mt-20 w-full max-w-4xl">
			<h2 class="mb-8 text-center font-serif text-3xl font-bold">How It Works</h2>

			<div class="relative">
				<!-- Timeline line -->
				<div
					class="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-primary via-purple-500 to-emerald-500 md:left-1/2"
				></div>

				<!-- Step 1 -->
				<div class="relative mb-12 flex flex-col md:flex-row">
					<div class="flex-1 pb-8 md:pr-12 md:text-right">
						<h3 class="mb-2 text-xl font-bold text-primary">1. Enter Your Myth</h3>
						<p class="text-muted-foreground">
							Type in any statement, claim, or myth you want to verify.
						</p>
					</div>
					<div
						class="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white md:left-1/2 md:-translate-x-1/2"
					>
						1
					</div>
					<div class="flex-1 md:pl-12"></div>
				</div>

				<!-- Step 2 -->
				<div class="relative mb-12 flex flex-col md:flex-row">
					<div class="flex-1 md:pr-12"></div>
					<div
						class="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white md:left-1/2 md:-translate-x-1/2"
					>
						2
					</div>
					<div class="flex-1 pb-8 md:pl-12">
						<h3 class="mb-2 text-xl font-bold text-purple-500">2. AI Analysis</h3>
						<p class="text-muted-foreground">
							Our AI analyzes the statement using advanced research and reliable sources.
						</p>
					</div>
				</div>

				<!-- Step 3 -->
				<div class="relative mb-12 flex flex-col md:flex-row">
					<div class="flex-1 pb-8 md:pr-12 md:text-right">
						<h3 class="mb-2 text-xl font-bold text-emerald-500">3. Get Results</h3>
						<p class="text-muted-foreground">
							Receive a detailed verdict with explanations, citations, and myth origins.
						</p>
					</div>
					<div
						class="absolute left-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white md:left-1/2 md:-translate-x-1/2"
					>
						3
					</div>
					<div class="flex-1 md:pl-12"></div>
				</div>
			</div>
		</div>

		<!-- Final CTA -->
		<div class="mt-16 text-center">
			<p class="mb-6 text-xl text-muted-foreground">Ready to separate fact from fiction?</p>
			<Button href="/app" variant="outline" class="border-primary px-8 py-4 text-lg text-primary">
				Start Busting Myths Now
			</Button>
		</div>
	</main>
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
</style>
