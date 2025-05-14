<script lang="ts">
	import FeatureCardGrid from '$lib/components/blocks/FeatureCardGrid.svelte';
	import AlternatingFeatureSection from '$lib/components/landing-page/AlternatingFeatureSection.svelte';
	import GlobalImpactSection from '$lib/components/landing-page/GlobalImpactSection.svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		Search,
		Brain,
		CheckCircle,
		ArrowRight,
		Eye,
		PackageSearch,
		Settings
	} from 'lucide-svelte';

	import BackgroundBoxes from '$lib/components/blocks/BackgroundBoxes.svelte';

	// Import our new landing page components
	import EnhancedHero from '$lib/components/landing-page/EnhancedHero.svelte';
	import GamePreview from '$lib/components/landing-page/GamePreview.svelte';
	import HowItWorks from '$lib/components/landing-page/HowItWorks.svelte';
	import StatsHighlight from '$lib/components/landing-page/StatsHighlight.svelte';

	const howItWorksSteps = [
		{
			id: 1,
			title: '1. Enter Your Myth',
			content: 'Type in any statement, claim, or myth you want to verify into the input field.',
			image: 'https://i.pinimg.com/736x/ca/aa/49/caaa49d386d84f2d037d0abcc919778f.jpg',
			icon: Search,
			// Keep the original properties for backward compatibility
			number: 1,
			color: 'bg-primary text-white',
			ring: 'ring-white dark:ring-gray-900',
			iconBg: 'bg-primary dark:bg-blue-900',
			titleColor: 'text-primary',
			description: 'Type in any statement, claim, or myth you want to verify into the input field.'
		},
		{
			id: 2,
			title: '2. AI Analysis',
			content:
				'Our AI, powered by the Sonar API, analyzes the statement using advanced research and reliable sources.',
			image: 'https://i.pinimg.com/736x/a5/dc/0a/a5dc0af50d185b7f9111949b17e17e1a.jpg',
			icon: Brain,
			// Keep the original properties for backward compatibility
			number: 2,
			color: 'bg-purple-500 text-white',
			ring: 'ring-white dark:ring-gray-900',
			iconBg: 'bg-purple-500 dark:bg-blue-900',
			titleColor: 'text-purple-500',
			description:
				'Our AI, powered by the Sonar API, analyzes the statement using advanced research and reliable sources.'
		},
		{
			id: 3,
			title: '3. Get Results',
			content:
				'Receive a detailed verdict (True/False/Inconclusive) with explanations and verifiable citations.',
			image: 'https://i.pinimg.com/736x/b1/b9/c2/b1b9c230143fb0d8540eabe5b74adf27.jpg',
			icon: CheckCircle,
			// Keep the original properties for backward compatibility
			number: 3,
			color: 'bg-emerald-500 text-white',
			ring: 'ring-white dark:ring-gray-900',
			iconBg: 'bg-emerald-500 dark:bg-blue-900',
			titleColor: 'text-emerald-500',
			description:
				'Receive a detailed verdict (True/False/Inconclusive) with explanations and verifiable citations.'
		}
	];

	import FeatureCard from '$lib/components/blocks/FeatureCard.svelte';
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

			<FeatureCardGrid />

			<!-- First Alternating Feature Section -->
			<AlternatingFeatureSection />

			<!-- Game Preview Section -->
			<GamePreview />

			<!-- New How It Works Section with Resizable Component -->
			<HowItWorks />

			<GlobalImpactSection />
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
</style>
