<script lang="ts">
	import { enhance, applyAction, deserialize } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageProps } from './$types';
	import type { ActionResult } from '@sveltejs/kit';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Eye, EyeOff, AlertCircle } from '@lucide/svelte';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';

	// Get the form data from props
	let { form }: PageProps = $props();

	// State management using $state
	let username: string = $state('');
	let email: string = $state('');
	let password: string = $state('');
	let confirmPassword: string = $state('');
	let showPassword: boolean = $state(false);
	let showConfirmPassword: boolean = $state(false);
	let isLoading: boolean = $state(false);

	// Show server errors if present
	let serverErrors: Record<string, string[]> = $derived.by(() => form?.form?.errors || {});
	let serverMessage: string = $derived.by(() => serverErrors?.error?.[0] ?? '');
</script>

<RouteHead
	title="Sign Up | Myth Buster"
	description="Create your Myth Buster account and start verifying myths with our AI-powered tool."
	keywords={['signup', 'register', 'create account', 'myth buster account']}
/>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Sign Up</CardTitle>
			<CardDescription>Create your Myth Buster account</CardDescription>
		</CardHeader>
		<CardContent>
			<form
				method="POST"
				class="space-y-4"
				use:enhance={() => {
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
					<Label for="email">Email</Label>
					<Input
						id="email"
						name="email"
						type="email"
						bind:value={email}
						required
						placeholder="Enter your email"
					/>
					{#if serverErrors?.email}
						<p class="text-sm text-red-500">{serverErrors.email?.[0]}</p>
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

				<div class="grid gap-2">
					<Label for="confirmPassword">Confirm Password</Label>
					<div class="relative">
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							required
							placeholder="Confirm your password"
							class="w-full"
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="absolute right-0 top-0 h-full px-3 py-2"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
						>
							{#if showConfirmPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</Button>
					</div>
					{#if serverErrors?.confirmPassword}
						<p class="text-sm text-red-500">{serverErrors.confirmPassword?.[0]}</p>
					{/if}
				</div>

				<Button type="submit" class="w-full" disabled={isLoading}>
					{#if isLoading}
						Creating account...
					{:else}
						Sign Up
					{/if}
				</Button>
			</form>
			<p class="mt-4 text-center text-sm text-muted-foreground">
				Already have an account? <a
					href="/signin"
					class="hover:text-brand underline underline-offset-4">Sign in here</a
				>
			</p>
		</CardContent>
	</Card>
</div>
