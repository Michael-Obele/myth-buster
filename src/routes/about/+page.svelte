<script lang="ts">
	import { cn } from '$lib/utils';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Flame, BookOpen, Check, HelpCircle } from 'lucide-svelte';
	import SparklesText from '$lib/components/SparklesText.svelte';

	// Import tab components
	import AboutTab from '$lib/components/about/AboutTab.svelte';
	import FeaturesTab from '$lib/components/about/FeaturesTab.svelte';
	import TechStackTab from '$lib/components/about/TechStackTab.svelte';
</script>

<div class="relative min-h-screen w-full overflow-hidden bg-background">
	<!-- Background particles (reused from main page) -->
	<div class="absolute inset-0 z-0 overflow-hidden">
		{#each Array.from({ length: 15 }) as _, i}
			<div
				class="floating-particle"
				style={`
					width: ${Math.random() * 10 + 5}px;
					height: ${Math.random() * 10 + 5}px;
					left: ${Math.random() * 100}%;
					top: ${Math.random() * 100}%;
					opacity: ${Math.random() * 0.5 + 0.1};
					animation-duration: ${Math.random() * 20 + 10}s;
					animation-delay: ${Math.random() * 5}s;
				`}
			></div>
		{/each}
	</div>

	<!-- Main content -->
	<main
		class="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-start px-4 py-16 text-foreground"
	>
		<!-- Header -->
		<div class="mb-12 flex flex-col items-center text-center">
			<div class="mb-6 flex items-center gap-3">
				<Flame class="size-8 animate-pulse text-primary md:size-12" />
				<SparklesText
					text="About Myth Buster"
					class="font-serif text-5xl font-bold tracking-tight text-primary md:text-6xl"
				/>

				<Badge class="bg-primary/20 text-primary">AI Powered</Badge>
			</div>

			<p class="max-w-2xl text-center text-lg text-muted-foreground">
				Discover the story behind our AI-powered myth-busting tool, designed to help you uncover the
				truth with reliable information and engaging visuals.
			</p>
		</div>

		<!-- Tabs for different sections -->
		<Tabs.Root value="about" class="my-12 w-full max-w-3xl">
			<Tabs.List class="flex gap-4">
				<Tabs.Trigger value="about">
					<div class="flex items-center gap-2">
						<BookOpen class="h-4 w-4" />
						<span>About</span>
					</div>
				</Tabs.Trigger>
				<Tabs.Trigger value="features">
					<div class="flex items-center gap-2">
						<Check class="h-4 w-4" />
						<span>Features</span>
					</div>
				</Tabs.Trigger>
				<Tabs.Trigger value="tech">
					<div class="flex items-center gap-2">
						<HelpCircle class="h-4 w-4" />
						<span>Tech Stack</span>
					</div>
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="about" class="mt-6">
				<AboutTab />
			</Tabs.Content>
			<Tabs.Content value="features" class="mt-6">
				<FeaturesTab />
			</Tabs.Content>
			<Tabs.Content value="tech" class="mt-6">
				<TechStackTab />
			</Tabs.Content>
		</Tabs.Root>

		<!-- Back to home button -->
		<div class="py-12">
			<Button href="/" variant="outline" class="gap-2">
				<Flame class="h-4 w-4" />
				Back to Home
			</Button>
		</div>
	</main>
</div>

<style>
	.floating-particle {
		position: absolute;
		border-radius: 50%;
		background-color: rgba(139, 92, 246, 0.3); /* Amethyst purple with opacity */
		pointer-events: none;
		animation-name: float;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
	}

	@keyframes float {
		0% {
			transform: translateY(0) translateX(0);
		}
		25% {
			transform: translateY(-20px) translateX(10px);
		}
		50% {
			transform: translateY(0) translateX(20px);
		}
		75% {
			transform: translateY(20px) translateX(10px);
		}
		100% {
			transform: translateY(0) translateX(0);
		}
	}
</style>
