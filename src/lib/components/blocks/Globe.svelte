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
				// Asia
				{ location: [14.5995, 120.9842], size: 0.03 }, // Manila, Philippines
				{ location: [19.076, 72.8777], size: 0.04 }, // Mumbai, India
				{ location: [23.8103, 90.4125], size: 0.03 }, // Dhaka, Bangladesh
				{ location: [39.9042, 116.4074], size: 0.08 }, // Beijing, China
				{ location: [34.6937, 135.5022], size: 0.05 }, // Osaka, Japan
				{ location: [1.3521, 103.8198], size: 0.04 }, // Singapore
				{ location: [13.7563, 100.5018], size: 0.04 }, // Bangkok, Thailand
				{ location: [25.276987, 55.296249], size: 0.06 }, // Dubai, UAE
				{ location: [37.566535, 126.9779692], size: 0.05 }, // Seoul, South Korea

				// Africa
				{ location: [30.0444, 31.2357], size: 0.06 }, // Cairo, Egypt
				{ location: [-1.2921, 36.8219], size: 0.04 }, // Nairobi, Kenya
				{ location: [6.5244, 3.3792], size: 0.05 }, // Lagos, Nigeria
				{ location: [-33.9249, 18.4241], size: 0.04 }, // Cape Town, South Africa
				{ location: [9.0338, 38.75], size: 0.03 }, // Addis Ababa, Ethiopia
				{ location: [14.6937, -17.4441], size: 0.03 }, // Dakar, Senegal
				{ location: [-4.4419, 15.2663], size: 0.03 }, // Kinshasa, DRC

				// Americas
				{ location: [40.7128, -74.006], size: 0.07 }, // New York, USA
				{ location: [19.4326, -99.1332], size: 0.05 }, // Mexico City, Mexico
				{ location: [-23.5505, -46.6333], size: 0.05 }, // São Paulo, Brazil
				{ location: [-34.6037, -58.3816], size: 0.04 }, // Buenos Aires, Argentina
				{ location: [4.711, -74.0721], size: 0.03 }, // Bogotá, Colombia
				{ location: [-33.4489, -70.6693], size: 0.03 }, // Santiago, Chile
				{ location: [43.6532, -79.3832], size: 0.04 }, // Toronto, Canada
				{ location: [37.7749, -122.4194], size: 0.05 }, // San Francisco, USA

				// Europe
				{ location: [41.0082, 28.9784], size: 0.05 }, // Istanbul, Turkey
				{ location: [51.5074, -0.1278], size: 0.06 }, // London, UK
				{ location: [48.8566, 2.3522], size: 0.05 }, // Paris, France
				{ location: [55.7558, 37.6173], size: 0.04 } // Moscow, Russia
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

<main class={cn('absolute inset-0 mx-auto aspect-square w-full max-w-[600px]', className)}>
	<canvas
		class="h-full w-full contain-[layout_paint_size]"
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
