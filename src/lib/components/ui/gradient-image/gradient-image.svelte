<!--
@component
A component that displays an image with a gradient background using the AspectRatio component.

Props:
- `src`: URL to the image
- `alt`: Alt text for the image
- `class`: Additional CSS classes
- `hoverEffect`: Whether to add a hover scale effect (default: false)

Usage:
```svelte
<GradientImage
  src="/path/to/image.jpg"
  alt="Feature illustration"

  class="rounded-lg"
/>
```
-->

<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		src,
		alt = 'Image',
		class: className = '',
		hoverEffect = false
	} = $props<{
		src: string;
		alt?: string;
		class?: string;
		hoverEffect?: boolean;
	}>();

	const gradientBg = 'bg-gradient-to-br from-primary/10 via-accent/5 to-background';
</script>

<div
	class={cn(
		'm-2 mx-5 flex size-52 max-h-[75vw] max-w-[75vw] items-center justify-center rounded-lg bg-gradient-to-br from-primary/50 via-accent/5 to-primary/70 text-center md:size-96',
		className
	)}
>
	<img
		{src}
		{alt}
		class={cn(
			'h-full w-full object-cover',
			hoverEffect && 'transition-all duration-300 hover:scale-105'
		)}
	/>
</div>
