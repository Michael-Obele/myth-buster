<script lang="ts">
	import NumberTicker from '$lib/components/blocks/NumberTicker.svelte';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { RefreshCw } from 'lucide-svelte';

	interface PageData {
		signupCount: number;
		error: string | null;
	}

	let { data } = $props<{ data: PageData }>();
	let signupCount = $derived(data.signupCount || 0);
	let error = $derived(data.error);
	let isLoading = $state(false);

	async function refreshData() {
		isLoading = true;

		try {
			await invalidateAll();
			toast.success('Data refreshed successfully');
		} catch (err) {
			toast.error('Failed to refresh data');
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="container py-10">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Community Discord Signups</h1>
		<Button variant="outline" disabled={isLoading} onclick={refreshData}>
			<RefreshCw class={`mr-2 inline-block ${isLoading ? 'animate-spin' : ''}`} />
			Refresh
		</Button>
	</div>

	{#if error}
		<div class="my-4 rounded-md bg-destructive/20 p-4 text-destructive">
			<p>{error}</p>
		</div>
	{/if}

	<Card class="p-8">
		<div class="text-center">
			<h2 class="mb-2 text-xl font-medium text-muted-foreground">Registered Users</h2>
			<div class="text-6xl font-bold">
				{#if isLoading}
					<div class="animate-pulse">
						<span class="opacity-50">...</span>
					</div>
				{:else}
					<NumberTicker value={signupCount} duration={2500} />
				{/if}
			</div>
			<p class="mt-4 text-muted-foreground">
				{signupCount === 1 ? 'person has' : 'people have'} joined the community waiting list
			</p>
		</div>
	</Card>

	<div class="mt-6 text-center">
		<p class="text-sm text-muted-foreground">
			For privacy reasons, individual email addresses are not displayed.
		</p>
	</div>
</div>
