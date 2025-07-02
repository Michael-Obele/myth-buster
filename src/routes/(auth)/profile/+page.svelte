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
	import RouteHead from '$lib/components/layout/RouteHead.svelte';
	import * as Tabs from '$lib/components/ui/tabs'; // Import Tabs component
	import type { UserResearchActivity, PremiumAnalytics } from '$lib/types/index'; // Import the new types
	import type { PageData } from './+page.server'; // Import PageData from page.server.ts

	// Get user from page data
	let { data, form }: { data: PageData; form: any } = $props(); // Use PageData for typing
	let user = $derived(data.user);
	let userResearchActivities: UserResearchActivity[] = $derived(data.userResearchActivities || []);
	let premiumAnalytics: PremiumAnalytics | null = $derived(data.premiumAnalytics || null);

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
			<Tabs.Root value="account" class="space-y-8">
				<Tabs.List class="grid w-full grid-cols-4">
					<Tabs.Trigger value="account">Account Details</Tabs.Trigger>
					<Tabs.Trigger value="research">My Research Activity</Tabs.Trigger>
					<Tabs.Trigger value="premium">Premium Insights</Tabs.Trigger>
					<Tabs.Trigger value="limits">Rate Limit & Upgrade</Tabs.Trigger>
				</Tabs.List>

				<!-- Account Details Tab -->
				<Tabs.Content value="account" class="space-y-8">
					<!-- User Profile Card -->
					<Card>
						<CardHeader class="pb-2">
							<div class="flex flex-row items-center gap-4">
								<Avatar.Root class="h-16 w-16">
									<Avatar.Fallback class="bg-primary text-primary-foreground text-xl">
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
									<span class="text-muted-foreground text-sm font-medium">Email:</span>
									<span>{user.email}</span>
								</div>
								<div class="grid grid-cols-[100px_1fr] items-center gap-2">
									<span class="text-muted-foreground text-sm font-medium">Member since:</span>
									<span>{new Date().toLocaleDateString()}</span>
								</div>
								<div class="grid grid-cols-[100px_1fr] items-center gap-2">
									<span class="text-muted-foreground text-sm font-medium">Status:</span>
									<span
										class="text-primary inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
									>
										Active
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<!-- Edit Profile Form -->
					<Card>
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
										<p class="text-sm text-red-500">
											{(serverErrors as Record<string, string>).email}
										</p>
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

								<p class="text-muted-foreground text-xs">
									Password must be at least 8 characters and include uppercase, lowercase, and
									numbers.
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
				</Tabs.Content>

				<!-- My Research Activity Tab -->
				<Tabs.Content value="research" class="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle>My Research Activity</CardTitle>
							<CardDescription
								>Overview of your research activities and generated content.</CardDescription
							>
						</CardHeader>
						<CardContent>
							<p>
								This section will display your research activity, including topics researched,
								lenses used, and generated content snippets.
							</p>
							{#if userResearchActivities.length > 0}
								<div class="mt-4 space-y-4">
									{#each userResearchActivities as activity}
										<Card>
											<CardHeader>
												<CardTitle>{activity.contentType}</CardTitle>
												<CardDescription
													>{new Date(activity.timestamp).toLocaleString()}</CardDescription
												>
											</CardHeader>
											<CardContent>
												{#if activity.mythId}
													<p><strong>Myth ID:</strong> {activity.mythId}</p>
												{/if}
												{#if activity.verificationStatus}
													<p><strong>Verification Status:</strong> {activity.verificationStatus}</p>
												{/if}
												{#if activity.generatedContentSnippet}
													<p><strong>Snippet:</strong> {activity.generatedContentSnippet}</p>
												{/if}
												{#if activity.lensUsageMetrics && Object.keys(activity.lensUsageMetrics).length > 0}
													<p><strong>Lens Usage:</strong></p>
													<ul>
														{#each Object.entries(activity.lensUsageMetrics) as [lens, count]}
															<li>{lens}: {count}</li>
														{/each}
													</ul>
												{/if}
												{#if activity.mythTopicFrequency && Object.keys(activity.mythTopicFrequency).length > 0}
													<p><strong>Topic Frequency:</strong></p>
													<ul>
														{#each Object.entries(activity.mythTopicFrequency) as [topic, frequency]}
															<li>{topic}: {frequency}</li>
														{/each}
													</ul>
												{/if}
											</CardContent>
										</Card>
									{/each}
								</div>
							{:else}
								<p>No research activity found.</p>
							{/if}
						</CardContent>
					</Card>
				</Tabs.Content>

				<!-- Premium Insights Tab -->
				<Tabs.Content value="premium" class="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle>Premium Insights</CardTitle>
							<CardDescription>Advanced analytics and source reliability scores.</CardDescription>
						</CardHeader>
						<CardContent>
							<p>This section will display premium analytics and MythInsight data.</p>
							{#if premiumAnalytics}
								<div class="mt-4 space-y-4">
									<Card>
										<CardHeader>
											<CardTitle>Latest Premium Analytics</CardTitle>
											<CardDescription
												>{new Date(premiumAnalytics.timestamp).toLocaleString()}</CardDescription
											>
										</CardHeader>
										<CardContent>
											<p>
												<strong>Research Session ID:</strong>
												{premiumAnalytics.researchSessionId || 'N/A'}
											</p>
											<p>
												<strong>Source Analysis Count:</strong>
												{premiumAnalytics.sourceAnalysisCount}
											</p>
											<p>
												<strong>Synthesis Generated Count:</strong>
												{premiumAnalytics.synthesisGeneratedCount}
											</p>
											<p><strong>Sonar Call Count:</strong> {premiumAnalytics.sonarCallCount}</p>
											<p>
												<strong>Average Research Depth:</strong>
												{premiumAnalytics.averageResearchDepth}
											</p>
											<p>
												<strong>Report Generation Count:</strong>
												{premiumAnalytics.reportGenerationCount}
											</p>
											{#if premiumAnalytics.lensUsageMetrics && Object.keys(premiumAnalytics.lensUsageMetrics).length > 0}
												<p><strong>Lens Usage Metrics:</strong></p>
												<ul>
													{#each Object.entries(premiumAnalytics.lensUsageMetrics) as [lens, count]}
														<li>{lens}: {count}</li>
													{/each}
												</ul>
											{/if}
											{#if premiumAnalytics.mythTopicFrequency && Object.keys(premiumAnalytics.mythTopicFrequency).length > 0}
												<p><strong>Myth Topic Frequency:</strong></p>
												<ul>
													{#each Object.entries(premiumAnalytics.mythTopicFrequency) as [topic, frequency]}
														<li>{topic}: {frequency}</li>
													{/each}
												</ul>
											{/if}
										</CardContent>
									</Card>
								</div>
							{:else}
								<p>No premium analytics data found.</p>
							{/if}
						</CardContent>
					</Card>
				</Tabs.Content>

				<!-- Rate Limit & Upgrade Tab -->
				<Tabs.Content value="limits" class="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle>Rate Limit & Upgrade</CardTitle>
							<CardDescription>Manage your usage limits and upgrade your account.</CardDescription>
						</CardHeader>
						<CardContent>
							<p>
								This section will display your current usage limits and provide an option to upgrade
								or enter a promo key.
							</p>
							<div class="mt-4 space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<Card>
										<CardHeader>
											<CardTitle>Current Usage</CardTitle>
										</CardHeader>
										<CardContent>
											<p><strong>Monthly Queries:</strong> 100/1000</p>
											<p><strong>Research Reports:</strong> 5/20</p>
										</CardContent>
									</Card>
									<Card>
										<CardHeader>
											<CardTitle>Plan Details</CardTitle>
										</CardHeader>
										<CardContent>
											<p><strong>Current Plan:</strong> Free Tier</p>
											<p>
												<Button variant="outline" class="mt-2">Upgrade to Premium</Button>
											</p>
										</CardContent>
									</Card>
								</div>
								<Card>
									<CardHeader>
										<CardTitle>Enter Promo Key</CardTitle>
										<CardDescription
											>Have a promo key? Enter it below to unlock features.</CardDescription
										>
									</CardHeader>
									<CardContent>
										<div class="flex space-x-2">
											<Input type="text" placeholder="Promo Key" class="flex-grow" />
											<Button>Apply</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>
				</Tabs.Content>
			</Tabs.Root>
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
