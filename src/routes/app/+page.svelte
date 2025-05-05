<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as Progress from '$lib/components/ui/progress';
	import * as Separator from '$lib/components/ui/separator';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		DatabaseZap,
		Check,
		Flame,
		HelpCircle,
		X,
		Link,
		Book,
		ExternalLink,
		Trash2
	} from 'lucide-svelte';

	let myth = $state('');
	let loading = $state(false);
	let mythJustSubmitted = $state(false);
	let clearingCache = $state(false);

	let { form }: PageProps = $props();

	let verdictText = $derived(() => {
		const verdict = form?.data?.verdict;
		return verdict === 'true'
			? 'True (Confirmed!)'
			: verdict === 'false'
				? 'False (Busted!)'
				: verdict === 'inconclusive'
					? 'Inconclusive'
					: '';
	});

	let verdictColor = $derived(() => {
		const verdict = form?.data?.verdict;
		return verdict === 'true'
			? 'bg-emerald-500'
			: verdict === 'false'
				? 'bg-red-500'
				: 'bg-purple-500';
	});

	let verdictIcon = $derived(() => {
		const verdict = form?.data?.verdict;
		return verdict === 'true' ? Check : verdict === 'false' ? X : HelpCircle;
	});

	let isCached = $derived(() => {
		return form && 'cached' in form && form.cached === true;
	});

	// Helper function to extract the myth from the response
	let displayedMyth = $derived(() => {
		if (!form) return myth;

		// For both cached and non-cached responses, use the same logic
		return form?.data?.answer?.choices?.[0]?.message?.content?.split('\n')[0] || myth;
	});

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		mythJustSubmitted = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};

	const handleReset: SubmitFunction = () => {
		return async ({ update }) => {
			// Clear the myth input when resetting
			myth = '';
			await update();
		};
	};

	const handleClearCache: SubmitFunction = () => {
		clearingCache = true;
		return async ({ update }) => {
			clearingCache = false;
			await update();
		};
	};

	$effect(() => {
		form;
		mythJustSubmitted = false;
	});
</script>

<section class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-6">
	<Card.Root
		class="mx-auto max-w-3xl rounded-xl border-2 border-primary/50 bg-background shadow-xl"
	>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="flex items-center gap-2 font-serif text-3xl">
					<Flame class="h-7 w-7 animate-bounce text-primary" /> Myth Buster
					<Badge class="ml-2 bg-primary/20 text-primary">AI Powered</Badge>
				</Card.Title>

				<!-- Clear Cache Button -->
				<form method="POST" action="?/clearCache" use:enhance={handleClearCache}>
					<Button
						type="submit"
						variant="outline"
						size="sm"
						class="text-xs text-muted-foreground hover:text-destructive"
						disabled={clearingCache}
					>
						{#if clearingCache}
							<div class="flex items-center gap-1">
								<div
									class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
								></div>
								Clearing...
							</div>
						{:else}
							<Trash2 class="mr-1 h-3 w-3" />
							Clear Cache
						{/if}
					</Button>
				</form>
			</div>
			<Card.Description class="font-sans text-lg text-muted-foreground">
				Enter a myth, rumor, or claim below to verify its truth with AI-powered analysis.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if !form?.data?.verdict || loading}
				<form
					class="mt-4 flex flex-col gap-4"
					method="POST"
					action="?/verifyMyth"
					use:enhance={handleSubmit}
				>
					<Textarea
						name="myth"
						bind:value={myth}
						placeholder="e.g. 'Bulls get angry when they see red.'"
						class="min-h-[100px] rounded-lg border-2 border-primary/30 bg-card p-3 font-mono text-lg text-foreground shadow-sm focus:border-primary"
					/>
					<Button
						type="submit"
						class="self-end bg-primary px-6 py-2 text-lg font-bold text-primary-foreground ring-accent transition-all hover:ring-2 disabled:opacity-50"
						disabled={loading || !myth.trim()}
					>
						{#if loading}
							<div class="flex items-center gap-2">
								<div
									class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
								></div>
								Analyzing...
							</div>
						{:else}
							Verify Myth
						{/if}
					</Button>
				</form>
			{:else}
				<div class="mt-4">
					<h3 class="mb-2 font-medium text-muted-foreground">Myth that was analyzed</h3>
					<div class="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm">
						{form.myth}
					</div>
				</div>

				<!-- Cached indicator -->
				{#if form.cached}
					<div class="mt-2 flex items-center justify-end">
						<Badge variant="outline" class="text-xs text-muted-foreground">
							<DatabaseZap />
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="mr-1"
							>
								<rect width="18" height="18" x="3" y="3" rx="2" />
								<path d="M3 9h18" />
								<path d="M3 15h18" />
								<path d="M9 3v18" />
								<path d="M15 3v18" />
							</svg>
							Cached Response
						</Badge>
					</div>
				{/if}

				<!-- Verdict Card -->
				<div class="mt-6">
					<div class="mb-4 flex items-center gap-2">
						<div
							class={`flex h-10 w-10 items-center justify-center rounded-full ${verdictColor} text-white`}
						>
							{#if form?.data?.verdict === 'true'}
								<Check />
							{:else if form?.data?.verdict === 'false'}
								<X />
							{:else}
								<HelpCircle />
							{/if}
						</div>
						<h2 class="text-2xl font-bold">{verdictText()}</h2>
					</div>

					<!-- Explanation -->
					<div
						class="mb-6 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"
					>
						<h3 class="mb-2 font-medium">Explanation</h3>
						<p class="text-muted-foreground">
							{form?.data?.explanation || 'No explanation provided.'}
						</p>
					</div>

					<!-- Citations -->
					{#if form?.data?.citations && form.data.citations.length > 0}
						<Accordion.Root type="single" class="w-full">
							<Accordion.Item value="citations">
								<Accordion.Trigger
									class="flex w-full items-center justify-between py-2 text-left font-medium"
								>
									<div class="flex items-center gap-2">
										<Book class="h-4 w-4" />
										Citations
									</div>
								</Accordion.Trigger>
								<Accordion.Content class="pt-2">
									<ul class="space-y-2">
										{#each form.data.citations as citation}
											<li
												class="flex items-start gap-2 rounded border border-border bg-muted/30 p-2"
											>
												<Link class="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
												<div>
													<p class="font-medium">{citation.title}</p>
													<a
														href={citation.url}
														target="_blank"
														rel="noopener noreferrer"
														class="flex items-center gap-1 text-sm text-primary hover:underline"
													>
														{citation.url}
														<ExternalLink class="h-3 w-3" />
													</a>
												</div>
											</li>
										{/each}
									</ul>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					{/if}

					<!-- Myth Origin -->
					{#if form?.data?.mythOrigin}
						<div class="mt-4 rounded-lg border border-border bg-muted/30 p-4">
							<h3 class="mb-2 font-medium">Origin of the Myth</h3>
							<p class="text-sm text-muted-foreground">{form.data.mythOrigin}</p>
						</div>
					{/if}

					<!-- Try Another Button -->
					<form method="GET" class="mt-6" use:enhance={handleReset}>
						<Button type="submit" variant="outline" class="w-full border-primary text-primary">
							Verify Another Myth
						</Button>
					</form>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</section>
