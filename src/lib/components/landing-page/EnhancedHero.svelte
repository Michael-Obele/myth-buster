<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { ArrowRight } from 'lucide-svelte';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import SparklesText from '$lib/components/blocks/SparklesText.svelte';
	
	const attention = '/lottie/attention.json';
	
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

<section class="py-16 flex flex-col items-center text-center max-w-4xl mx-auto">
	<div class="flex items-end">
		<div class="mb-6 flex items-center gap-3">
			<LordIcon
				src={attention}
				trigger="loop"
				stroke="thick"
				target="section"
				colors="primary:#3b82f6,secondary:#10b981"
				class="h-10 w-10 shrink-0"
			/>
			
			<a href="/" class="group flex items-center transition-all">
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
		<span class="handwritten-underline relative z-10 text-2xl font-semibold text-primary">
			truth
		</span>
		behind common myths and misconceptions with our AI-powered fact-checking tool. Harness the power of
		<span class="italic text-2xl font-semibold text-primary">Sonar API</span>
		to verify claims instantly.
	</p>

	<div class="relative mt-2 flex flex-col items-center">
		<!-- Animated particles -->
		<div class="absolute inset-0 overflow-hidden">
			{#each Array(8) as _, i}
					<div
						class="floating-particle bg-primary/20 rounded-full absolute"
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
		
		<p class="mt-4 text-sm text-muted-foreground max-w-md">
			Join thousands of educators, students, and curious minds in the quest for factual accuracy.
		</p>
	</div>
</section>
