<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		class?: any;
	}

	let { class: className = '' }: Props = $props();
</script>

<div
	class={cn(
		'pointer-events-none absolute h-full w-full overflow-hidden opacity-50 perspective-[200px]',
		className
	)}
>
	<!-- Grid  -->
	<div class="absolute inset-0 [transform:rotateX(35deg)]">
		<div
			class={cn(
				'animate-grid',

				'bg-repeat bg-size-[60px_60px] h-[300vh] inset-[0%_0px] ml-[-50%] origin-[100%_0_0] w-[600vw]',

				// Light Styles
				'bg-[linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_0)]',

				// Dark styles
				'dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)]'
			)}
		></div>
	</div>

	<!-- Background Gradient -->
	<div
		class="absolute inset-0 bg-linear-to-t from-white to-transparent to-90% dark:from-black"
	></div>
</div>
