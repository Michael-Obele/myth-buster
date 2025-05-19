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

	// Sign-in page logic
	let email = $state('');
	let password = $state('');

	function handleSignIn() {
		console.log('Sign In Attempt:', { email, password });
		// TODO: Implement actual sign-in logic
	}
</script>

<div class="flex min-h-screen items-center justify-center">
	<Card class="w-[350px]">
		<CardHeader>
			<CardTitle>Sign In</CardTitle>
			<CardDescription>Enter your credentials to access your account.</CardDescription>
		</CardHeader>
		<CardContent>
			<form onsubmit={handleSignIn}>
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
				</div>
				<Button type="submit" class="mt-6 w-full">Sign In</Button>
			</form>
			<div class="mt-4 text-center text-sm">
				Don't have an account? <a href="/signup" class="underline">Sign up here.</a>
			</div>
		</CardContent>
	</Card>
</div>
