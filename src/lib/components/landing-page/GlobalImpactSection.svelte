<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import Globe from '$lib/components/blocks/Globe.svelte';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';

	const attention2 = '/lottie/attention2.json';

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

<section class="relative my-16 py-16">
	<div class="mx-auto max-w-7xl px-4">
		<div class="mb-8 text-center">
			<h2 class="mb-4 font-underdog text-4xl font-bold">Global Impact of Misinformation</h2>
			<p class="mx-auto max-w-2xl text-xl text-muted-foreground">
				Myths and misinformation spread across the globe in seconds. Our mission is to provide
				fact-checking tools that reach every corner of the world.
			</p>
		</div>

		<div
			class="relative mx-auto flex h-fit w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg border bg-background px-4 pb-40 pt-8 md:pb-60 md:shadow-xl"
		>
			<span
				class="pointer-events-none select-none whitespace-pre-wrap bg-gradient-to-b from-primary to-accent/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent"
			>
				Truth Worldwide
			</span>
			<main class="absolute inset-0 top-28 mx-auto aspect-[1/1] w-full max-w-[600px]">
				<!-- Your Globe component here -->
				<Globe />
			</main>
			<div
				class="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]"
			></div>
		</div>

		<div class="relaive mt-8 text-center">
			<p class="mx-auto max-w-2xl text-lg">
				Join our worldwide community of myth busters who are committed to spreading truth and
				challenging misinformation everywhere.
			</p>
			<span class="relative mx-auto ml-20">
				<AlertDialog.Root bind:open>
					<AlertDialog.Trigger>
						<Button variant="default" size="lg" class="mt-6">Join the Movement</Button>
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
</section>
