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
		/**
		 * Link to the icon JSON file
		 * @type {string}
		 * @example "https://cdn.lordicon.com/lbjtvqiv.json"
		 */
		src?: string;
		/**
		 * Animation trigger type
		 * @type {TriggerType}
		 * @description Defines how the icon will interact with the web page
		 * @values 'in', 'click', 'hover', 'loop', 'loop-on-hover', 'morph', 'boomerang', 'sequence'
		 */
		trigger?: TriggerType;
		/** 
     * Stroke thickness for supported icons
     * @type {StrokeType}
     * @description Controls the line thickness in the icon
     * @values 'light', 'regular', 'bold', 'thick'
     */
		stroke?: StrokeType;
		/**
		 * Query selector for the element on which events will be listened
		 * @type {string}
		 * @description Target element that will trigger the animation
		 * @example ".btn" - Listens for events on elements with the btn class
		 */
		target?: string;
		/**
		 * Choose an animation for the icon (a single icon can have multiple animations)
		 * @type {string}
		 * @description Selects which animation to play from icons with multiple states
		 * @example "hover-pinch" - Plays the pinch animation on hover
		 */
		state?: string;
		/**
		 * CSS class name
		 * @type {string}
		 * @description CSS classes to apply to the icon element
		 * @example "current-color" - Makes icon inherit color from parent
		 * @example "size-10" - Sets size using Tailwind classes
		 */
		class?: string;
		/**
		 * Assign colors in text notation
		 * @type {string}
		 * @description Format: "colorName:colorValue,colorName2:colorValue2"
		 * @example "primary:#3080e8,secondary:#b4b4b4"
		 * @example "primary:white,secondary:green"
		 */
		colors?: string;
		/**
		 * Method by which the icon will be loaded
		 * @type {LoadingType}
		 * @description Controls when the icon loads its resources
		 * @values 'lazy', 'interaction'
		 */
		loading?: LoadingType;
		/**
		 * Icon name to load (for API integration)
		 * @type {string}
		 * @description Used when loading icons via API instead of direct URL
		 */
		icon?: string;
		/**
		 * Pause between animation plays (for loop, loop-on-hover, in triggers)
		 * @type {number | string}
		 * @description Delay in milliseconds between animation cycles
		 * @example 1000 - Waits 1 second between loops
		 */
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
</script>

<lord-icon
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
