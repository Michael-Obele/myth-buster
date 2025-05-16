<script lang="ts">
	import { animate } from 'svelte-motion';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import { ExternalLink, Sparkles } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';

	// Props using Svelte 5 syntax
	type Citation = {
		title: string;
		url: string;
	};

	let {
		explanation = '',
		citations = []
	}: {
		explanation: string;
		citations: Citation[];
	} = $props();

	// Citation regex - matches [n] patterns where n is 1-2 digits
	const CITATION_REGEX = /\[(\d{1,2})\](?!\w)/g;

	// Define types for our segments
	type TextSegment = {
		type: 'text';
		content: string;
	};

	type CitationSegment = {
		type: 'citation';
		content: string;
		index: number;
		valid: boolean;
	};

	type ExplanationSegment = TextSegment | CitationSegment;

	// Function to parse explanation into segments
	function parseExplanation(text: string): ExplanationSegment[] {
		if (!text) return [];

		const segments: ExplanationSegment[] = [];
		let lastIndex = 0;
		let match;

		// Reset regex state
		CITATION_REGEX.lastIndex = 0;

		while ((match = CITATION_REGEX.exec(text)) !== null) {
			// Add text before the match
			if (match.index > lastIndex) {
				segments.push({
					type: 'text',
					content: text.substring(lastIndex, match.index)
				});
			}

			// Add the citation reference
			const citationIndex = parseInt(match[1]) - 1;
			const isCitationValid = citations && citationIndex >= 0 && citationIndex < citations.length;

			segments.push({
				type: 'citation',
				content: match[0],
				index: citationIndex,
				valid: isCitationValid
			});

			lastIndex = match.index + match[0].length;
		}

		// Add any remaining text
		if (lastIndex < text.length) {
			segments.push({
				type: 'text',
				content: text.substring(lastIndex)
			});
		}

		return segments;
	}

	// Parse explanation into segments
	let segments = $derived(parseExplanation(explanation));

	// Container ref for debugging
	let container: HTMLElement | null = null;

	// Simple function to log explanation content for debugging
	function logExplanation(): void {
		console.log('Explanation content:', explanation);
		console.log('Parsed segments:', segments);
		console.log('Citations:', citations);
	}

	// Setup debugging on mount
	function onMount(node: HTMLElement): void {
		container = node;
		logExplanation();
	}
</script>

<div class="mb-6 rounded-lg border border-primary/30 bg-card p-5 text-card-foreground shadow-md">
	<h3 class="mb-3 text-xl font-medium">Explanation</h3>

	<div
		class="text-lg leading-relaxed text-muted-foreground focus:outline-none"
		role="textbox"
		tabindex="0"
		aria-label="Explanation with clickable citations"
		use:onMount
	>
		<!-- Debug information -->
		{#if !explanation || explanation.length === 0}
			<p class="text-yellow-500">No explanation data available</p>
		{/if}

		{#each segments as segment, i (i + '-' + segment.content)}
			{#if segment.type === 'text'}
				<span>{segment.content}</span>
			{:else if segment.type === 'citation' && segment.valid}
				<HoverCard.Root>
					<HoverCard.Trigger>
						<span
							class="inline-flex cursor-pointer font-medium text-primary hover:underline"
							aria-label={`View citation ${segment.index + 1}`}
							role="button"
							tabindex="0"
						>
							{segment.content}
						</span>
					</HoverCard.Trigger>
					<HoverCard.Content
						side="top"
						class="w-80 border border-primary/30 bg-black/80 p-4 shadow-lg backdrop-blur-sm"
					>
						{#if citations && segment.index >= 0 && segment.index < citations.length}
							{@const citation = citations[segment.index]}
							<div class="flex flex-col gap-2">
								<h4 class="font-medium text-white">{citation.title}</h4>
								<p class="break-all text-sm text-white/70">{citation.url}</p>
								<a
									href={citation.url}
									target="_blank"
									rel="noopener noreferrer"
									class="mt-2 inline-flex items-center gap-1 self-end text-sm text-primary hover:underline"
								>
									<span>Visit Source</span>
									<ExternalLink class="h-3 w-3" />
								</a>
							</div>
						{/if}
					</HoverCard.Content>
				</HoverCard.Root>
			{:else}
				<span>{segment.content}</span>
			{/if}
		{/each}
	</div>

	<div class="mt-4 flex justify-end">
		<Button
			variant="outline"
			class="gap-2 border-primary/30 text-primary hover:bg-primary/70"
			onclick={() =>
				toast.info('Premium Insights feature is not yet available', {
					description: 'This feature is coming soon in a future update!',
					duration: 4000
				})}
		>
			<span>Premium Insights</span>
			<Sparkles class="h-4 w-4" />
		</Button>
	</div>
</div>
