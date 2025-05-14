<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		ratio = 1,
		class: className = '',
		children
	} = $props<{
		ratio?: number;
		class?: string;
		children?: any;
	}>();

	let containerRef: HTMLDivElement;
	let contentRef: HTMLDivElement;
	let paddingBottom: string = $state(`${(1 / ratio) * 100}%`);

	$effect(() => {
		paddingBottom = `${(1 / ratio) * 100}%`;
	});
</script>

<div
	bind:this={containerRef}
	class={cn('relative w-full', className)}
	style:padding-bottom={paddingBottom}
>
	<div bind:this={contentRef} class="absolute inset-0 h-full w-full">
		{@render children()}
	</div>
</div>
