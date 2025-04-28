<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Progress from '$lib/components/ui/progress';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Slider from '$lib/components/ui/slider';
	import { Check, Flame, HelpCircle, Skull, X } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	let myth = $state('');
	let loading = $state(false);
	let { children } = $props();

	// Derive verdict text from form data
	let verdictText = $derived(() => {
		const verdict = $page.form?.data?.verdict;
		return verdict === 'true'
			? 'True (Confirmed!)'
			: verdict === 'false'
				? 'False (Busted!)'
				: verdict === 'inconclusive'
					? 'Inconclusive'
					: '';
	});
</script>

<section class="min-h-screen bg-black py-3">
	<Card.Root
		class="mx-auto mt-12 max-w-2xl rounded-md border-2 border-primary bg-background shadow-lg"
	>
		<Card.Header>
			<Card.Title class="flex items-center gap-2 font-serif text-3xl">
				<Flame class="h-7 w-7 animate-bounce text-primary" /> Myth Buster
				<Badge class="ml-2 bg-accent text-accent-foreground">AI</Badge>
			</Card.Title>
			<Card.Description class="font-sans text-lg text-muted-foreground">
				Enter a myth, rumor, or claim below to verify its truth with AI. Explore origins, see
				citations, and try myth-themed Svelte 5 code challenges!
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<Tabs.Root value="verify" class="w-full">
				<Tabs.List>
					<Tabs.Trigger value="verify">Verify Myth</Tabs.Trigger>
					<Tabs.Trigger value="origins">Origins</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="verify">
					<form
						class="mt-4 flex flex-col gap-4"
						method="POST"
						action="?/verifyMyth"
						use:enhance={() => {
							loading = true;

							return async ({ update }) => {
								// Update the form data
								await update();

								// Reset loading state
								loading = false;

								// Clear the input after successful submission
								if ($page.form?.data) {
									myth = '';
								}
							};
						}}
					>
						<Textarea
							name="myth"
							bind:value={myth}
							placeholder="e.g. 'Bulls get angry when they see red.'"
							class="min-h-[80px] rounded border-2 border-primary/30 bg-card p-3 font-mono text-lg text-foreground shadow-sm focus:border-primary"
						/>
						<Button
							type="submit"
							class="self-end bg-primary px-6 py-2 text-lg font-bold text-primary-foreground ring-accent transition-all hover:ring-2"
						>
							{#if loading}
								Verifying...
							{:else}
								Verify Myth
							{/if}
						</Button>
					</form>

					{#if $page.form?.data?.verdict && !loading}
						{@const verdict = $page.form?.data?.verdict}
						<AlertDialog.Root open={!!$page.form?.data?.verdict}>
							<AlertDialog.Content
								class="shadow-codex-stone animate-fade-in mt-6 rounded-md border-2 border-primary bg-card"
							>
								<AlertDialog.Header class="flex items-center gap-2">
									{#if verdict === 'true'}
										<Check class="animate-scale-up h-7 w-7 text-primary" />
									{:else if verdict === 'false'}
										<X class="animate-scale-up h-7 w-7 text-destructive" />
									{:else}
										<HelpCircle class="animate-scale-up h-7 w-7 text-accent" />
									{/if}
									<span class="font-serif text-2xl">
										{verdict === 'true'
											? 'True (Confirmed!)'
											: verdict === 'false'
												? 'False (Busted!)'
												: 'Inconclusive'}
									</span>
								</AlertDialog.Header>
								<AlertDialog.Description class="text-muted-foreground">
									{verdict === 'true'
										? 'This myth is confirmed!'
										: verdict === 'false'
											? 'This myth is busted!'
											: 'The truth remains elusive.'}
								</AlertDialog.Description>
								{#if $page.form?.data?.citations?.length > 0}
									<div class="mt-4">
										<span class="text-sm font-bold text-foreground">Citations:</span>
										<ul class="ml-6 list-disc text-sm text-muted-foreground">
											{#each $page.form?.data?.citations as c}
												<li>
													<a href={c} class="underline hover:text-accent" target="_blank">{c}</a>
												</li>
											{/each}
										</ul>
									</div>
								{/if}
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Close</AlertDialog.Cancel>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					{/if}
				</Tabs.Content>

				<Tabs.Content value="origins">
					<Accordion.Root
						type="single"
						class="shadow-codex-stone mt-4 rounded-md border-2 border-accent bg-card"
					>
						<Accordion.Item value="origin1">
							<Accordion.Trigger class="font-serif text-lg"
								>Why do people believe this myth?</Accordion.Trigger
							>
							<Accordion.Content class="p-4 text-muted-foreground">
								(Coming soon) Historical context, cultural origins, and fun facts.
							</Accordion.Content>
						</Accordion.Item>
						<Accordion.Item value="origin2">
							<Accordion.Trigger class="font-serif text-lg"
								>Seasonal/Trending Myths</Accordion.Trigger
							>
							<Accordion.Content class="p-4 text-muted-foreground">
								(Coming soon) Explore myths by season or trending topics.
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</Tabs.Content>
			</Tabs.Root>
		</Card.Content>
		<Card.Footer class="flex items-center justify-between">
			<Button href="/">Back to Landing</Button>
		</Card.Footer>
	</Card.Root>
	<style>
		/* Custom animations for verdict and flourishes */
		@keyframes fade-in {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
		.animate-fade-in {
			animation: fade-in 0.3s ease;
		}
		@keyframes scale-up {
			from {
				transform: scale(0.7);
				opacity: 0;
			}
			to {
				transform: scale(1);
				opacity: 1;
			}
		}
		.animate-scale-up {
			animation: scale-up 0.3s cubic-bezier(0.4, 2, 0.6, 1) both;
		}
		.shadow-codex-stone {
			box-shadow: 0 2px 8px 0 hsl(var(--border) / 0.2);
		}
	</style>
</section>
