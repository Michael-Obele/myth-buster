<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { LogOut } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	interface Props {
		variant?: 'outline' | 'link' | 'default' | 'destructive' | 'secondary' | 'ghost' | undefined;
		size?: 'default' | 'sm' | 'lg' | 'icon' | undefined;
	}

	let { variant = 'outline', size = 'sm' }: Props = $props();

	let isLoading = $state(false);
</script>

<form
	method="POST"
	action="/signout"
	use:enhance={() => {
		isLoading = true;

		return async ({ result }) => {
			if (result.type === 'redirect') {
				await invalidateAll();
			} else if (result.type === 'error') {
				toast.error('Failed to sign out. Please try again.');
			}

			isLoading = false;
		};
	}}
>
	<Button {variant} {size} type="submit" disabled={isLoading} class="flex items-center gap-2">
		{#if isLoading}
			<span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
			></span>
			<span>Signing out...</span>
		{:else}
			<LogOut class="h-4 w-4" />
			<span>Sign out</span>
		{/if}
	</Button>
</form>
