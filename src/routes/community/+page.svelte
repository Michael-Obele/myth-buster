<script lang="ts">
	import NumberTicker from '$lib/components/blocks/NumberTicker.svelte';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { RefreshCw } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';

	const attention2 = '/lottie/attention2.json';

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

	let name = $state('');
	let email = $state('');
	let open = $state(false);
	let isSubmitting = $state(false);

	async function handleSubmit() {
		if (!name || !email) return;

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			toast.error('Please enter a valid email address');
			return;
		}

		try {
			isSubmitting = true;

			// Submit to API
			const response = await fetch('/api/community/signup', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, email })
			});

			const result = await response.json();

			if (result.success) {
				// Close the dialog
				open = false;

				// Show success toast notification
				toast.success('Thank you for joining!', {
					description: "We'll notify you when our community Discord goes live."
				});

				// Reset form
				name = '';
				email = '';
			} else {
				// Show error toast
				toast.error(result.error || 'Failed to sign up. Please try again.');
			}
		} catch (error) {
			console.error('Error submitting form:', error);
			toast.error('Something went wrong. Please try again later.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<RouteHead
		title="Join Our Myth Buster Community"
		description="Sign up to be notified when our Myth Buster community Discord goes live. Connect with fellow truth-seekers!"
		keywords={['community', 'discord', 'signup', 'myth busters', 'fact checking']}
	/>

<div class="container py-10">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Community Discord Signups</h1>
		<Button variant="outline" disabled={isLoading} onclick={refreshData}>
			<RefreshCw class={`mr-2 inline-block ${isLoading ? 'animate-spin' : ''}`} />
			Refresh
		</Button>
	</div>

	{#if error}
		<div class="bg-destructive/20 text-destructive my-4 rounded-md p-4">
			<p>{error}</p>
		</div>
	{/if}

	<Card class="p-8">
		<div class="text-center">
			<h2 class="text-muted-foreground mb-2 text-xl font-medium">Registered Users</h2>
			<div class="text-6xl font-bold">
				{#if isLoading}
					<div class="animate-pulse">
						<span class="opacity-50">...</span>
					</div>
				{:else}
					<NumberTicker value={signupCount} duration={2500} />
				{/if}
			</div>
			<p class="text-muted-foreground mt-4">
				{signupCount === 1 ? 'person has' : 'people have'} joined the community waiting list
			</p>
		</div>
	</Card>

	<div class="mt-6 text-center">
		<p class="text-muted-foreground text-sm">
			For privacy reasons, individual email addresses are not displayed.
		</p>
	</div>

	<div class="relaive mt-8 text-center">
		<p class="mx-auto max-w-2xl text-lg">
			Join our worldwide community of myth busters who are committed to spreading truth and
			challenging misinformation everywhere.
		</p>
		<span class="relative mx-auto ml-20">
			<AlertDialog.Root bind:open>
				<AlertDialog.Trigger>
					<Button variant="default" size="lg" class="mt-6 border-green-200"
						>Join the Movement</Button
					>
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Join our Community</AlertDialog.Title>
						<AlertDialog.Description>
							Enter your details to be notified when our community Discord goes live.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<div class="grid gap-4 py-4">
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="name" class="text-right">Name</Label>
							<Input id="name" bind:value={name} class="col-span-3" />
						</div>
						<div class="grid grid-cols-4 items-center gap-4">
							<Label for="email" class="text-right">Email</Label>
							<Input id="email" type="email" bind:value={email} class="col-span-3" />
						</div>
					</div>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
						<AlertDialog.Action onclick={handleSubmit} disabled={isSubmitting}>
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
			<LordIcon
				src={attention2}
				trigger="loop"
				stroke="thick"
				colors="primary:#10B981,secondary:#10b981"
				class="relative top-[1.2rem] size-14 shrink-0 md:top-[1.3rem] md:size-20"
			/>
		</span>
	</div>
</div>
