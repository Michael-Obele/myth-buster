<script lang="ts">
	import { enhance, applyAction } from '$app/forms';
	import { goto } from '$app/navigation';
	import PasswordInput from '$lib/components/ui/password-input';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AlertCircle, Eye, EyeOff } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	// Get the form from the server
	let { data, form }: PageProps = $props();

	// State management using $state
	let username: string = $state('');
	let password: string = $state('');
	let showPassword: boolean = $state(false);
	let isLoading: boolean = $state(false);

	// Show server errors if present
	let serverErrors = $derived(form?.form?.errors || {});
	let serverMessage = $derived(serverErrors?.error?.[0] ?? '');
</script>

<svelte:head>
	<title>Sign In | Myth Buster</title>
	<meta name="description" content="Sign in to your Myth Buster account" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Sign In</CardTitle>
			<CardDescription>Enter your credentials to access your account.</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				class="space-y-4"
				use:enhance={({ formElement, formData }) => {
					// Set loading state to true when form is being submitted
					isLoading = true;

					return async ({ result }) => {
						console.log('Form submission result:', result);

						if (result.type === 'redirect') {
							// Wait for 100ms to ensure session is set properly
							await new Promise((resolve) => setTimeout(resolve, 100));
							// Navigate to the redirected location
							goto(result.location);
						} else {
							// Only reset loading state if not redirecting
							isLoading = false;
							// Apply the result (errors, etc.)
							await applyAction(result);
						}
					};
				}}
			>
				{#if serverMessage}
					<Alert variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<AlertDescription>{serverMessage}</AlertDescription>
					</Alert>
				{/if}

				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input
						id="username"
						name="username"
						type="text"
						bind:value={username}
						required
						placeholder="Enter your username"
					/>
					{#if serverErrors?.username}
						<p class="text-sm text-red-500">{serverErrors.username?.[0]}</p>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<div class="relative">
						<Input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							required
							placeholder="Enter your password"
							class="w-full"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="absolute right-0 top-0 h-full px-3 py-2"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
					{#if serverErrors?.password}
						<p class="text-sm text-red-500">{serverErrors.password?.[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						Signing in...
					{:else}
						Sign In
					{/if}
				</Button>
			</form>
			<p class="mt-4 text-center text-sm text-muted-foreground">
				Don't have an account? <a
					href="/signup"
					class="hover:text-brand underline underline-offset-4">Sign up here</a
				>
			</p>
		</CardContent>
	</Card>
</div>
