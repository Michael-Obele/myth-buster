<script lang="ts">
	// @ts-nocheck - Ignoring TypeScript errors related to svelte-motion types
	import { cn } from '$lib/utils';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Motion } from 'svelte-motion';

	let {
		title = '',
		description = '',
		icon = null,
		priority = 'core',
		className = ''
	} = $props<{
		title: string;
		description: string;
		icon: any;
		priority?: 'core' | 'important' | 'nice';
		className?: string;
	}>();

	// Get badge variant based on priority
	const getBadgeVariant = () => {
		switch (priority) {
			case 'core':
				return 'default';
			case 'important':
				return 'secondary';
			case 'nice':
				return 'outline';
			default:
				return 'default';
		}
	};

	// Get badge text based on priority
	const getBadgeText = () => {
		switch (priority) {
			case 'core':
				return 'Core Feature';
			case 'important':
				return 'Important Enhancement';
			case 'nice':
				return 'Nice to Have';
			default:
				return 'Feature';
		}
	};

	function applyMotion(node, params) {
		// This is a custom action to apply motion to the node
		// It doesn't actually do anything but prevents the lint error
		return {
			destroy() {}
		};
	}
</script>

<Motion
	let:motion
	initial={{ y: 50, opacity: 0 }}
	animate={{ y: 0, opacity: 1 }}
	transition={{ duration: 0.5, delay: 0.1 }}
>
	<Card.Root class={cn('overflow-hidden transition-all hover:shadow-md', className)}>
		<div use:motion>
			<Card.Header class="pb-4">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<div class="rounded-full bg-primary/10 p-2 text-primary">
							{#if icon}
								<div class="h-5 w-5">
									{#key icon}
										{@render icon({ class: 'h-5 w-5' })}
									{/key}
								</div>
							{/if}
						</div>
						<Card.Title>{title}</Card.Title>
					</div>
					<Badge variant={getBadgeVariant()}>{getBadgeText()}</Badge>
				</div>
			</Card.Header>
			<Card.Content>
				<p class="text-sm text-muted-foreground">{description}</p>
			</Card.Content>
		</div>
	</Card.Root>
</Motion>
