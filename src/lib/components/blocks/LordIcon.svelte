<!--
@component
A wrapper for Lord Icon animated icons.

Props:
- `src`: URL to the JSON file for the icon
- `trigger`: How the icon animation is triggered ('in', 'click', 'hover', 'loop', 'loop-on-hover', 'morph', 'boomerang', 'sequence')
- `stroke`: Line thickness ('light', 'regular', 'bold', 'thick')
- `target`: Query selector for elements that will trigger the animation
- `state`: Specific animation state to use
- `class`: CSS classes to apply
- `colors`: Color definitions in format "primary:color,secondary:color"
- `loading`: Loading strategy ('lazy', 'interaction')
- `icon`: Icon name for predefined icons
- `style`: Inline CSS styles
- `delay`: Pause between animation cycles in ms
- `mobileLoop`: If true, renders two icons - one with loop trigger for mobile and one with loop-on-hover for desktop

Usage:
```svelte
<LordIcon
  src="https://cdn.lordicon.com/lewtedlh.json"
  trigger="loop-on-hover"
  stroke="light"
  colors="primary:#3080e8,secondary:#b4b4b4"
  style="width: 150px; height: 150px;"
  mobileLoop = false,
/>
```
-->

<script lang="ts">
	import { cn } from '$lib/utils';
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
		/**
		 * Inline CSS styles
		 * @type {string}
		 * @description CSS inline styles to apply to the icon element
		 * @example "width: 100px; height: 100px;"
		 */
		style?: string;
		/**
		 * If true, renders two icons - one with loop trigger for mobile and one with loop-on-hover for desktop
		 * @type {boolean}
		 */
		mobileLoop?: boolean;
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
		style = '',
		mobileLoop = false,
		delay
	}: LordIconProps = $props();

	let defaultClass = '';
</script>

{#if mobileLoop === true}
	<!-- Mobile version with loop trigger -->
	<lord-icon
		{src}
		trigger="loop"
		{stroke}
		target={target || null}
		state={state || null}
		class={cn(`${className} md:hidden`, defaultClass)}
		{colors}
		{delay}
		{loading}
		{icon}
		{style}
	></lord-icon>

	<!-- Desktop version with loop-on-hover trigger -->
	<lord-icon
		{src}
		trigger="loop-on-hover"
		{stroke}
		target={target || null}
		state={state || null}
		class={cn(`${className} hidden md:inline-block`, defaultClass)}
		{colors}
		{delay}
		{loading}
		{icon}
		{style}
	></lord-icon>
{:else}
	<lord-icon
		{src}
		{trigger}
		{stroke}
		target={target || null}
		state={state || null}
		class={cn(className, defaultClass)}
		{colors}
		{delay}
		{loading}
		{icon}
		{style}
	></lord-icon>
{/if}
