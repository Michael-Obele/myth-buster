<script lang="ts">
	import { cn } from '$lib/utils';

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

<section class={cn('py-16 w-full max-w-7xl mx-auto px-4', className)}>
	<div class={cn('grid grid-cols-1 md:grid-cols-2 gap-10 items-center', reversed && 'md:flex-row-reverse')}>
		<div class={cn('flex flex-col gap-5', reversed ? 'md:order-2' : 'md:order-1')}>
			<h2 class="text-3xl font-bold font-serif tracking-tight">{title}</h2>
			<p class="text-lg text-muted-foreground leading-relaxed">{description}</p>
			{#if children}
				<div class="mt-4">
					{@render children()}
				</div>
			{/if}
		</div>
		<div class={cn('relative', reversed ? 'md:order-1' : 'md:order-2')}>
			<div class="w-full shadow-lg rounded-lg overflow-hidden">
				<div class="relative pb-[56.25%] bg-muted/30"> <!-- 16:9 aspect ratio -->
					<img 
						src={imgSrc} 
						alt={imgAlt} 
						class="absolute inset-0 w-full h-full object-cover transition-all duration-300 hover:scale-105"
					/>
				</div>
			</div>
		</div>
	</div>
</section>
