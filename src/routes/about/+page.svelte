<script lang="ts">
	import { cn } from '$lib/utils';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Flame, Check, X, BookOpen, HelpCircle, Code, Users, ArrowRight } from 'lucide-svelte';
	import SparklesText from '$lib/components/SparklesText.svelte';
	import AboutTab from '$lib/components/about/AboutTab.svelte';
	import FeaturesTab from '$lib/components/about/FeaturesTab.svelte';
	import TechStackTab from '$lib/components/about/TechStackTab.svelte';
	import BackgroundBoxes from '$lib/components/BackgroundBoxes.svelte';

	// Features data
	const features = [
		{
			title: 'Myth Verification',
			description:
				'Clean, intuitive interface for statement entry with clear verdicts and comprehensive explanations.',
			icon: Check,
			priority: 'core'
		},
		{
			title: 'Visual Verdict Cues',
			description:
				'Distinctive icons and color-coded responses with smooth animations for verdict reveal.',
			icon: Flame,
			priority: 'core'
		},
		{
			title: 'Responsive Design',
			description:
				'Mobile-first approach ensuring usability on all devices with accessible interface.',
			icon: Code,
			priority: 'core'
		},
		{
			title: 'Myth Busting Game',
			description:
				'Interactive game where AI generates random facts/myths for you to verify with score tracking.',
			icon: BookOpen,
			priority: 'nice'
		},
		{
			title: 'Confidence Meter',
			description:
				'User prediction interface before seeing verdict with comparison to actual result.',
			icon: HelpCircle,
			priority: 'nice'
		},
		{
			title: 'Audio Cues',
			description: 'Simple, non-intrusive sounds for different verdicts with volume control.',
			icon: Users,
			priority: 'important'
		}
	];

	// Team members data
	const team = [
		{
			name: 'Michael Obele',
			role: 'Lead Developer',
			image: 'https://avatars.githubusercontent.com/u/70345027?s=96&v=4',
			bio: 'Full-stack developer with expertise in SvelteKit and AI integration.',
			github: 'https://github.com/Michael-Obele',
			twitter: 'https://twitter.com/Dev_Obele',
			linkedin: 'https://www.linkedin.com/in/dev-obele'
		}
	];

	// Timeline data
	const timelineItems = [
		{
			title: 'Project Inception',
			date: 'March 2025',
			description:
				'The idea for Myth Buster was born out of a desire to combat misinformation with engaging technology.',
			icon: Flame
		},
		{
			title: 'Core Development',
			date: 'April 2025',
			description:
				'Development of the core myth verification interface and integration with the Sonar API.',
			icon: Code
		},
		{
			title: 'Beta Testing',
			date: 'May 2025',
			description:
				'Initial testing with a focus group to refine the user experience and improve accuracy.',
			icon: Users
		},
		{
			title: 'Public Launch',
			date: 'May 2025',
			description:
				'Official launch of the Myth Buster web application with core features and the myth busting game.',
			icon: BookOpen
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
					Discover the story behind our AI-powered myth-busting tool, designed to help you uncover
					the truth with reliable information and engaging visuals.
				</p>
			</div>

			<!-- Tabs for different sections -->
			<Tabs.Root value="about" class="my-12 w-full max-w-4xl">
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
							<Code class="h-4 w-4" />
							<span>Tech Stack</span>
						</div>
					</Tabs.Trigger>
				</Tabs.List>

				<div class="mt-6">
					<Tabs.Content value="about">
						<AboutTab />
					</Tabs.Content>

					<Tabs.Content value="features">
						<FeaturesTab />
					</Tabs.Content>

					<Tabs.Content value="tech">
						<TechStackTab />
					</Tabs.Content>
				</div>
			</Tabs.Root>

			<!-- CTA Section -->
			<div class="mt-16 text-center">
				<h2 class="mb-4 text-2xl font-bold">Ready to start busting myths?</h2>
				<p class="mb-6 text-muted-foreground">Try our interactive myth verification tool now</p>
				<Button href="/app" class="px-6 py-2">
					Start Busting Myths
					<ArrowRight class="ml-2 h-4 w-4" />
				</Button>
			</div>
		</main>
	</BackgroundBoxes>
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
</div>
