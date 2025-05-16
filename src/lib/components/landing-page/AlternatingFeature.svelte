<script lang="ts">
	import { cn } from '$lib/utils';
	import { GradientImage } from '$lib/components/ui/gradient-image';
	import * as Resizable from '$lib/components/ui/resizable/index.js';

	type Props = {
		title: string;
		description: string;
		imgSrc: string;
		imgAlt?: string;
		secImgSrc?: string;
		secImgAlt?: string;
		reversed?: boolean;
		className?: string;
		children?: any;
	};

	// Use a single props() call in Svelte 5
	let {
		title,
		description,
		imgSrc,
		secImgSrc,
		imgAlt = 'Feature illustration',
		secImgAlt = 'Feature illustration',
		reversed = false,
		className = '',
		children
	} = $props();
</script>

<section class={cn('mx-auto w-full max-w-7xl px-4 py-16', className)}>
	<div
		class={cn(
			'grid grid-cols-1 items-center gap-10 md:grid-cols-2',
			reversed ? 'md:flex-row-reverse' : 'md:flex-row'
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

		<Resizable.PaneGroup
			class="m-2 mx-5 flex size-52 max-h-[75vw] max-w-[75vw] items-center justify-center rounded-lg bg-gradient-to-br from-primary/50 via-accent/5 to-primary/70 text-center md:size-96"
			direction="horizontal"
		>
			<Resizable.Pane defaultSize={30}>
				<enhanced:img
					src={imgSrc}
					alt={imgAlt}
					class="m-2 mx-5 flex size-52 max-h-[75vw] max-w-[75vw] items-center justify-center rounded-lg text-center md:size-96"
				/>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane>
				<div
					class="m-2 mx-5 flex size-52 max-h-[75vw] max-w-[75vw] items-center justify-center rounded-lg text-center md:size-96"
				>
					<enhanced:img src={secImgSrc} alt={secImgAlt} class="h-full w-full object-cover" />
				</div>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</div>
</section>
