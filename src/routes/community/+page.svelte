<script lang="ts">
	import NumberTicker from '$lib/components/blocks/NumberTicker.svelte';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { RefreshCw, ArrowUp, MessageSquarePlus, Users, Vote } from 'lucide-svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import type { PageData as LayoutPageData } from '../$types'; // For user from layout

	const attention2 = '/lottie/attention2.json';

	// --- Type Definitions ---
	// UserProfile is expected to come from LayoutPageData if session exists
	// interface UserProfile {
	// 	id: string;
	// 	username: string;
	// 	email: string;
	// }

	interface SubmittedMyth {
		id: string;
		text: string;
		submittedBy?: string; // Username or "Anonymous"
		votes: number;
		createdAt: string; // ISO date string
		// For client-side demo, track if current user has voted
		votedByCurrentUser?: boolean;
	}

	// Data specific to this page's load function (if any beyond what layout provides)
	interface CommunityPageLoadDataFromServer {
		signupCount: number;
		error: string | null;
		submittedMyths?: SubmittedMyth[]; // This would come from this page's +page.server.ts
	}

	// The 'data' prop in the component is the merged result from layouts and page server load
	type FullPageData = LayoutPageData & CommunityPageLoadDataFromServer;

	let { data } = $props<{ data: FullPageData; form?: any }>(); // form can be any for now

	// --- Page State ---
	let signupCount = $derived(data.signupCount || 0);
	let pageError = $derived(data.error); // Renamed from error to avoid conflict with catch(error)
	let isLoading = $state(false);
	let activeTab = $state('discord'); // Default tab

	// Discord signup dialog state
	let discordSignupName = $state('');
	let discordSignupEmail = $state('');
	let discordSignupOpen = $state(false);
	let isDiscordSubmitting = $state(false);

	// Myth submission state
	let newMythText = $state('');
	let isSubmittingMyth = $state(false);

	// Submitted myths list (with placeholder)
	// In a real app, if submittedMyths could be undefined from `data`, handle that appropriately.
	// For now, assume it will be an empty array if not provided from server, or use placeholder.
	let submittedMythsList: SubmittedMyth[] = $state(
		data.submittedMyths || [
			{
				id: '1',
				text: 'Is the 5-second rule really scientifically accurate for food dropped on the floor?',
				submittedBy: 'TruthSeeker9000',
				votes: 15,
				createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
				votedByCurrentUser: false
			},
			{
				id: '2',
				text: 'Do cats actually always land on their feet, or is that just a common saying?',
				submittedBy: 'CuriousCatLover',
				votes: 27,
				createdAt: new Date(Date.now() - 172800000 * 1.5).toISOString(),
				votedByCurrentUser: true
			},
			{
				id: '3',
				text: 'Will eating carrots give you superhuman night vision like in cartoons?',
				votes: 8,
				createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
				votedByCurrentUser: false
			}
		]
	);

	// --- Functions ---
	async function refreshData() {
		isLoading = true;
		try {
			await invalidateAll(); // This will re-run all load functions
			toast.success('Data refreshed successfully');
		} catch (err) {
			toast.error('Failed to refresh data');
		} finally {
			isLoading = false;
		}
	}

	async function handleDiscordSubmit() {
		if (!discordSignupName || !discordSignupEmail) {
			toast.info('Please enter both name and email.');
			return;
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(discordSignupEmail)) {
			toast.error('Please enter a valid email address');
			return;
		}

		isDiscordSubmitting = true;
		try {
			const response = await fetch('/api/community/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: discordSignupName, email: discordSignupEmail })
			});
			const result = await response.json();

			if (result.success) {
				discordSignupOpen = false;
				toast.success('Thank you for joining the waitlist!', {
					description: "We'll notify you when our community Discord goes live."
				});
				discordSignupName = '';
				discordSignupEmail = '';
				await invalidateAll(); // Refresh signup count
			} else {
				toast.error(result.error || 'Failed to sign up. Please try again.');
			}
		} catch (fetchError) {
			console.error('Error submitting Discord signup form:', fetchError);
			toast.error('Something went wrong. Please try again later.');
		} finally {
			isDiscordSubmitting = false;
		}
	}

	async function handleMythSubmit() {
		if (!newMythText.trim()) {
			toast.info('Please enter a myth to submit.');
			return;
		}
		// Ensure data.user exists and has a username property
		const currentUsername = data.user?.username;
		if (!currentUsername) {
			toast.error('You must be logged in to submit a myth.');
			// Potentially redirect to login: goto('/signin')
			return;
		}

		isSubmittingMyth = true;
		// Placeholder: In a real app, this would be a SvelteKit form action or API call
		// For now, simulate a delay and add to the list client-side for demo purposes
		await new Promise((resolve) => setTimeout(resolve, 1000));

		const newMythEntry: SubmittedMyth = {
			id: Math.random().toString(36).substring(2, 9),
			text: newMythText,
			submittedBy: currentUsername, // Use validated username
			votes: 0,
			createdAt: new Date().toISOString(),
			votedByCurrentUser: false
		};

		submittedMythsList = [newMythEntry, ...submittedMythsList];

		toast.success('Myth submitted for review!', {
			description: 'Your myth suggestion has been added to the community list.'
		});
		newMythText = '';
		isSubmittingMyth = false;
		// In a real app: await invalidateAll(); to refresh the list from the server
	}

	function handleVote(mythId: string) {
		if (!data.user) {
			toast.error('You must be logged in to vote.');
			return;
		}
		// Placeholder: Client-side update for demo
		submittedMythsList = submittedMythsList.map((myth) => {
			if (myth.id === mythId) {
				if (myth.votedByCurrentUser) {
					toast.info("You've already voted for this myth.");
					return myth;
				}
				return { ...myth, votes: myth.votes + 1, votedByCurrentUser: true };
			}
			return myth;
		});
		toast.success('Your vote has been counted!');
		// In a real app: make an API call and then invalidateAll() or update client cache.
	}
