<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight } from 'lucide-svelte';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import SparklesText from '$lib/components/blocks/SparklesText.svelte';

	const attention = '/lottie/attention.json';
	const flame = '/lottie/flame.json';

	// Using $state for reactivity in Svelte 5
	let ctaHovered = $state(false);

	// Event handlers for mouse events
	function handleMouseEnter() {
		ctaHovered = true;
	}

	function handleMouseLeave() {
		ctaHovered = false;
	}
</script>

<section id="hero" class="mx-auto flex max-w-4xl flex-col items-center py-16 text-center">
	<div class="flex items-end">
		<div class="mb-3 flex items-center gap-3 md:mb-6">
			<LordIcon
				src={attention}
				trigger="loop"
				stroke="thick"
				target="section"
				class="relative top-[1.2rem] size-14 shrink-0 md:top-[2rem] md:size-20"
			/>

			<a href="/" class="group flex items-center transition-all">
				<LordIcon
					src={flame}
					trigger="loop"
					stroke="thick"
					target="#hero"
					colors="primary:#10B981,secondary:#10b981"
					mobileLoop={false}
					class="size-8 shrink-0 md:block md:size-12"
				/>
				<SparklesText
					text="Myth Buster"
					class="font-underdog text-2xl font-bold tracking-tight text-primary md:text-5xl"
				/>
			</a>

			<Badge class="bg-primary/20 text-primary hover:text-white">AI Powered</Badge>
		</div>
	</div>

	<p class="mb-8 max-w-2xl text-center text-xl leading-loose text-muted-foreground">
		<span class="text-2xl font-semibold text-primary">Uncover</span>
		the
		<span class="handwritten-underline relative z-10 text-2xl font-semibold text-primary">
			truth
		</span>
		behind common myths and misconceptions with our AI-powered fact-checking tool. Harness the power
		of
		<span class="text-2xl font-semibold italic text-primary">Sonar API</span>
		to verify claims instantly.
	</p>

	<div class="relative mt-2 flex flex-col items-center">
		<!-- Animated particles -->
		<div class="absolute inset-0 overflow-hidden">
			{#each Array(8) as _, i}
				<div
					class="floating-particle absolute rounded-full bg-primary/20"
					style="width: {8 + Math.random() * 8}px; height: {8 + Math.random() * 8}px; 
							left: {10 + Math.random() * 80}%; top: {Math.random() * 100}%; 
							opacity: {0.3 + Math.random() * 0.3};
							animation-duration: {10 + Math.random() * 10}s;
							animation-delay: {-Math.random() * 10}s;"
				></div>
			{/each}
		</div>

		<Button
			href="/app"
			size="lg"
			class="relative flex items-center gap-2 rounded-lg px-8 py-6 text-lg font-medium transition-all duration-300 hover:scale-105"
			onmouseenter={handleMouseEnter}
			onmouseleave={handleMouseLeave}
		>
			Start Busting Myths
			<ArrowRight class="h-5 w-5" />
		</Button>

		<p class="mt-4 max-w-md text-sm text-muted-foreground">
			Join thousands of educators, students, and curious minds in the quest for factual accuracy.
		</p>
	</div>
</section>

<style>
	.handwritten-underline {
		/* Use an SVG as a background image with two wavy lines */
		background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="15"><path d="M0,5 L5,4 L10,6 L15,5 L20,5" stroke="green" fill="none"/><path d="M0,8 L5,7 L10,9 L15,8 L20,8" stroke="green" fill="none"/></svg>');

		/* Repeat the background image horizontally */
		background-repeat: repeat-x;

		/* Position the background at the bottom of the element */
		background-position: bottom;

		/* Add padding below the text to make space for the underline */
		padding-bottom: 10px;
	}

	.floating-particle {
		animation-name: float;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		position: absolute;
	}
</style>
