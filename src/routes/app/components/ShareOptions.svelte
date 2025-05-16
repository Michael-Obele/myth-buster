<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { Share2, Copy as CopyIcon, Twitter, Facebook, Download } from 'lucide-svelte';

	// Props using Svelte 5 syntax
	let {
		verdict = '',
		myth = '',
		explanation = ''
	}: {
		verdict: string;
		myth: string;
		explanation: string;
	} = $props();

	// Reactive state
	let showShareOptions: boolean = $state(false);

	// Generate share URL based on the myth
	let shareUrl = $derived.by(() => {
		if (typeof window !== 'undefined') {
			return `${window.location.origin}/share/${btoa(encodeURIComponent(myth))}`;
		}
		return '';
	});

	// Copy share URL to clipboard
	async function copyToClipboard() {
		if (typeof navigator !== 'undefined') {
			await navigator.clipboard.writeText(shareUrl);
			toast('Link copied!', {
				description: 'Share link copied to clipboard',
				duration: 3000
			});
		}
	}

	// Share to social media platforms
	async function shareToSocial(platform: string) {
		if (typeof window === 'undefined') return;

		const text = `I just verified this myth: "${myth}" - The result is ${verdict}!`;
		let url = '';

		switch (platform) {
			case 'twitter':
				url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
				break;
			case 'bluesky':
				// Bluesky uses a different approach for sharing
				url = `https://bsky.app/intent/compose?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
				break;
			case 'facebook':
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
				break;
		}

		if (url) {
			window.open(url, '_blank');
		}
	}

	// Generate and download share image
	function generateImage() {
		// This would be implemented with HTML-to-Canvas or similar library
		// For now, we'll just show a toast message
		toast('Image Download', {
			description: 'This feature is coming soon!',
			duration: 3000
		});
	}

	// Event handler functions for Svelte 5
	function toggleShareOptions() {
		showShareOptions = !showShareOptions;
	}
</script>

<div>
	<Button variant="outline" class="gap-2" onclick={toggleShareOptions}>
		<Share2 class="h-4 w-4" />
		<span>Share Result</span>
	</Button>

	{#if showShareOptions}
		<div class="mt-2 rounded-md border bg-card p-3">
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-2">
					<input type="text" value={shareUrl} readonly class="flex-1 rounded border p-2 text-sm" />
					<Button size="sm" variant="ghost" onclick={copyToClipboard}>
						<CopyIcon class="h-4 w-4" />
					</Button>
				</div>
				<div class="mt-2 flex flex-wrap gap-2">
					<Button
						size="sm"
						variant="outline"
						class="gap-2"
						onclick={() => shareToSocial('twitter')}
					>
						<Twitter class="h-4 w-4" />
						Twitter
					</Button>
					<Button
						size="sm"
						variant="outline"
						class="gap-2"
						onclick={() => shareToSocial('bluesky')}
					>
						<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
							<path d="M12 22v-5" />
							<path d="M12 17L3 12" />
							<path d="M12 17l9-5" />
						</svg>
						Bluesky
					</Button>
					<Button
						size="sm"
						variant="outline"
						class="gap-2"
						onclick={() => shareToSocial('facebook')}
					>
						<Facebook class="h-4 w-4" />
						Facebook
					</Button>
					<Button size="sm" variant="outline" class="gap-2" onclick={generateImage}>
						<Download class="h-4 w-4" />
						Download Image
					</Button>
				</div>
			</div>
		</div>
	{/if}
</div>
