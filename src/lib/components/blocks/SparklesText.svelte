<script lang="ts">
	// SparklesText component inspired by Magic UI
	// Props for customization
	import { cn } from '$lib/utils';
	let { text, class: className = '' } = $props<{ text: string; class?: string }>();

	// State for sparkle animations
	let sparkles = $state(
		Array.from({ length: 10 }, (_, i) => ({
			id: i,
			size: Math.random() * 10 + 5,
			left: Math.random() * 100,
			top: Math.random() * 100,
			delay: Math.random() * 2,
			duration: Math.random() * 2 + 1
		}))
	);

	// Function to get random position for sparkles
	function getRandomPosition() {
		return {
			left: `${Math.random() * 100}%`,
			top: `${Math.random() * 100}%`,
			animationDelay: `${Math.random() * 2}s`
		};
	}
</script>

<div class="sparkles-text-container relative inline-block">
	<!-- Text content -->
	<span class={cn('relative z-10', className)}>
		{text}
	</span>

	<!-- Sparkles -->
	{#each sparkles as sparkle (sparkle.id)}
		<span
			class="sparkle absolute inline-block animate-ping"
			style="
        width: {sparkle.size}px;
        height: {sparkle.size}px;
        left: {sparkle.left}%;
        top: {sparkle.top}%;
        animation-delay: {sparkle.delay}s;
        animation-duration: {sparkle.duration}s;
      "
		></span>
	{/each}
</div>

<style>
	.sparkles-text-container {
		position: relative;
	}

	.sparkle {
		background-image: radial-gradient(
			circle,
			rgba(255, 255, 255, 0.8) 0%,
			rgba(255, 255, 255, 0) 70%
		);
		border-radius: 50%;
		pointer-events: none;
		opacity: 0;
		transform: scale(0);
		animation: sparkle-animation 3s ease-in-out infinite;
	}

	@keyframes sparkle-animation {
		0% {
			opacity: 0;
			transform: scale(0) rotate(0deg);
		}
		50% {
			opacity: 0.8;
			transform: scale(1) rotate(180deg);
		}
		100% {
			opacity: 0;
			transform: scale(0) rotate(360deg);
		}
	}
</style>
