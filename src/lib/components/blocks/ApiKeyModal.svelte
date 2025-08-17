<script lang="ts">
	import { enhance, applyAction } from '$app/forms';
	import type { ActionResult, SubmitFunction } from '@sveltejs/kit';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { AlertCircle } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	export let open: boolean;

	let form: any;
	let message: string = '';
	let isSuccess: boolean = false;

	const handleSubmit = ({ formElement }: { formElement: HTMLFormElement }) => {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success' || result.type === 'failure') {
				form = result.data;
				if (result.type === 'success') {
					message = form?.message || 'API Key saved successfully!';
					isSuccess = true;
					// Optionally close the modal after a short delay on success
					setTimeout(() => {
						open = false;
						message = ''; // Clear message for next open
					}, 2000);
				} else {
					// result.type === 'failure'
					message = form?.error || 'Failed to save API Key.';
					isSuccess = false;
				}
			} else if (result.type === 'error') {
				message = result.error?.message || 'An unexpected error occurred.';
				isSuccess = false;
			}
			await applyAction(result);
		};
	};
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Enter Perplexity AI API Key</Dialog.Title>
			<Dialog.Description>
				Provide your own Perplexity AI API key to bypass global rate limits. Your key will be stored
				securely in a cookie.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/updatePerplexityApiKey" use:enhance={handleSubmit}>
			<div class="grid gap-4 py-4">
				{#if message}
					<Alert variant={isSuccess ? 'default' : 'destructive'}>
						<AlertCircle class="h-4 w-4" />
						<AlertTitle>{isSuccess ? 'Success' : 'Error'}</AlertTitle>
						<AlertDescription>{message}</AlertDescription>
					</Alert>
				{/if}
				<div class="grid gap-2">
					<Label for="perplexityApiKey">API Key</Label>
					<Input
						id="perplexityApiKey"
						name="perplexityApiKey"
						type="password"
						placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
						required
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit">Save API Key</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
