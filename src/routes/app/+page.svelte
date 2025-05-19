<script lang="ts">
	// Import UI components
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import {
		Flame,
		MenuIcon,
		HistoryIcon,
		DatabaseZap,
		Book,
		Link,
		ExternalLink,
		X
	} from 'lucide-svelte';
	import type { PageProps } from './$types';

	// Import our components
	import MythInput from './components/MythInput.svelte';
	import VerdictDisplay from './components/VerdictDisplay.svelte';
	import ExplanationDisplay from './components/ExplanationDisplay.svelte';
	import CitationList from './components/CitationList.svelte';
	import RelatedMyths from './components/RelatedMyths.svelte';
	import ShareOptions from './components/ShareOptions.svelte';
	import HistoryTimeline from './components/HistoryTimeline.svelte';
	import RetroGrid from '$lib/components/blocks/RetroGrid.svelte';
	import AuroraText from '$lib/components/blocks/AuroraText.svelte';

	// Reactive state using Svelte 5 syntax
	let showMobileMenu: boolean = $state(false);
	let activeTab: string = $state('citations');
	let clearingCache: boolean = $state(false);
	let loading: boolean = $state(false);

	// We'll use CSS media queries instead of JavaScript for responsive design

	// Get props using Svelte 5 syntax
	let { form }: PageProps = $props();

	// Get form data from the server

	// Handle cache clearing
	const handleClearCache: SubmitFunction = () => {
		clearingCache = true;
		return async ({ update }) => {
			clearingCache = false;
			await update();
		};
	};

	// Handle form submission
	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	};

	// Handle reset
	const handleReset: SubmitFunction = () => {
		return async ({ update }) => {
			await update();
		};
	};
</script>

<!-- Using CSS media queries instead of JavaScript for responsive design -->

<div class="min-h-screen bg-gradient-to-br from-background to-background/50">
	<!-- Main Content -->
	<main class="relative mx-auto min-h-screen">
		<!-- <RetroGrid /> -->

		<h3 class="p-6 text-center text-2xl font-bold md:text-5xl">
			Verify <AuroraText>Myths</AuroraText>
		</h3>
		<section class="mx-auto max-w-7xl p-4">
			{#if !form?.data?.verdict}
				<!-- Input Form View -->
				<div class="absolute inset-0 flex items-center justify-center">
					<MythInput />
				</div>
			{:else}
				<!-- Results View -->
				<div class="gap-6 lg:grid lg:grid-cols-5">
					<!-- Main Analysis Column -->
					<div class="space-y-6 lg:col-span-3">
						<!-- Cached indicator -->
						{#if form.cached}
							<div class="flex items-center justify-end">
								<Badge variant="outline" class="text-xs text-muted-foreground">
									<DatabaseZap class="mr-2 h-3 w-3" />
									Cached Response
								</Badge>
							</div>
						{/if}

						<VerdictDisplay
							explanation={form.data.explanation}
							verdict={form.data.verdict}
							myth={form.myth}
						/>

						<ExplanationDisplay
							explanation={form.data.explanation}
							citations={form.data.citations}
						/>

						<!-- Citations -->
						{#if form?.data?.citations && form.data.citations.length > 0}
							<Accordion.Root type="single">
								<Accordion.Item value="citations">
									<Accordion.Trigger class="flex items-center gap-2">
										<Book class="h-4 w-4 text-primary" />
										Citations ({form.data.citations.length})
									</Accordion.Trigger>
									<Accordion.Content>
										<div class="mt-4 space-y-3">
											{#each form.data.citations as citation, i}
												<div
													class="flex items-start gap-3 rounded-md border border-primary/20 bg-muted/30 p-3"
												>
													<Link class="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
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
												</div>
											{/each}
										</div>
									</Accordion.Content>
								</Accordion.Item>
							</Accordion.Root>
						{/if}

						<!-- Myth Origin -->
						{#if form?.data?.mythOrigin}
							<div class="rounded-lg border border-primary/20 bg-muted/30 p-4">
								<h3 class="mb-2 text-lg font-medium">Origin of the Myth</h3>
								<p class="text-muted-foreground">{form.data.mythOrigin}</p>
							</div>
						{/if}

						<!-- Try Another Button -->
						<form method="POST" action="?/reset" use:enhance={handleReset}>
							<Button
								type="submit"
								variant="outline"
								class="w-full border-primary py-6 text-lg text-primary hover:bg-primary/70"
							>
								Verify Another Myth
							</Button>
						</form>
					</div>

					<!-- Secondary Information Column -->
					<div class="mt-6 lg:col-span-2 lg:mt-0">
						<!-- Mobile view with tabs (shown only on small screens) -->
						<div class="block md:hidden">
							<Tabs.Root value={activeTab} onValueChange={(v) => (activeTab = v)}>
								<Tabs.List class="grid grid-cols-3">
									<Tabs.Trigger value="citations" class="flex items-center gap-1">
										Citations
									</Tabs.Trigger>
									<Tabs.Trigger value="related" class="flex items-center gap-1"
										>Related</Tabs.Trigger
									>
									<Tabs.Trigger value="history" class="flex items-center gap-1"
										>History</Tabs.Trigger
									>
								</Tabs.List>
								<div class="mt-4">
									{#if activeTab === 'citations'}
										<CitationList citations={form.data.citations} />
									{:else if activeTab === 'related'}
										<RelatedMyths relatedMyth={form.data.relatedMyth} />
									{:else}
										<HistoryTimeline />
									{/if}
								</div>
							</Tabs.Root>
						</div>

						<!-- Desktop view (shown only on medium screens and up) -->
						<div class="hidden space-y-6 md:block">
							<CitationList citations={form.data.citations} />
							<ShareOptions
								myth={form.myth}
								explanation={form.data.explanation}
								verdict={form.data.verdict}
							/>
							<RelatedMyths relatedMyth={form.data.relatedMyth} />

							{#if form?.data?.whyBelieved}
								<div class="rounded-lg border border-primary/20 bg-muted/30 p-4">
									<h3 class="mb-2 text-lg font-medium">Why People Believe This Myth</h3>
									<p class="text-muted-foreground">{form.data.whyBelieved}</p>
								</div>
							{/if}

							<HistoryTimeline />
						</div>
					</div>
				</div>
			{/if}
		</section>
	</main>
</div>
