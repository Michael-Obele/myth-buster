<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
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
	import { toast } from 'svelte-sonner';

	// Get the form from the server
	export let data;

	// Create the form using superForm
	const { form, errors, enhance, submitting } = superForm(data.form, {
		onSubmit: () => {
			return ({ result }: any) => {
				if (result.type === 'failure') {
					toast.error('Sign up failed');
				}
			};
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Sign Up</CardTitle>
			<CardDescription>Create a new account.</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" use:enhance>
				<div class="grid w-full items-center gap-4">
					<div class="flex flex-col space-y-1.5">
						<Label for="username">Username</Label>
						<Input
							id="username"
							name="username"
							type="text"
							placeholder="Enter your username"
							bind:value={$form.username}
							required
							aria-invalid={$errors.username ? 'true' : undefined}
						/>
						{#if $errors.username}
							<p class="text-sm text-red-500">{$errors.username}</p>
						{/if}
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="Enter your email"
							bind:value={$form.email}
							required
							aria-invalid={$errors.email ? 'true' : undefined}
						/>
						{#if $errors.email}
							<p class="text-sm text-red-500">{$errors.email}</p>
						{/if}
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="Enter your password"
							bind:value={$form.password}
							required
							aria-invalid={$errors.password ? 'true' : undefined}
						/>
						{#if $errors.password}
							<p class="text-sm text-red-500">{$errors.password}</p>
						{/if}
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							bind:value={$form.confirmPassword}
							required
							aria-invalid={$errors.confirmPassword ? 'true' : undefined}
						/>
						{#if $errors.confirmPassword}
							<p class="text-sm text-red-500">{$errors.confirmPassword}</p>
						{/if}
					</div>
				</div>
				<Button type="submit" class="mt-6 w-full" disabled={$submitting}>
					{$submitting ? 'Signing up...' : 'Sign Up'}
				</Button>
			</form>
			<p class="mt-4 text-center text-sm text-gray-600">
				Already have an account? <a href="/signin" class="text-blue-600 hover:underline"
					>Sign in here.</a
				>
			</p>
		</CardContent>
	</Card>
</div>
