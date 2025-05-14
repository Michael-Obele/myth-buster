<script lang="ts">
	import { onMount } from 'svelte';
	import createGlobe from 'cobe';
	import { cn } from '$lib/utils';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	// Use $state for reactive variables
	let x = $state(0);
	let springConfig = {
		stiffness: 0.04,
		damping: 0.4,
		precision: 0.005
	};

	let pointerInteracting = $state<number | null>(null);
	let pointerInteractionMovement = $state(0);
	let canvas = $state<HTMLCanvasElement | null>(null);

	let phi = $state(0);
	let width = $state(0);

	let setSpringValue = (value: number) => {
		// Simulate spring physics
		const delta = value - x;
		x = x + delta * springConfig.stiffness;
	};

	let onResize = () => {
		if (canvas) {
			width = canvas.offsetWidth;
		}
	};

	let onRender = (state: any) => {
		if (!pointerInteracting) {
			phi += 0.005;
		}
		state.phi = phi + x;
		state.width = width ? width * 2 : 0;
		state.height = width ? width * 2 : 0;
	};

	onMount(() => {
		// Adds the resize event listener when the component is mounted
		window.addEventListener('resize', onResize);
		onResize();

		// Make sure canvas is available before initializing the globe
		if (!canvas) return;

		// Initializes the globe with specific options
		const globe = createGlobe(canvas, {
			devicePixelRatio: 2,
			width: width,
			height: width,
			phi: 0,
			theta: 0.3,
			dark: 1,
			diffuse: 0.4, // 1.2
			mapSamples: 16000,
			mapBrightness: 1.2, // 6
			baseColor: [0.3, 0.3, 0.3],
			markerColor: [251 / 255, 100 / 255, 21 / 255],
			glowColor: [1, 1, 1],
			markers: [
				{ location: [14.5995, 120.9842], size: 0.03 },
				{ location: [19.076, 72.8777], size: 0.03 },
				{ location: [23.8103, 90.4125], size: 0.05 },
				{ location: [30.0444, 31.2357], size: 0.07 },
				{ location: [39.9042, 116.4074], size: 0.08 },
				{ location: [-23.5505, -46.6333], size: 0.05 },
				{ location: [19.4326, -99.1332], size: 0.04 },
				{ location: [40.7128, -74.006], size: 0.1 },
				{ location: [34.6937, 135.5022], size: 0.05 },
				{ location: [41.0082, 28.9784], size: 0.06 }
			],
			// onRender: (state) => {
			//   if (!pointerInteracting) {
			//     // Called on every animation frame.
			//     // `state` will be an empty object, return updated params.
			//     phi += 0.009;
			//   }
			//   state.phi = phi + $x;

			//   // phi += 0.01;
			// },
			onRender: onRender
		});

		// Removes the resize event listener when the component is unmounted to prevent memory leaks
		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<main class={cn('absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]', className)}>
	<canvas
		class="h-full w-full [contain:layout_paint_size]"
		bind:this={canvas}
		onpointerdown={(e: PointerEvent) => {
			pointerInteracting = e.clientX - pointerInteractionMovement;
			if (canvas) canvas.style.cursor = 'grabbing';
		}}
		onpointerup={() => {
			pointerInteracting = null;
			if (canvas) canvas.style.cursor = 'grab';
		}}
		onpointerout={() => {
			pointerInteracting = null;
			if (canvas) canvas.style.cursor = 'grab';
		}}
		onmousemove={(e: MouseEvent) => {
			if (pointerInteracting !== null) {
				const delta = e.clientX - pointerInteracting;
				pointerInteractionMovement = delta;
				setSpringValue(delta / 200);
			}
		}}
	></canvas>
</main>
