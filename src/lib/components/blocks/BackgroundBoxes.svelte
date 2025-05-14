<script lang="ts">
	import { cn } from '$lib/utils';
	import GridBeam from '$lib/components/blocks/GridBeam.svelte';

	let {
		className = '',
		children = () => '',
		containerClassName = '',
		boxClassName = '',
		quantity = 20,
		pattern = 'grid',
		patternColor = 'slate-700'
	} = $props<{
		className?: string;
		children?: () => any;
		containerClassName?: string;
		boxClassName?: string;
		quantity?: number;
		pattern?: 'grid' | 'grid-small' | 'dot';
		patternColor?: string;
	}>();

	type Box = {
		id: number;
		x: number;
		y: number;
		size: number;
		delay: number;
		duration: number;
		showBeam: boolean;
	};

	let boxes: Box[] = $state([]);

	// Generate random boxes
	$effect(() => {
		const newBoxes: Box[] = [];
		for (let i = 0; i < quantity; i++) {
			newBoxes.push({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size: Math.random() * 40 + 10,
				delay: Math.random() * 2,
				duration: Math.random() * 10 + 10,
				showBeam: i === 0 || Math.random() > 0.9 // Show beam in the first box and randomly in some others
			});
		}
		boxes = newBoxes;
	});

	// Get the pattern class based on the pattern prop
	const getPatternClass = () => {
		switch (pattern) {
			case 'grid':
				return `bg-grid-${patternColor}`;
			case 'grid-small':
				return `bg-grid-small-${patternColor}`;
			case 'dot':
				return `bg-dot-${patternColor}`;
			default:
				return `bg-grid-${patternColor}`;
		}
	};
</script>

<div class={cn('relative overflow-hidden', containerClassName)}>
	<!-- Background with pattern -->
	<div class={cn('absolute inset-0', getPatternClass())}></div>

	<!-- Animated boxes -->
	<div class={cn('absolute inset-0 z-0', className)}>
		{#each boxes as box (box.id)}
			<div
				class={cn('absolute rounded-lg bg-white/10 backdrop-blur-lg', boxClassName)}
				style={`
					left: ${box.x}%;
					top: ${box.y}%;
					width: ${box.size}px;
					height: ${box.size}px;
					animation-delay: ${box.delay}s;
					animation-duration: ${box.duration}s;
				`}
			>
				{#if box.showBeam}
					<GridBeam>
						{#if box.id % 2 === 0}
							<div class="p-2 text-xs text-white/70">Myth</div>
						{:else if box.id % 2 === 1}
							<div class="p-2 text-xs text-white/70">Buster</div>
						{/if}
					</GridBeam>
				{/if}
			</div>
		{/each}
	</div>
	<div class="relative z-10">
		{@render children()}
	</div>
</div>

<style>
	div[style] {
		animation: float 20s ease-in-out infinite;
	}

	@keyframes float {
		0% {
			transform: translateY(0) translateX(0) rotate(0);
		}
		50% {
			transform: translateY(-20px) translateX(10px) rotate(5deg);
		}
		100% {
			transform: translateY(0) translateX(0) rotate(0);
		}
	}
</style>
