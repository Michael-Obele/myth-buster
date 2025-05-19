<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { Share2, Copy as CopyIcon, Twitter, Facebook, Download } from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	// Props using Svelte 5 syntax
	let {
		verdict = '',
		myth = '',
		explanation = ''
	}: {
		verdict: string;
		myth: string | undefined;
		explanation: string;
	} = $props();

	// Generate share URL based on the myth
	let shareUrl = $derived.by(() => {
		if (typeof window !== 'undefined') {
			const encodedMyth = encodeURIComponent(myth);
			return `${window.location.origin}/share?myth=${encodedMyth}`;
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
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="outline" class="gap-2">
			<Share2 class="h-4 w-4" />
			<span>Share Result</span>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56">
		<DropdownMenu.Item onclick={copyToClipboard}>
			<CopyIcon class="mr-2 h-4 w-4" />
			<span>Copy Link</span>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item onclick={() => shareToSocial('twitter')}>
			<Twitter class="mr-2 h-4 w-4" />
			<span>Twitter</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => shareToSocial('bluesky')}>
			<svg
				class="mr-2 h-4 w-4"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
				<path d="M12 22v-5" />
				<path d="M12 17L3 12" />
				<path d="M12 17l9-5" />
			</svg>
			<span>Bluesky</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={() => shareToSocial('facebook')}>
			<Facebook class="mr-2 h-4 w-4" />
			<span>Facebook</span>
		</DropdownMenu.Item>
		<DropdownMenu.Item onclick={generateImage}>
			<Download class="mr-2 h-4 w-4" />
			<span>Download Image</span>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
