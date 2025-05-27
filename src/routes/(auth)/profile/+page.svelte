<script lang="ts">
	import { page } from '$app/state';
	import { enhance, applyAction } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { AlertCircle, Eye, EyeOff } from '@lucide/svelte';
	import SignOutButton from '$lib/components/auth/SignOutButton.svelte';
	import { redirect } from '@sveltejs/kit';
	import type { PageProps } from './$types';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';

	// Get user from page data
	let user = $derived(page.data.user);
	let { form }: PageProps = $props();

	// Form states
	let username = $derived(user?.username || '');
	let email = $derived(user?.email || '');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);

	let isUserDetailsLoading = $state(false);
	let isPasswordLoading = $state(false);

	// Redirect if not logged in
	$effect(() => {
		if (!user) {
			throw redirect(303, '/signin?redirectTo=/profile');
		}
	});

	// Get first letter of username for avatar
	let userInitial = $derived(user?.username ? user.username[0].toUpperCase() : '');

	// Get server errors with proper typing
	let serverErrors = $derived(form?.errors || {});
	let detailsMessage = $derived(form?.detailsMessage || '');
	let passwordMessage = $derived(form?.passwordMessage || '');

	// Reset form when user changes
	$effect(() => {
		if (user) {
			username = user.username;
			email = user.email;
		}
	});
</script>

<RouteHead
	title="User Profile | Myth Buster"
	description="Manage your Myth Buster account details, update your profile information, and change your password."
	keywords={['profile', 'account management', 'user settings', 'update profile']}
/>

<div class="container mx-auto px-4 py-12">
	<div class="mx-auto max-w-3xl">
		<h1 class="mb-8 text-3xl font-bold tracking-tight">User Profile</h1>

		{#if user}
			<!-- User Profile Card -->
			<Card class="mb-8">
				<CardHeader class="pb-2">
					<div class="flex flex-row items-center gap-4">
						<Avatar.Root class="h-16 w-16">
							<Avatar.Fallback class="bg-primary text-xl text-primary-foreground">
								{userInitial}
							</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<CardTitle class="text-2xl">{user.username}</CardTitle>
							<CardDescription>Account Details</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-2">
						<div class="grid grid-cols-[100px_1fr] items-center gap-2">
							<span class="text-sm font-medium text-muted-foreground">Email:</span>
							<span>{user.email}</span>
						</div>
						<div class="grid grid-cols-[100px_1fr] items-center gap-2">
							<span class="text-sm font-medium text-muted-foreground">Member since:</span>
							<span>{new Date().toLocaleDateString()}</span>
						</div>
						<div class="grid grid-cols-[100px_1fr] items-center gap-2">
							<span class="text-sm font-medium text-muted-foreground">Status:</span>
							<span
								class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-primary"
							>
								Active
							</span>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Edit Profile Form -->
			<Card class="mb-8">
				<CardHeader>
					<CardTitle>Edit Profile</CardTitle>
					<CardDescription>Update your account information</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/updateDetails"
						class="space-y-4"
						use:enhance={({ formElement, formData }) => {
							isUserDetailsLoading = true;
							return async ({ result }) => {
								isUserDetailsLoading = false;
								await applyAction(result);
							};
						}}
					>
						{#if detailsMessage}
							<Alert variant={form?.detailsSuccess ? 'default' : 'destructive'}>
								<AlertCircle class="h-4 w-4" />
								<AlertDescription>{detailsMessage}</AlertDescription>
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
							{#if typeof serverErrors === 'object' && 'username' in serverErrors}
								<p class="text-sm text-red-500">
									{(serverErrors as Record<string, string>).username}
								</p>
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
							{#if typeof serverErrors === 'object' && 'email' in serverErrors}
								<p class="text-sm text-red-500">{(serverErrors as Record<string, string>).email}</p>
							{/if}
						</div>

						<Button type="submit" class="w-full" disabled={isUserDetailsLoading}>
							{#if isUserDetailsLoading}
								Updating Profile...
							{:else}
								Update Profile
							{/if}
						</Button>
					</form>
				</CardContent>
			</Card>

			<!-- Change Password Form -->
			<Card>
				<CardHeader>
					<CardTitle>Change Password</CardTitle>
					<CardDescription>Update your password to keep your account secure</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						method="POST"
						action="?/updatePassword"
						class="space-y-4"
						use:enhance={({ formElement, formData }) => {
							isPasswordLoading = true;
							return async ({ result }) => {
								isPasswordLoading = false;
								await applyAction(result);
							};
						}}
					>
						{#if passwordMessage}
							<Alert variant={form?.passwordSuccess ? 'default' : 'destructive'}>
								<AlertCircle class="h-4 w-4" />
								<AlertDescription>{passwordMessage}</AlertDescription>
							</Alert>
						{/if}

						<div class="grid gap-2">
							<Label for="currentPassword">Current Password</Label>
							<div class="relative">
								<Input
									id="currentPassword"
									name="currentPassword"
									type={showCurrentPassword ? 'text' : 'password'}
									bind:value={currentPassword}
									required
									placeholder="Enter your current password"
									class="w-full"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="absolute right-0 top-0 h-full px-3 py-2"
									onclick={() => (showCurrentPassword = !showCurrentPassword)}
								>
									{#if showCurrentPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</Button>
							</div>
							{#if 'currentPassword' in serverErrors}
								<p class="text-sm text-red-500">{serverErrors?.currentPassword}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="newPassword">New Password</Label>
							<div class="relative">
								<Input
									id="newPassword"
									name="newPassword"
									type={showNewPassword ? 'text' : 'password'}
									bind:value={newPassword}
									required
									placeholder="Enter your new password"
									class="w-full"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="absolute right-0 top-0 h-full px-3 py-2"
									onclick={() => (showNewPassword = !showNewPassword)}
								>
									{#if showNewPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</Button>
							</div>
							{#if 'newPassword' in serverErrors}
								<p class="text-sm text-red-500">{serverErrors?.newPassword}</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="confirmPassword">Confirm New Password</Label>
							<div class="relative">
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									required
									placeholder="Confirm your new password"
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
							{#if 'confirmPassword' in serverErrors}
								<p class="text-sm text-red-500">{serverErrors.confirmPassword}</p>
							{/if}
						</div>

						<p class="text-xs text-muted-foreground">
							Password must be at least 8 characters and include uppercase, lowercase, and numbers.
						</p>

						<Button type="submit" class="w-full" disabled={isPasswordLoading}>
							{#if isPasswordLoading}
								Updating Password...
							{:else}
								Change Password
							{/if}
						</Button>
					</form>
				</CardContent>
				<CardFooter class="flex justify-end">
					<SignOutButton variant="destructive" />
				</CardFooter>
			</Card>
		{:else}
			<Card>
				<CardContent class="py-8 text-center">
					<p>Please sign in to view your profile.</p>
					<div class="mt-4">
						<Button href="/signin">Sign In</Button>
					</div>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
