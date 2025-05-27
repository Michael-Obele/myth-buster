<script lang="ts">
	import {
		Clock,
		Bookmark,
		BookmarkCheck,
		Check,
		X,
		HelpCircle,
		Trash2,
		ArrowRight,
		Book,
		Link as LinkIcon,
		ExternalLink,
		Brain,
		Lightbulb,
		Sparkles,
		Loader2
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { PersistedState } from 'runed';
	import type { MythHistoryEntry } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Badge } from '$lib/components/ui/badge';
	import ExplanationDisplay from './ExplanationDisplay.svelte';
	import CitationList from './CitationList.svelte';
	import RelatedMyths from './RelatedMyths.svelte';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { enhance } from '$app/forms'; // Import enhance

	// Props
	let { mythHistory }: { mythHistory: PersistedState<MythHistoryEntry[]> } = $props();

	// console.log('mythHistory prop in HistoryTimeline:', mythHistory); // For debugging

	// Reactive accessor for history items, ensuring it's always an array
	// Ensure mythHistory is defined before accessing .current
	let historyItems: MythHistoryEntry[] = $derived(mythHistory ? mythHistory.current || [] : []);

	// Local state to track loading status for individual history items
	let loadingStates: Map<string, boolean> = $state(new Map());

	// Function to get the loading state for a specific item
	function getItemLoading(itemId: string): boolean {
		return loadingStates.get(itemId) || false;
	}

	const bookmarkedIds = new PersistedState<string[]>('myth-bookmarks', []);

	function isBookmarked(id: string) {
		return bookmarkedIds.current.includes(id);
	}

	// Toggle bookmark status
	function toggleBookmark(id: string) {
		const idx = bookmarkedIds.current.indexOf(id);
		if (idx === -1) {
			bookmarkedIds.current = [...bookmarkedIds.current, id];
			toast.success('Myth bookmarked!');
		} else {
			bookmarkedIds.current = bookmarkedIds.current.filter((x) => x !== id);
			toast.success('Bookmark removed.');
		}
	}

	// Format date for display
	function formatDate(timestamp: number): string {
		const date = new Date(timestamp);
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(date);
	}

	// Get icon for verdict
	function getVerdictIcon(verdict: 'true' | 'false' | 'inconclusive' | undefined) {
		if (!verdict) return HelpCircle; // Default icon if verdict is undefined
		switch (verdict) {
			case 'true':
				return Check;
			case 'false':
				return X;
			default:
				return HelpCircle;
		}
	}

	// Get color for verdict
	function getVerdictColor(verdict: 'true' | 'false' | 'inconclusive' | undefined): string {
		if (!verdict) return 'text-gray-500'; // Default color
		switch (verdict) {
			case 'true':
				return 'text-emerald-500';
			case 'false':
				return 'text-red-500';
			default:
				return 'text-purple-500';
		}
	}

	// Handle clear history
	function handleClearHistory() {
		if (confirm('Are you sure you want to clear your myth verification history?')) {
			mythHistory.current = [];
			toast.success('History cleared', {
				description: 'Your myth verification history has been cleared',
				duration: 3000
			});
		}
	}

	// Enhance function for re-verifying from history
	const handleReverifyEnhance = (itemId: string) => {
		loadingStates.set(itemId, true); // Set loading state for this item
		return async ({ update, result }) => {
			await update(); // Let SvelteKit handle the form result and page update
			loadingStates.set(itemId, false); // Reset loading state for this item
		};
	};
</script>

