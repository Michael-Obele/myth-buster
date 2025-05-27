<script lang="ts">
	import { cn } from '$lib/utils';
	import { onMount } from 'svelte';

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
	onMount(() => {
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

	const svgToDataUri = (svg: string) =>
		`data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

	// Define SVG templates
	const gridSvg = (color: string) =>
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${color}"><path d="M0 .5H31.5V32"/></svg>`;

	const gridSmallSvg = (color: string) =>
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${color}"><path d="M0 .5H31.5V32"/></svg>`;

	const dotSvg = (color: string) =>
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${color}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`;

	// Derived background image style
	const backgroundImageStyle = $derived.by(() => {
		let svgString;
		switch (pattern) {
			case 'grid':
				svgString = gridSvg(patternColor);
				break;
			case 'grid-small':
				svgString = gridSmallSvg(patternColor);
				break;
			case 'dot':
				svgString = dotSvg(patternColor);
				break;
			default:
				svgString = gridSvg(patternColor); // Default to grid
		}
		return `background-image: url("${svgToDataUri(svgString)}")`;
	});
</script>

<div class={cn('relative overflow-hidden', containerClassName)}>
	<!-- Background with pattern -->
	<div class={cn('absolute inset-0')} style={backgroundImageStyle}></div>

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
					{#if box.id % 2 === 0}
						<div class="p-2 text-xs text-white/70">Myth</div>
					{:else if box.id % 2 === 1}
						<div class="p-2 text-xs text-white/70">Buster</div>
					{/if}
					<!-- <GridBeam>
					</GridBeam> -->
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
