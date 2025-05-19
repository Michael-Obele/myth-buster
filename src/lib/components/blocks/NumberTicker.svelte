<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { Spring, Tween } from 'svelte/motion';
	import { cn } from '$lib/utils';
	import { IsInViewport } from 'runed';

	interface Props {
		value?: number | string;
		initial?: number;
		duration?: number;
		class?: any;
		startValue?: number;
		direction?: 'up' | 'down'; // Add new prop for animation direction
		[key: string]: any;
	}

	let {
		value = 100,
		initial = 0,
		startValue,
		duration = 2000,
		class: className = '',
		direction = 'up', // Default direction to 'up'
		...rest
	}: Props = $props();

	let numericValue: number;
	let prefix = $state('');
	let suffix = $state('');
	let isInViewport = $state(false);

	if (typeof value === 'string') {
		const match = value.match(/^(\D*)(\d+(\.\d+)?)(.*)$/);
		if (match) {
			prefix = match[1] || '';
			numericValue = parseFloat(match[2]);
			suffix = match[4] || '';
		} else {
			// Handle cases where the string doesn't match the expected pattern,
			// perhaps default to 0 or throw an error, for now default to 0
			numericValue = 0;
			prefix = value; // Display the original string if no number found
			suffix = '';
		}
	} else {
		numericValue = value;
	}

	let num = new Tween(
		direction === 'down'
			? startValue !== undefined && typeof startValue === 'number'
				? startValue
				: 100
			: startValue !== undefined && typeof startValue === 'number'
				? startValue
				: initial,
		{
			duration: duration,
			easing: cubicOut
		}
	);

	let targetNode = $state<HTMLElement>()!;
	const inViewport = new IsInViewport(() => targetNode);
	// Use $effect to react to changes in numericValue or direction and update the tween target
	$effect(() => {
		if (inViewport.current) {
			// Start animation when in viewport
			num.set(numericValue);
		} else {
			// Reset to initial value when leaving viewport
			const resetValue =
				direction === 'down'
					? startValue !== undefined && typeof startValue === 'number'
						? startValue
						: 100
					: startValue !== undefined && typeof startValue === 'number'
						? startValue
						: initial;
			num.set(resetValue);
		}
	});
</script>

<div
	bind:this={targetNode}
	class={cn('inline-block  tracking-normal text-black dark:text-white', className)}
	{...rest}
>
	{prefix}{num.current.toFixed(0)}{suffix}
</div>
