<script lang="ts">
	import FeatureCardGrid from '$lib/components/blocks/FeatureCardGrid.svelte';
	import BackgroundBoxes from '$lib/components/blocks/BackgroundBoxes.svelte';

	// Import landing page components
	import EnhancedHero from '$lib/components/landing-page/EnhancedHero.svelte';
	import GamePreview from '$lib/components/landing-page/GamePreview.svelte';
	import HowItWorks from '$lib/components/landing-page/HowItWorks.svelte';
	import StatsHighlight from '$lib/components/landing-page/StatsHighlight.svelte';
	import GlobalImpactSection from '$lib/components/landing-page/GlobalImpactSection.svelte';
	import AlternatingFeatureSection from '$lib/components/landing-page/AlternatingFeatureSection.svelte';
	import MiniMythCheck from '$lib/components/landing-page/MiniMythCheck/MiniMythCheck.svelte';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';
</script>

<RouteHead
	title="Myth Buster - AI-Powered Fact Verification"
	description="Verify myths and uncover the truth with our AI-powered fact verification tool. Get explanations and sources for common misconceptions."
	keywords={["myth busting", "fact checking", "AI", "verify", "misconceptions"]}
/>

<!-- Animated background with grid pattern -->
<div class="min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
	<!-- Grid pattern overlay -->
	<div class="bg-grid-black/[0.07] dark:bg-grid-white/[0.05] absolute inset-0"></div>
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
			class="text-foreground relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16"
		>
			<!-- Enhanced Hero Section (using component) -->
			<EnhancedHero />

			<!-- Stats Highlight Section -->
			<StatsHighlight />
			
			<!-- Mini-Myth Quick Check Feature -->
			<MiniMythCheck />

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
</style>
