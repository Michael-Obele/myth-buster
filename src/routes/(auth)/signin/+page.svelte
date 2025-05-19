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
					toast.error('Sign in failed');
				}
			};
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Sign In</CardTitle>
			<CardDescription>Enter your credentials to access your account.</CardDescription>
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
				</div>
				<Button type="submit" class="mt-6 w-full" disabled={$submitting}>
					{$submitting ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>
			<div class="mt-4 text-center text-sm">
				Don't have an account? <a href="/signup" class="underline">Sign up here.</a>
			</div>
		</CardContent>
	</Card>
</div>