</script>

<RouteHead
	title="Myth Buster Community Hub"
	description="Join the Myth Buster community! Sign up for Discord notifications, suggest new myths for verification, and vote on submissions from fellow truth-seekers."
	keywords={[
		'community',
		'discord',
		'signup',
		'myth submission',
		'vote myths',
		'fact checking community'
	]}
/>

<div class="container mx-auto py-8 md:py-12">
	<div class="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
		<h1 class="text-center text-3xl font-bold md:text-left">Myth Buster Community Hub</h1>
		<Button variant="outline" disabled={isLoading} onclick={refreshData} class="w-full md:w-auto">
			<RefreshCw class={`mr-2 inline-block size-4 ${isLoading ? 'animate-spin' : ''}`} />
			Refresh Data
		</Button>
	</div>

	{#if pageError}
		<div class="my-4 rounded-md bg-destructive/20 p-4 text-destructive">
			<p>{pageError}</p>
		</div>
	{/if}

	<Tabs.Root bind:value={activeTab} class="w-full">
		<Tabs.List class="grid h-fit w-full grid-cols-1 gap-1 md:grid-cols-3">
			<Tabs.Trigger
				value="discord"
				class="flex items-center gap-1 overflow-hidden truncate whitespace-nowrap md:gap-2"
			>
				<Users class="inline-block size-4 shrink-0" />
				<span class="truncate">Join Discord Waitlist</span>
			</Tabs.Trigger>
			<Tabs.Trigger
				value="submit"
				class="flex items-center gap-1 overflow-hidden truncate whitespace-nowrap md:gap-2"
			>
				<MessageSquarePlus class="inline-block size-4 shrink-0" />
				<span class="truncate">Suggest a Myth</span>
			</Tabs.Trigger>
			<Tabs.Trigger
				value="vote"
				class="flex items-center gap-1 overflow-hidden truncate whitespace-nowrap md:gap-2"
			>
				<Vote class="inline-block size-4 shrink-0" />
				<span class="truncate">Vote on Submissions</span>
			</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="discord" class="py-6">
			<Card>
				<CardHeader>
					<CardTitle class="text-2xl">Community Discord Signups</CardTitle>
					<CardDescription>
						Be the first to know when our official Myth Buster Discord server goes live!
					</CardDescription>
				</CardHeader>
				<CardContent class="text-center">
					<h2 class="mb-2 text-xl font-medium text-muted-foreground">
						Registered Users for Discord
					</h2>
					<div class="text-6xl font-bold">
						{#if isLoading && activeTab === 'discord'}
							<div class="animate-pulse">
								<span class="opacity-50">...</span>
							</div>
						{:else}
							<NumberTicker value={signupCount} duration={1500} />
						{/if}
					</div>
					<p class="mt-4 text-muted-foreground">
						{signupCount === 1 ? 'person has' : 'people have'} joined the community waiting list.
					</p>
					<div class="mt-6 text-center">
						<p class="text-sm text-muted-foreground">
							For privacy reasons, individual email addresses are not displayed publicly.
						</p>
					</div>
				</CardContent>
				<CardFooter class="flex flex-col items-center justify-center">
					<p class="mx-auto mb-4 max-w-xl text-center text-lg">
						Join our worldwide community of myth busters committed to spreading truth and
						challenging misinformation.
					</p>
					<span class="relative">
						<AlertDialog.Root bind:open={discordSignupOpen}>
							<AlertDialog.Trigger>
								<Button variant="default" size="lg" class="border-green-200">
									Join the Waitlist
								</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Join our Community Waitlist</AlertDialog.Title>
									<AlertDialog.Description>
										Enter your details to be notified when our community Discord goes live.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<div class="grid gap-4 py-4">
									<div class="grid grid-cols-4 items-center gap-4">
										<Label for="discord-name" class="text-right">Name</Label>
										<Input id="discord-name" bind:value={discordSignupName} class="col-span-3" />
									</div>
									<div class="grid grid-cols-4 items-center gap-4">
										<Label for="discord-email" class="text-right">Email</Label>
										<Input
											id="discord-email"
											type="email"
											bind:value={discordSignupEmail}
											class="col-span-3"
										/>
									</div>
								</div>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action onclick={handleDiscordSubmit} disabled={isDiscordSubmitting}>
										{isDiscordSubmitting ? 'Submitting...' : 'Submit'}
									</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
						<LordIcon
							src={attention2}
							trigger="loop"
							stroke="thick"
							colors="primary:#10B981,secondary:#10b981"
							class="absolute -right-12 -top-2 size-14 shrink-0 md:-right-20 md:-top-8 md:size-20"
						/>
					</span>
				</CardFooter>
			</Card>
		</Tabs.Content>

		<Tabs.Content value="submit" class="py-6">
			<Card>
				<CardHeader>
					<CardTitle class="text-2xl">Suggest a Myth for Verification</CardTitle>
					<CardDescription>
						Have a myth you want our community or AI to investigate? Share it here!
					</CardDescription>
				</CardHeader>
				<CardContent>
					{#if data.user}
						<div class="relative">
							<div class="absolute inset-0 z-10 flex items-center justify-center bg-black/30 rounded-lg">
								<p class="rotate-[-10deg] transform text-2xl font-bold italic text-white">
									Feature Coming Soon
								</p>
							</div>
							<div class="pointer-events-none opacity-50 rounded-lg">
								<Label for="myth-text" class="mb-2 block font-medium">Your Myth Suggestion:</Label>
								<Textarea
									id="myth-text"
									bind:value={newMythText}
									placeholder="e.g., Does cracking your knuckles cause arthritis?"
									rows={4}
									class="mb-4 w-full"
								/>
								<Button
									onclick={handleMythSubmit}
									disabled={isSubmittingMyth}
									class="w-full md:w-auto"
								>
									<MessageSquarePlus class="mr-2 size-4" />
									{isSubmittingMyth ? 'Submitting...' : 'Submit Myth'}
								</Button>
							</div>
						</div>
					{:else}
						<div class="text-center">
							<p class="mb-4 text-lg">You need to be logged in to suggest a myth.</p>
							<Button href="/signin" variant="outline" size="lg">Sign In to Suggest</Button>
						</div>
					{/if}
				</CardContent>
				<CardFooter>
					<p class="text-sm text-muted-foreground">
						Submitted myths will be reviewed and may be featured for community voting or AI
						verification.
					</p>
				</CardFooter>
			</Card>
		</Tabs.Content>

		<Tabs.Content value="vote" class="py-6">
			<Card>
				<CardHeader>
					<CardTitle class="text-2xl">Community Myth Submissions</CardTitle>
					<CardDescription>
						Help prioritize which myths get investigated by voting on submissions from the
						community.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="relative overflow-hidden rounded-lg">
						<div
							class="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50"
						>
							<p class="rotate-[-10deg] transform text-2xl font-bold italic text-white">
								Feature Coming Soon
							</p>
						</div>
						<div class="pointer-events-none opacity-50">
							{#if submittedMythsList.length > 0}
								<ul class="space-y-4">
									{#each submittedMythsList as myth (myth.id)}
										<li class="rounded-lg border p-4">
											<p class="mb-2 text-lg">{myth.text}</p>
											<div
												class="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground"
											>
												<span>
													Submitted by: {myth.submittedBy || 'Anonymous'} on
													{new Date(myth.createdAt).toLocaleDateString()}
												</span>
												<Button
													variant={myth.votedByCurrentUser ? 'secondary' : 'outline'}
													size="sm"
													onclick={() => handleVote(myth.id)}
													disabled={!data.user || myth.votedByCurrentUser}
													title={!data.user
														? 'Sign in to vote'
														: myth.votedByCurrentUser
															? 'Already voted'
															: 'Upvote this myth'}
												>
													<ArrowUp class="mr-2 size-4" />
													Vote ({myth.votes})
												</Button>
											</div>
										</li>
									{/each}
								</ul>
							{:else}
								<p class="py-8 text-center text-lg text-muted-foreground">
									No community myths submitted yet. Why not <button
										class="text-primary underline"
										onclick={() => (activeTab = 'submit')}>suggest one</button
									>?
								</p>
							{/if}
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<p class="text-sm text-muted-foreground">
						Your votes help us decide which myths to tackle next! Log in to cast your vote.
					</p>
				</CardFooter>
			</Card>
		</Tabs.Content>
	</Tabs.Root>
</div>
