<script lang="ts">
	import { cn } from '$lib/utils';
	import { GradientImage } from '$lib/components/ui/gradient-image';

	type Props = {
		title: string;
		description: string;
		imgSrc: string;
		imgAlt?: string;
		reversed?: boolean;
		className?: string;
		children?: any;
	};

	// Use a single props() call in Svelte 5
	let {
		title,
		description,
		imgSrc,
		imgAlt = 'Feature illustration',
		reversed = false,
		className = '',
		children
	} = $props();
</script>

<section class={cn('mx-auto w-full max-w-7xl px-4 py-16', className)}>
	<div
		class={cn(
			'grid grid-cols-1 items-center gap-10 md:grid-cols-2',
			reversed && 'md:flex-row-reverse'
		)}
	>
		<div class={cn('flex flex-col gap-5', reversed ? 'md:order-2' : 'md:order-1')}>
			<h2 class="font-underdog text-3xl font-bold tracking-tight">{title}</h2>
			<p class="text-lg leading-relaxed text-muted-foreground">{description}</p>
			{#if children}
				<div class="mt-4">
					{@render children()}
				</div>
			{/if}
		</div>

		<GradientImage src={imgSrc} alt={imgAlt} class="rounded-lg" />
	</div>
</section>
