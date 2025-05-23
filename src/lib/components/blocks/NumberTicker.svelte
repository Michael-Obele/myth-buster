<!--
@component
The `NumberTicker` component is used to display a numeric value that animates from an initial value to a target value. It supports customization for animation direction, duration, and additional styling.

### Props
- `value` (number | string, default: `100`): The target value to animate to. Can include a numeric value with optional prefix and suffix.
- `initial` (number, default: `0`): The starting value for the animation.
- `startValue` (number, optional): Overrides the `initial` value as the starting point for the animation.
- `duration` (number, default: `2000`): The duration of the animation in milliseconds.
- `class` (any, optional): Additional CSS classes to apply to the component.
- `direction` ('up' | 'down', default: `'up'`): The direction of the animation. `'up'` animates from a lower to a higher value, while `'down'` animates from a higher to a lower value.
- `[key: string]` (any): Additional props that can be passed to the component.

### Usage
```svelte
<NumberTicker
  value="1234"
  initial={0}
  duration={3000}
  class="text-lg font-bold"
  direction="up"
/>
 -->
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
