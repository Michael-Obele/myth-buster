<script lang="ts">
	import { animate } from 'svelte-motion';
	import {
		Clock,
		Bookmark,
		BookmarkCheck,
		Check,
		X,
		HelpCircle,
		Trash2,
		ArrowRight
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	// Define the history item type
	type MythHistoryItem = {
		id: string;
		myth: string;
		verdict: 'true' | 'false' | 'inconclusive';
		timestamp: Date;
		isBookmarked: boolean;
	};

	// Local storage service for history
	function useHistoryStore() {
		// Initialize with empty array
		let historyItems: MythHistoryItem[] = [];

		// Load from localStorage on init
		function initialize() {
			if (typeof window === 'undefined') return;

			const stored = localStorage.getItem('myth-history');
			if (stored) {
				try {
					// Parse dates properly
					const parsed = JSON.parse(stored);
					historyItems = parsed.map((item: any) => ({
						...item,
						timestamp: new Date(item.timestamp)
					}));
				} catch (e) {
					console.error('Failed to parse history', e);
				}
			}
		}

		// Add new item to history
		function addToHistory(myth: string, verdict: string) {
			const newItem: MythHistoryItem = {
				id: crypto.randomUUID(),
				myth,
				verdict: verdict as 'true' | 'false' | 'inconclusive',
				timestamp: new Date(),
				isBookmarked: false
			};

			historyItems = [newItem, ...historyItems].slice(0, 100); // Keep last 100 items
			saveToStorage();
		}

		// Toggle bookmark status
		function toggleBookmark(id: string) {
			historyItems = historyItems.map((item) =>
				item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
			);
			saveToStorage();
		}

		// Clear history
		function clearHistory() {
			historyItems = [];
			saveToStorage();
		}

		// Save to localStorage
		function saveToStorage() {
			if (typeof window === 'undefined') return;
			localStorage.setItem('myth-history', JSON.stringify(historyItems));
		}

		// Get bookmarked items
		const bookmarkedItems = historyItems.filter((item) => item.isBookmarked);

		initialize();

		// Use functions to access the reactive state
		return {
			get historyItems() { return historyItems; },
			get bookmarkedItems() { return bookmarkedItems; },
			addToHistory,
			toggleBookmark,
			clearHistory
		};
	}

	// Create the history store
	const historyStore = useHistoryStore();

	// Format date for display
	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(date);
	}

	// Get icon for verdict
	function getVerdictIcon(verdict: string) {
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
	function getVerdictColor(verdict: string): string {
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
		if (confirm('Are you sure you want to clear your history?')) {
			historyStore.clearHistory();
			toast.success('History cleared', {
				description: 'Your myth verification history has been cleared',
				duration: 3000
			});
		}
	}

	// Container ref for animations
	let container: HTMLElement;

	// Animate items with staggered reveal
	function animateItems() {
		if (!container) return;

		const items = container.querySelectorAll('.history-item');
		items.forEach((item, i) => {
			const delay = i * 70; // Staggered delay
			animate(item, { y: [10, 0], opacity: [0, 1] } as any, { delay, duration: 0.3 });
		});
	}

	// Setup animation on mount
	function onMount(node: HTMLElement) {
		container = node;
		setTimeout(animateItems, 200);
	}
</script>

<div class="rounded-lg border border-primary/20 p-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="flex items-center gap-2 text-lg font-medium">
			<Clock class="h-4 w-4" />
			History
		</h3>

		{#if historyStore.historyItems.length > 0}
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

	<div class="space-y-3" use:onMount bind:this={container}>
		{#if historyStore.historyItems.length === 0}
			<div
				class="rounded-md border border-primary/10 bg-muted/30 p-4 text-center text-muted-foreground"
			>
				No history yet. Verify some myths to see them here.
			</div>
		{:else}
			{#each historyStore.historyItems as item}
				<div class="history-item opacity-0">
					<div
						class="flex items-start justify-between rounded-md border border-primary/10 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
					>
						<div class="flex-1">
							<div class="flex items-center gap-2">
								{#if true}
									{@const Icon = getVerdictIcon(item.verdict)}
									<Icon class={`h-4 w-4 ${getVerdictColor(item.verdict)}`} />
								{/if}
								<p class="line-clamp-2 font-medium">{item.myth}</p>
							</div>
							<p class="mt-1 text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
						</div>

						<div class="flex items-center gap-2">
							<Button
								variant="ghost"
								size="sm"
								class="text-muted-foreground hover:text-primary"
								onclick={() => historyStore.toggleBookmark(item.id)}
							>
								{#if item.isBookmarked}
									<BookmarkCheck class="h-4 w-4" />
								{:else}
									<Bookmark class="h-4 w-4" />
								{/if}
							</Button>

							<form method="POST" action="?/verifyMyth">
								<input type="hidden" name="myth" value={item.myth} />
								<Button variant="ghost" size="sm" type="submit">
									<ArrowRight class="h-4 w-4" />
								</Button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
