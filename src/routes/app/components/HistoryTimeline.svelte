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
		Sparkles
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

	// Props
	let { mythHistory }: { mythHistory: PersistedState<MythHistoryEntry[]> } = $props();

	// console.log('mythHistory prop in HistoryTimeline:', mythHistory); // For debugging

	// Reactive accessor for history items, ensuring it's always an array
	// Ensure mythHistory is defined before accessing .current
	let historyItems: MythHistoryEntry[] = $derived(mythHistory ? mythHistory.current || [] : []);

	// Toggle bookmark status
	function toggleBookmark(id: string) {
		const currentItems = mythHistory.current || [];
		const updatedItems = currentItems.map((item) =>
			item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
		);
		mythHistory.current = updatedItems;
		toast.success(
			updatedItems.find((item) => item.id === id)?.isBookmarked
				? 'Myth bookmarked!'
				: 'Bookmark removed.'
		);
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
</script>

<div class="rounded-lg border border-primary/20 p-4">
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
					class="rounded-md border border-primary/10 bg-muted/30 p-6 text-center text-muted-foreground"
				>
					<HelpCircle class="mx-auto mb-2 h-8 w-8 text-primary/50" />
					No verification history yet.
					<br />
					Verify some myths to see them here.
				</div>
			{:else}
				{#each historyItems as item (item.id)}
					{@const Icon = getVerdictIcon(item.result.data?.verdict)}
					<div class="history-item">
						<Card.Root class="overflow-hidden">
							<Card.Header class="flex flex-row items-start justify-between gap-4 bg-muted/20 p-4">
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
										class="h-8 w-8 text-muted-foreground hover:text-primary"
										onclick={() => toggleBookmark(item.id)}
										aria-label={item.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
									>
										{#if item.isBookmarked}
											<BookmarkCheck class="h-4 w-4" />
										{:else}
											<Bookmark class="h-4 w-4" />
										{/if}
									</Button>
									<form method="POST" action="?/verifyMyth">
										<input type="hidden" name="myth" value={item.myth} />
										<Button
											variant="ghost"
											size="icon"
											type="submit"
											class="h-8 w-8"
											aria-label="Re-verify myth"
										>
											<ArrowRight class="h-4 w-4" />
										</Button>
									</form>
								</div>
							</Card.Header>
							<Card.Content class="p-0">
								<Accordion.Root type="single" class="w-full">
									<Accordion.Item value={`details-${item.id}`} class="border-none">
										<Accordion.Trigger class="px-4 py-3 text-sm hover:bg-muted/30">
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
												<div class="rounded-md border border-primary/10 bg-muted/20 p-3">
													<h4
														class="mb-1 flex items-center gap-1.5 text-sm font-medium text-primary"
													>
														<Lightbulb class="h-4 w-4" />
														Origin of the Myth
													</h4>
													<p class="text-sm text-muted-foreground">{item.result.data.mythOrigin}</p>
												</div>
											{/if}

											{#if item.result.data?.whyBelieved}
												<div class="rounded-md border border-primary/10 bg-muted/20 p-3">
													<h4
														class="mb-1 flex items-center gap-1.5 text-sm font-medium text-primary"
													>
														<Brain class="h-4 w-4" />
														Why People Believe This
													</h4>
													<p class="text-sm text-muted-foreground">
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
													class="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
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
