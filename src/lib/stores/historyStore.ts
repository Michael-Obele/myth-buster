// myth-buster/src/lib/stores/historyStore.ts
import { browser } from '$app/environment';

export type MythHistoryItem = {
	id: string;
	myth: string;
	verdict: 'true' | 'false' | 'inconclusive';
	timestamp: Date;
	isBookmarked: boolean;
};

const HISTORY_STORAGE_KEY = 'myth-history';
const MAX_HISTORY_ITEMS = 100;

// Reactive state for history items
let historyItemsState: MythHistoryItem[] = $state(loadHistoryFromStorage());

function loadHistoryFromStorage(): MythHistoryItem[] {
	if (!browser) {
		return [];
	}
	const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
	if (stored) {
		try {
			const parsed = JSON.parse(stored) as any[];
			return parsed
				.map((item) => ({
					...item,
					timestamp: new Date(item.timestamp) // Ensure timestamp is a Date object
				}))
				.slice(0, MAX_HISTORY_ITEMS);
		} catch (e) {
			console.error('Failed to parse history from localStorage', e);
			localStorage.removeItem(HISTORY_STORAGE_KEY); // Clear corrupted data
			return [];
		}
	}
	return [];
}

function saveHistoryToStorage(): void {
	if (!browser) {
		return;
	}
	try {
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyItemsState));
	} catch (e) {
		console.error('Failed to save history to localStorage', e);
	}
}

export const historyStore = {
	get items(): Readonly<MythHistoryItem[]> {
		return historyItemsState;
	},
	get bookmarkedItems(): Readonly<MythHistoryItem[]> {
		return historyItemsState.filter((item) => item.isBookmarked);
	},
	add: (myth: string, verdict: 'true' | 'false' | 'inconclusive') => {
		const newItem: MythHistoryItem = {
			id: crypto.randomUUID(),
			myth,
			verdict,
			timestamp: new Date(),
			isBookmarked: false
		};
		// Add to the beginning and maintain max length
		historyItemsState = [newItem, ...historyItemsState].slice(0, MAX_HISTORY_ITEMS);
		saveHistoryToStorage();
	},
	toggleBookmark: (id: string) => {
		const itemIndex = historyItemsState.findIndex((item) => item.id === id);
		if (itemIndex > -1) {
			historyItemsState[itemIndex] = {
				...historyItemsState[itemIndex],
				isBookmarked: !historyItemsState[itemIndex].isBookmarked
			};
			// Ensure the array reference changes to trigger reactivity if needed elsewhere directly
			historyItemsState = [...historyItemsState];
			saveHistoryToStorage();
		}
	},
	clear: () => {
		historyItemsState = [];
		saveHistoryToStorage();
	},
	// Function to re-sync state from storage if needed, e.g., after tab focus
	sync: () => {
		if (browser) {
			const freshItems = loadHistoryFromStorage();
			if (JSON.stringify(freshItems) !== JSON.stringify(historyItemsState)) {
				historyItemsState = freshItems;
			}
		}
	}
};

// Optional: Listen to storage events to sync across tabs
if (browser) {
	window.addEventListener('storage', (event) => {
		if (event.key === HISTORY_STORAGE_KEY) {
			historyStore.sync();
		}
	});
}
