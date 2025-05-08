<script lang="ts">
	import { cn } from '$lib/utils';
	import { Motion } from 'svelte-motion';

	let { items = [], className = '' } = $props<{
		items: Array<{
			title: string;
			date: string;
			description: string;
			icon?: any;
		}>;
		className?: string;
	}>();
</script>

<div class={cn('relative space-y-8 before:absolute before:inset-0 before:left-9 before:ml-px before:h-full before:w-[1px] before:bg-border', className)}>
	{#each items as item, i}
		<Motion
			let:motion
			initial={{ x: -50, opacity: 0 }}
			animate={{ x: 0, opacity: 1 }}
			transition={{ duration: 0.5, delay: 0.1 * i }}
		>
			<div class="relative flex items-start" use:motion>
				<div class="absolute left-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
					{#if item.icon}
						<div class="h-4 w-4">
							{#key item.icon}
								{@render item.icon({ class: "h-4 w-4" })}
							{/key}
						</div>
					{:else}
						<span class="text-sm font-bold">{i + 1}</span>
					{/if}
				</div>
				<div class="ml-12 space-y-1">
					<div class="flex items-center gap-2">
						<h3 class="text-lg font-semibold">{item.title}</h3>
						<span class="text-xs text-muted-foreground">{item.date}</span>
					</div>
					<p class="text-sm text-muted-foreground">{item.description}</p>
				</div>
			</div>
		</Motion>
	{/each}
</div>
