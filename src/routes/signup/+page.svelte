<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

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

	// Sign-up page logic
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	function handleSignUp() {
		if (password !== confirmPassword) {
			console.error('Passwords do not match');
			// TODO: Show error message to user
			return;
		}
		console.log('Sign Up Attempt:', { email, password });
		// TODO: Implement actual sign-up logic
	}
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Sign Up</CardTitle>
			<CardDescription>Create a new account.</CardDescription>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleSignUp}>
				<div class="grid w-full items-center gap-4">
					<div class="flex flex-col space-y-1.5">
						<Label for="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="Enter your email"
							bind:value={email}
							required
						/>
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							bind:value={password}
							required
						/>
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							placeholder="Confirm your password"
							bind:value={confirmPassword}
							required
						/>
					</div>
				</div>
				<Button type="submit" class="mt-6 w-full">Sign Up</Button>
			</form>
			<p class="mt-4 text-center text-sm text-gray-600">
				Already have an account? <a href="/signin" class="text-blue-600 hover:underline"
					>Sign in here.</a
				>
			</p>
		</CardContent>
	</Card>
</div>