<div class="border-primary/20 rounded-lg border p-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="flex items-center gap-2 text-lg font-medium">
			<Clock class="h-4 w-4" />
			Verification History
		</h3>

		{#if historyItems.length > 0}
			<Button
				variant="ghost"
				size="sm"
				class="text-muted-foreground hover:text-destructive"
				onclick={handleClearHistory}
			>
				<Trash2 class="h-4 w-4" />
			</Button>
		{/if}
	</div>
	<ScrollArea class="h-120 rounded-md border p-4">
		<div class="space-y-4">
			{#if historyItems.length === 0}
				<div
					class="border-primary/10 bg-muted/30 text-muted-foreground rounded-md border p-6 text-center"
				>
					<HelpCircle class="text-primary/50 mx-auto mb-2 h-8 w-8" />
					No verification history yet.
					<br />
					Verify some myths to see them here.
				</div>
			{:else}
				{#each historyItems as item (item.id)}
					{@const Icon = getVerdictIcon(item.result.data?.verdict)}
					<div class="history-item">
						<Card.Root class="overflow-hidden">
							<Card.Header class="bg-muted/20 flex flex-row items-start justify-between gap-4 p-4">
								<div class="flex-1 space-y-1">
									<div class="flex items-center gap-2">
										<Icon
											class={`h-5 w-5 shrink-0 ${getVerdictColor(item.result.data?.verdict)}`}
										/>
										<Card.Title class="line-clamp-2 text-base font-semibold">
											{item.myth}
										</Card.Title>
									</div>
									<Card.Description class="text-xs">
										Verified: {formatDate(item.timestamp)}
										{#if item.result.cached}
											<Badge variant="outline" class="ml-2 px-1.5 py-0.5 text-xs font-normal">
												Cached
											</Badge>
										{/if}
									</Card.Description>
								</div>
								<div class="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										class="text-muted-foreground h-8 w-8 hover:text-white"
										onclick={() => toggleBookmark(item.id)}
										aria-label={isBookmarked(item.id) ? 'Remove bookmark' : 'Add bookmark'}
									>
										{#if isBookmarked(item.id)}
											<BookmarkCheck class="h-4 w-4" />
										{:else}
											<Bookmark class="h-4 w-4" />
										{/if}
									</Button>

									<!-- Form for re-verifying -->
									<form
										method="POST"
										action="?/verifyMyth"
										use:enhance={handleReverifyEnhance(item.id)}
										class="inline-flex"
									>
										<input type="hidden" name="myth" value={item.myth} />
										<Button
											variant="ghost"
											size="icon"
											type="submit"
											class="h-8 w-8"
											aria-label="Re-verify myth"
											disabled={getItemLoading(item.id)}
										>
											{#if getItemLoading(item.id)}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else}
												<ArrowRight class="h-4 w-4" />
											{/if}
										</Button>
									</form>
								</div>
							</Card.Header>
							<Card.Content class="p-0">
								<Accordion.Root type="single" class="w-full">
									<Accordion.Item value={`details-${item.id}`} class="border-none">
										<Accordion.Trigger class="hover:bg-muted/30 px-4 py-3 text-sm">
											View Details
										</Accordion.Trigger>
										<Accordion.Content class="space-y-4 p-4 pt-0">
											{#if item.result.data?.explanation}
												<ExplanationDisplay
													explanation={item.result.data.explanation}
													citations={item.result.data.citations || []}
												/>
											{/if}

											{#if item.result.data?.mythOrigin}
												<div class="border-primary/10 bg-muted/20 rounded-md border p-3">
													<h4
														class="text-primary mb-1 flex items-center gap-1.5 text-sm font-medium"
													>
														<Lightbulb class="h-4 w-4" />
														Origin of the Myth
													</h4>
													<p class="text-muted-foreground text-sm">{item.result.data.mythOrigin}</p>
												</div>
											{/if}

											{#if item.result.data?.whyBelieved}
												<div class="border-primary/10 bg-muted/20 rounded-md border p-3">
													<h4
														class="text-primary mb-1 flex items-center gap-1.5 text-sm font-medium"
													>
														<Brain class="h-4 w-4" />
														Why People Believe This
													</h4>
													<p class="text-muted-foreground text-sm">
														{item.result.data.whyBelieved}
													</p>
												</div>
											{/if}

											{#if item.result.data?.relatedMyth}
												<RelatedMyths relatedMyth={item.result.data.relatedMyth} />
											{/if}

											{#if item.result.data?.citations && item.result.data.citations.length > 0}
												<CitationList citations={item.result.data.citations} />
											{/if}

											{#if item.result.error}
												<div
													class="border-destructive/20 bg-destructive/10 text-destructive rounded-md border p-3 text-sm"
												>
													<p><strong>Error during verification:</strong> {item.result.error}</p>
												</div>
											{/if}
										</Accordion.Content>
									</Accordion.Item>
								</Accordion.Root>
							</Card.Content>
						</Card.Root>
					</div>
				{/each}
			{/if}
		</div>
	</ScrollArea>
</div>
