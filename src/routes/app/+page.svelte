<script lang="ts">
	// Import UI components
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Accordion from '$lib/components/ui/accordion';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { enhance, applyAction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import {
		Flame,
		MenuIcon,
		HistoryIcon,
		DatabaseZap,
		Book,
		Link,
		ExternalLink,
		X,
		Trash2
	} from 'lucide-svelte';
	import type { PageProps } from './$types';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';
	import { PersistedState } from 'runed';
	import type { MythHistoryEntry, MythVerificationResult } from '$lib/types';

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
	let activeTab: string = $state('citations');
	let loading: boolean = $state(false);

	// We'll use CSS media queries instead of JavaScript for responsive design

	// Get props using Svelte 5 syntax
	let { form }: PageProps = $props();

	// Client-side persisted history
	const mythHistory = new PersistedState<MythHistoryEntry[]>('myth-history', []);
	const MAX_HISTORY_ITEMS = 100;

	// Function to add a verification result to the persisted history
	function addResultToHistory(result: MythVerificationResult) {
		console.log('[addResultToHistory] Received result:', JSON.parse(JSON.stringify(result)));
		if (result && result.success === true && typeof result.myth === 'string' && result.data) {
			const newEntry: MythHistoryEntry = {
				id: crypto.randomUUID(),
				myth: result.myth!, // myth is guaranteed by the if condition
				timestamp: Date.now(),
				result: result, // The entire form object which matches MythVerificationResult
				isBookmarked: false
			};

			let currentHistory = mythHistory.current || [];

			// Prevent adding if the latest entry seems identical based on myth and explanation
			// This helps avoid duplicates
			if (currentHistory.length > 0) {
				const latestEntry = currentHistory[0];
				if (
					latestEntry.myth === newEntry.myth &&
					latestEntry.result.data?.explanation === newEntry.result.data?.explanation &&
					latestEntry.result.data?.verdict === newEntry.result.data?.verdict &&
					latestEntry.result.cached === newEntry.result.cached
				) {
					return; // Skip adding identical entry
				}
			}

			const updatedHistory = [newEntry, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
			console.log('[addResultToHistory] New entry created:', JSON.parse(JSON.stringify(newEntry)));
			console.log(
				'[addResultToHistory] Current history before update:',
				JSON.parse(JSON.stringify(mythHistory.current))
			);
			mythHistory.current = updatedHistory;
			console.log(
				'[addResultToHistory] History updated. New mythHistory.current:',
				JSON.parse(JSON.stringify(mythHistory.current))
			);
		} else {
			console.log(
				'[addResultToHistory] Conditions not met to add to history. Result:',
				JSON.parse(JSON.stringify(result))
			);
		}
	}

	// Handle cache clearing (this is for a separate server action, not used in current UI for myth history)
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
		return async ({ update, result }) => {
			loading = false;
			await update();
			// After the form prop is updated, if the submission was successful, add it to history
			// The `result` here is the SvelteKit action result, which is the same as `form` after `update()`
			if (result.type === 'success' && result.data) {
				// We need to cast result.data because SubmitFunction result type is generic
				const verificationResult = result.data as MythVerificationResult;
				console.log(
					'[handleSubmit] Form submission successful. Verification result from server:',
					JSON.parse(JSON.stringify(verificationResult))
				);
				if (verificationResult.success) {
					addResultToHistory(verificationResult);
				} else {
					console.log(
						'[handleSubmit] Verification was not successful, not adding to history. Result:',
						JSON.parse(JSON.stringify(verificationResult))
					);
				}
			} else {
				console.log(
					'[handleSubmit] Form submission result was not successful or data is missing. Result type:',
					result.type
				);
			}
		};
	};

	// Handle reset
	// const handleReset: SubmitFunction = () => {
	// 	return async ({ update }) => {
	// 		await update(); // Ensures page data (form) is reset based on server response
	// 		console.log(
	// 			'[handleReset] Clearing client-side persisted history. Current history:',
	// 			JSON.parse(JSON.stringify(mythHistory.current))
	// 		);
	// 		mythHistory.current = []; // Clear client-side persisted history
	// 		console.log(
	// 			'[handleReset] Client-side persisted history cleared. New mythHistory.current:',
	// 			JSON.parse(JSON.stringify(mythHistory.current))
	// 		);
	// 	};
	// };

	function resetUIVisibility() {
		form = {} as PageProps['form']; // Reset form to trigger UI change to input view
		// Or form = null; if that's how your initial state is better represented
	}

	async function handleClearAllData() {
		console.log(
			'[handleClearAllData] Clearing client and server data. Current client history:',
			JSON.parse(JSON.stringify(mythHistory.current))
		);
		mythHistory.current = [];
		try {
			const response = await fetch('/app?/clearServerCache', { method: 'POST' });
			if (response.ok) {
				const resJson = await response.json();
				console.log('[handleClearAllData] Server cache cleared:', resJson);
				toast.success('Client history & Server API cache cleared!');
			} else {
				console.error('[handleClearAllData] Failed to clear server cache:', response.statusText);
				toast.error('Failed to clear server cache. Client history cleared.');
			}
		} catch (error) {
			console.error('[handleClearAllData] Error calling clearServerCache:', error);
			toast.error('Error clearing server cache. Client history cleared.');
		}
		// Reset UI to input view as well
		resetUIVisibility();
	}

	console.log('mythHistory', mythHistory.current);
</script>

<RouteHead
	title="Myth Buster Game - Test Your Knowledge"
	description="Test your knowledge and bust myths in our interactive game. See if you can distinguish fact from fiction."
	keywords={['myth buster game', 'trivia', 'fact or fiction', 'knowledge test', 'ai game']}
/>

<!-- Using CSS media queries instead of JavaScript for responsive design -->

<div class="min-h-screen bg-gradient-to-br from-background to-background/50">
	<!-- Main Content -->
	<main class="relative mx-auto min-h-screen">
		<!-- <RetroGrid /> -->

		<h3 class="p-6 text-center text-2xl font-bold md:text-5xl">
			Verify <AuroraText>Myths</AuroraText>
		</h3>
		<section class="mx-auto max-w-7xl p-4">
			<div class="gap-6 lg:grid lg:grid-cols-5">
				<!-- Main Analysis Column -->
				<div class="space-y-6 lg:col-span-3">
					{#if !form?.data?.verdict}
						<!-- Input Form View -->
						<div class="relative flex h-full min-h-[calc(100vh-200px)] items-center justify-center">
							<MythInput {loading} {handleSubmit} />
						</div>
					{:else}
						<!-- Results View for Main Column -->
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

						<!-- Citations specific to the main result display -->
						{#if form?.data?.citations && form.data.citations.length > 0}
							<Accordion.Root type="single" collapsible>
								<Accordion.Item value="main-column-citations">
									<Accordion.Trigger class="flex items-center gap-2">
										<Book class="h-4 w-4 text-primary" />
										Detailed Citations ({form.data.citations.length})
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

						<!-- Why People Believe This Myth -->
						{#if form?.data?.whyBelieved}
							<div class="rounded-lg border border-primary/20 bg-muted/30 p-4">
								<h3 class="mb-2 text-lg font-medium">Why People Believe This Myth</h3>
								<p class="text-muted-foreground">{form.data.whyBelieved}</p>
							</div>
						{/if}

						<!-- Share Options for current myth -->
						{#if form.myth && form.data?.verdict}
							<ShareOptions
								myth={form.myth}
								explanation={form.data.explanation}
								verdict={form.data.verdict}
							/>
						{/if}

						<!-- Try Another Button -->
						<Button
							type="button"
							variant="outline"
							class="w-full border-primary py-6 text-lg text-primary hover:bg-primary/70"
							onclick={resetUIVisibility}
						>
							Verify Another Myth
						</Button>
					{/if}
				</div>

				<!-- Secondary Information Column -->
				<div class="mt-6 lg:col-span-2 lg:mt-0">
					<!-- Mobile view with tabs (shown only on small screens) -->
					<div class="block md:hidden">
						<Tabs.Root value={activeTab} onValueChange={(v) => (activeTab = v)}>
							<Tabs.List class="grid grid-cols-3">
								<Tabs.Trigger
									value="citations"
									class="flex items-center gap-1"
									disabled={!form?.data?.citations || form.data.citations.length === 0}
								>
									Citations
								</Tabs.Trigger>
								<Tabs.Trigger
									value="related"
									class="flex items-center gap-1"
									disabled={!form?.data?.relatedMyth}
								>
									Related
								</Tabs.Trigger>
								<Tabs.Trigger value="history" class="flex items-center gap-1">History</Tabs.Trigger>
							</Tabs.List>
							<div class="mt-4">
								{#if activeTab === 'citations'}
									{#if form?.data?.citations && form.data.citations.length > 0}
										<CitationList citations={form.data.citations} />
									{:else}
										<div
											class="rounded-md border border-primary/10 bg-muted/30 p-4 text-center text-sm text-muted-foreground"
										>
											No citations available for the current myth.
										</div>
									{/if}
								{:else if activeTab === 'related'}
									{#if form?.data?.relatedMyth}
										<RelatedMyths relatedMyth={form.data.relatedMyth} />
									{:else}
										<div
											class="rounded-md border border-primary/10 bg-muted/30 p-4 text-center text-sm text-muted-foreground"
										>
											No related myth to display.
										</div>
									{/if}
								{:else if activeTab === 'history'}
									<HistoryTimeline {mythHistory} />
								{/if}
							</div>
						</Tabs.Root>
					</div>

					<!-- Desktop view (shown only on medium screens and up) -->
					<div class="hidden space-y-6 md:block">
						{#if form?.data?.citations && form.data.citations.length > 0}
							<CitationList citations={form.data.citations} />
						{:else if form?.data?.verdict}
							<!-- Only show empty state if results are active -->
							<div
								class="rounded-md border border-primary/10 bg-muted/30 p-4 text-center text-sm text-muted-foreground"
							>
								No citations available for the current myth.
							</div>
						{/if}

						{#if form?.data?.relatedMyth}
							<RelatedMyths relatedMyth={form.data.relatedMyth} />
						{:else if form?.data?.verdict}
							<!-- Only show empty state if results are active -->
							<div
								class="rounded-md border border-primary/10 bg-muted/30 p-4 text-center text-sm text-muted-foreground"
							>
								No related myth to display.
							</div>
						{/if}
						<HistoryTimeline {mythHistory} />
					</div>
				</div>
			</div>
		</section>
	</main>
</div>
