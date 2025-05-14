<script lang="ts">
	// Type definitions for LordIcon props
	type TriggerType =
		| 'in'
		| 'click'
		| 'hover'
		| 'loop'
		| 'loop-on-hover'
		| 'morph'
		| 'boomerang'
		| 'sequence';
	type StrokeType = 'light' | 'regular' | 'bold' | 'thick';
	type LoadingType = 'lazy' | 'interaction';

	interface LordIconProps {
		/** Link to the icon JSON file */
		src?: string;
		/** Animation trigger type */
		trigger?: TriggerType;
		/** Stroke thickness for supported icons */
		stroke?: StrokeType;
		/** Query selector for the element on which events will be listened */
		target?: string;
		/** Choose an animation for the icon (a single icon can have multiple animations) */
		state?: string;
		/** CSS class name */
		class?: string;
		/** Assign colors in text notation, e.g., "primary:#121331,secondary:#3a3347" */
		colors?: string;
		/** Method by which the icon will be loaded */
		loading?: LoadingType;
		/** Icon name to load (for API integration) */
		icon?: string;
		/** Pause between animation plays (for loop, loop-on-hover, in triggers) */
		delay?: number | string;
	}

	// Props with defaults
	let {
		src = '',
		trigger = 'loop',
		stroke = 'thick',
		target = '',
		state = '',
		class: className = '',
		colors = 'primary:white;secondary:green',
		loading,
		icon,
		delay
	}: LordIconProps = $props();

	// Reference to the element
	let element: HTMLElement;
</script>

<lord-icon
	bind:this={element}
	{src}
	{trigger}
	{stroke}
	target={target || null}
	state={state || null}
	class={className}
	{colors}
	{delay}
	{loading}
	{icon}
></lord-icon>
