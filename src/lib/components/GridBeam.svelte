<script lang="ts">
	// @ts-nocheck - Ignoring TypeScript errors related to svelte-motion types
	import { cn } from '$lib/utils';
	import { M, Motion } from 'svelte-motion';

	let { className = '', children = () => '' } = $props<{
		className?: string;
		children?: () => any;
	}>();
</script>

<div class={cn('relative h-full w-full', className)}>
	<!-- Main beam in the top left -->
	<svg
		width="156"
		height="63"
		viewBox="0 0 156 63"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute left-0 top-0 ml-24 mt-8"
	>
		<path
			d="M31 .5h32M0 .5h32m30 31h32m-1 0h32m-1 31h32M62.5 32V0m62 63V31"
			stroke="url(#grad1)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the top right -->
	<svg
		width="120"
		height="50"
		viewBox="0 0 120 50"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute right-0 top-0 mr-12 mt-16"
	>
		<path
			d="M0 .5h32M30 25h32M30 49h32M31.5 25V0m30 49V25"
			stroke="url(#grad2)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the top far right -->
	<svg
		width="90"
		height="40"
		viewBox="0 0 90 40"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute right-0 top-1/4 mr-4 mt-8"
	>
		<path
			d="M0 .5h32M0 20h32M15 20V0"
			stroke="url(#grad7)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the top left (repositioned from bottom) -->
	<svg
		width="100"
		height="40"
		viewBox="0 0 100 40"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute left-0 top-12 ml-8"
	>
		<path
			d="M0 .5h32M30 20h32M31.5 20V0"
			stroke="url(#grad3)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the middle left -->
	<svg
		width="70"
		height="35"
		viewBox="0 0 70 35"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute left-0 top-1/3 ml-4"
	>
		<path
			d="M0 .5h32M0 17h32M15 17V0"
			stroke="url(#grad8)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the upper right (repositioned from bottom) -->
	<svg
		width="80"
		height="30"
		viewBox="0 0 80 30"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute right-0 top-20 mr-16"
	>
		<path
			d="M0 .5h32M30 15h32"
			stroke="url(#grad4)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the top center (repositioned from bottom) -->
	<svg
		width="65"
		height="25"
		viewBox="0 0 65 25"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute left-1/2 top-16 -translate-x-1/2"
	>
		<path
			d="M0 .5h32M0 12h32M15 12V0"
			stroke="url(#grad9)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the upper center (repositioned from center) -->
	<svg
		width="60"
		height="60"
		viewBox="0 0 60 60"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2"
	>
		<path
			d="M0 .5h32M0 30h32M0 59h32M15 30V0m0 59V30"
			stroke="url(#grad5)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the top center -->
	<svg
		width="40"
		height="40"
		viewBox="0 0 40 40"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute left-1/2 top-0 -translate-x-1/2 mt-4"
	>
		<path
			d="M0 .5h32M15 20V0"
			stroke="url(#grad6)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the upper right (repositioned from middle right) -->
	<svg
		width="75"
		height="35"
		viewBox="0 0 75 35"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute right-0 top-1/3 mr-8"
	>
		<path
			d="M0 .5h32M0 17h32M15 17V0"
			stroke="url(#grad10)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Beam in the upper left quadrant -->
	<svg
		width="55"
		height="30"
		viewBox="0 0 55 30"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute left-1/4 top-1/4 -translate-x-1/2 -translate-y-1/2"
	>
		<path
			d="M0 .5h32M0 15h20"
			stroke="url(#grad11)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Added new beam in the top right corner -->
	<svg
		width="85"
		height="35"
		viewBox="0 0 85 35"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		class="absolute right-1/4 top-8 -translate-x-1/2"
	>
		<path
			d="M0 .5h32M0 17h32M15 17V0"
			stroke="url(#grad3)"
			stroke-width={1.5}
		/>
	</svg>

	<!-- Gradients for all beams -->
	<svg width="0" height="0" class="absolute">
		<defs>
			<M.linearGradient />
			<!-- Gradient 1 (main beam) -->
			<Motion
				variants={{
					initial: { x1: '40%', x2: '50%', y1: '160%', y2: '180%' },
					animate: { x1: '0%', x2: '10%', y1: '-40%', y2: '-20%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 1.8, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 2 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad1" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 2 -->
			<Motion
				variants={{
					initial: { x1: '50%', x2: '60%', y1: '140%', y2: '160%' },
					animate: { x1: '10%', x2: '20%', y1: '-30%', y2: '-10%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 2.2, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 1.5 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad2" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 3 -->
			<Motion
				variants={{
					initial: { x1: '30%', x2: '40%', y1: '120%', y2: '140%' },
					animate: { x1: '-10%', x2: '0%', y1: '-20%', y2: '0%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 2.5 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad3" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 4 -->
			<Motion
				variants={{
					initial: { x1: '20%', x2: '30%', y1: '100%', y2: '120%' },
					animate: { x1: '-20%', x2: '-10%', y1: '-10%', y2: '10%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 1 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad4" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 5 -->
			<Motion
				variants={{
					initial: { x1: '60%', x2: '70%', y1: '180%', y2: '200%' },
					animate: { x1: '20%', x2: '30%', y1: '-50%', y2: '-30%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 1.7, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 1.8 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad5" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 6 -->
			<Motion
				variants={{
					initial: { x1: '10%', x2: '20%', y1: '80%', y2: '100%' },
					animate: { x1: '-30%', x2: '-20%', y1: '-60%', y2: '-40%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 2.3, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 0.8 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad6" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 7 - Top far right -->
			<Motion
				variants={{
					initial: { x1: '45%', x2: '55%', y1: '130%', y2: '150%' },
					animate: { x1: '5%', x2: '15%', y1: '-35%', y2: '-15%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 2.1, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 1.2 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad7" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 8 - Middle left -->
			<Motion
				variants={{
					initial: { x1: '25%', x2: '35%', y1: '110%', y2: '130%' },
					animate: { x1: '-15%', x2: '-5%', y1: '-25%', y2: '-5%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 1.9, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 1.7 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad8" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 9 - Bottom center -->
			<Motion
				variants={{
					initial: { x1: '35%', x2: '45%', y1: '120%', y2: '140%' },
					animate: { x1: '-5%', x2: '5%', y1: '-15%', y2: '5%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 2.4, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 0.9 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad9" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 10 - Middle right -->
			<Motion
				variants={{
					initial: { x1: '55%', x2: '65%', y1: '150%', y2: '170%' },
					animate: { x1: '15%', x2: '25%', y1: '-45%', y2: '-25%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 2.0, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 1.3 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad10" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>

			<!-- Gradient 11 - Upper left quadrant -->
			<Motion
				variants={{
					initial: { x1: '15%', x2: '25%', y1: '90%', y2: '110%' },
					animate: { x1: '-25%', x2: '-15%', y1: '-55%', y2: '-35%' }
				}}
				animate="animate"
				initial="initial"
				transition={{ duration: 1.6, repeat: Infinity, repeatType: 'loop', ease: 'linear', repeatDelay: 2.2 }}
				isSVG={true}
				let:motion
			>
				<linearGradient id="grad11" use:motion>
					<stop stop-color="#18CCFC" stop-opacity="0" />
					<stop stop-color="#18CCFC" />
					<stop offset="0.325" stop-color="#6344F5" />
					<stop offset="1" stop-color="#AE48FF" stop-opacity="0" />
				</linearGradient>
			</Motion>
		</defs>
	</svg>

	{@render children()}
</div>

<style>
	@keyframes gradientAnimation {
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
