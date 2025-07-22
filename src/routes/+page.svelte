<script lang="ts">
	import FeatureCardGrid from '$lib/components/blocks/FeatureCardGrid.svelte';
	import BackgroundBoxes from '$lib/components/blocks/BackgroundBoxes.svelte';
	import ApiKeyModal from '$lib/components/ApiKeyModal.svelte';
	import { Button } from '$lib/components/ui/button';
	import { PlusCircle } from '@lucide/svelte';

	// Import landing page components
	import EnhancedHero from '$lib/components/landing-page/EnhancedHero.svelte';
	import GamePreview from '$lib/components/landing-page/GamePreview.svelte';
	import HowItWorks from '$lib/components/landing-page/HowItWorks.svelte';
	import StatsHighlight from '$lib/components/landing-page/StatsHighlight.svelte';
	import GlobalImpactSection from '$lib/components/landing-page/GlobalImpactSection.svelte';
	import AlternatingFeatureSection from '$lib/components/landing-page/AlternatingFeatureSection.svelte';
	import MiniMythCheck from '$lib/components/landing-page/MiniMythCheck.svelte';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';

	let showApiKeyModal: boolean = $state(false);

	$effect(() => {
		// Reload the page once when coming from the signin page or register page
		if (
			document.referrer.includes('/signin') ||
			document.referrer.includes('/signup') ||
			document.referrer.includes('/signout')
		) {
			console.log('Reloading page');
			window.location.reload();
		}
	});
</script>

<RouteHead
	title="Myth Buster - AI-Powered Fact Verification"
	description="Verify myths and uncover the truth with our AI-powered fact verification tool. Get explanations and sources for common misconceptions."
	keywords={['myth busting', 'fact checking', 'AI', 'verify', 'misconceptions']}
/>

<!-- Animated background with grid pattern -->
<div class="min-h-screen overflow-hidden bg-linear-to-br from-slate-900 to-slate-800">
	<!-- Grid pattern overlay -->
	<div class="bg-grid-black/[0.07] dark:bg-grid-white/[0.05] absolute inset-0"></div>
	<!-- Main content -->
	<main
		class="text-foreground relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-16"
	>
		<!-- Button to open API Key Modal -->
		<div class="absolute top-4 right-4 z-20">
			<Button
				onclick={() => (showApiKeyModal = true)}
				variant="outline"
				size="sm"
				class="flex items-center gap-2"
			>
				<PlusCircle class="h-4 w-4" />
				API Key
			</Button>
		</div>

		<ApiKeyModal bind:open={showApiKeyModal} />

		<!-- Background boxes for additional visual effect -->
		<BackgroundBoxes
			className="opacity-50"
			boxClassName="border border-slate-700/20"
			pattern="grid"
			patternColor="slate-700"
			quantity={5}
		>
			<!-- Enhanced Hero Section (using component) -->
			<EnhancedHero />

			<!-- Stats Highlight Section -->
			<StatsHighlight />
		</BackgroundBoxes>

		<!-- Mini-Myth Quick Check Feature -->
		<MiniMythCheck />

		<FeatureCardGrid />

		<!-- First Alternating Feature Section -->
		<AlternatingFeatureSection />

		<!-- Game Preview Section -->
		<GamePreview />

		<BackgroundBoxes
			className="opacity-50"
			boxClassName="border border-slate-700/20"
			pattern="grid"
			patternColor="slate-700"
			quantity={4}
		>
			<!-- New How It Works Section with Resizable Component -->
			<HowItWorks />

			<GlobalImpactSection />
		</BackgroundBoxes>
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
</style>
