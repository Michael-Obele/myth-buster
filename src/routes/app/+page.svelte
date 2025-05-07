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
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
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
		Trash2,
		Sparkles
	} from 'lucide-svelte';
	import { cn } from '$lib/utils';

	let myth = $state('');
	let loading = $state(false);
	let mythJustSubmitted = $state(false);
	let clearingCache = $state(false);
	let activeCitation = $state<{ title: string; url: string } | null>(null);

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
			const isCitationValid =
				form?.data?.citations && citationIndex >= 0 && citationIndex < form.data.citations.length;

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

	// explanationSegments is derived from form.data.explanation
	let explanationSegments = $derived(() =>
		form?.data?.explanation ? (parseExplanation(form.data.explanation) as ExplanationSegment[]) : []
	);

	function handleCitationClick(index: number) {
		if (form?.data?.citations && index >= 0 && index < form.data.citations.length) {
			activeCitation = form.data.citations[index];
		}
	}

	function handleCitationKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			const target = event.target as HTMLElement;
			const index = parseInt(target.getAttribute('data-index') || '0');
			handleCitationClick(index);
		}
	}

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
</script>

{#snippet verdictIcon(verdict: string)}
	{@const Icon = verdict === 'true' ? Check : verdict === 'false' ? X : HelpCircle}
	<div
		class="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg{verdict ===
		'true'
			? ' bg-emerald-500'
			: verdict === 'false'
				? ' bg-red-500'
				: ' bg-purple-500'}"
	>
		<Icon class="h-6 w-6" />
	</div>
{/snippet}

<section class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-6">
	<Card.Root
		class="mx-auto max-w-3xl rounded-xl border-2 border-primary/50 bg-background/90 shadow-xl backdrop-blur-sm"
	>
		<Card.Header>
			<div class="flex items-center justify-between">
				<Card.Title class="flex items-center gap-2 font-serif text-3xl">
					<Flame class="h-7 w-7 text-primary" />
					<span class="font-bold text-white"> Myth Buster </span>
					<Badge class="ml-2 bg-primary/20 text-primary">AI Powered</Badge>
				</Card.Title>

				<!-- Clear Cache Button -->
				<form method="POST" action="?/clearCache" use:enhance={handleClearCache}>
					<Button
						type="submit"
						variant="outline"
						size="sm"
						class="border-destructive text-xs text-destructive hover:bg-destructive/70 hover:text-white"
						disabled={clearingCache}
					>
						{#if clearingCache}
							<div class="flex items-center gap-1">
								<div
									class="h-3 w-3 animate-spin rounded-full border-2 border-destructive border-t-transparent"
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
					class="mt-6 flex flex-col gap-4"
					method="POST"
					action="?/verifyMyth"
					use:enhance={handleSubmit}
				>
					<Textarea
						name="myth"
						bind:value={myth}
						placeholder="Enter a myth or claim (e.g., 'Drinking water upside down cures hiccups')"
						class="min-h-32 border-primary/20 text-base focus-visible:ring-primary"
						required
					/>
					<Button
						type="submit"
						class="bg-gradient-to-r from-primary to-purple-600 transition-opacity hover:opacity-90"
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
							<DatabaseZap class="mr-3 size-4" />
							Cached Response
						</Badge>
					</div>
				{/if}

				<!-- Verdict Card -->
				<div class="mt-6">
					<div class="mb-4 flex items-center gap-3">
						{@render verdictIcon(form?.data?.verdict)}
						<h2 class="text-3xl font-bold text-white">
							{verdictText()}
						</h2>
					</div>

					<!-- Explanation -->
					<div
						class="mb-6 rounded-lg border border-primary/30 bg-card p-5 text-card-foreground shadow-md"
					>
						<h3 class="mb-3 text-xl font-medium">Explanation</h3>
						<div
							class="text-lg leading-relaxed text-muted-foreground focus:outline-none"
							role="textbox"
							tabindex="0"
							aria-label="Explanation with clickable citations"
						>
							{#each explanationSegments() as segment (segment.content)}
								{#if segment.type === 'text'}
									{segment.content}
								{:else if segment.type === 'citation' && segment.valid}
									<button
										type="button"
										class="m-0 inline-flex cursor-pointer border-none bg-transparent p-0 font-medium text-primary hover:underline"
										onclick={() => handleCitationClick(segment.index)}
										onkeydown={handleCitationKeyDown}
										data-index={segment.index}
										aria-label={`View citation ${segment.index + 1}`}
									>
										{segment.content}
									</button>
								{:else}
									{segment.content}
								{/if}
							{/each}
						</div>
						<div class="mt-4 flex justify-end">
							<Button
								variant="outline"
								class="gap-2 border-primary/30 text-primary hover:bg-primary/70"
							>
								<span>Premium Insights</span>
								<Sparkles />
							</Button>
						</div>
					</div>

					<!-- Citations -->
					{#if form?.data?.citations && form.data.citations.length > 0}
						<Accordion.Root type="single" class="w-full rounded-lg border border-primary/20">
							<Accordion.Item value="citations" class="border-none">
								<Accordion.Trigger
									class="flex w-full items-center justify-between rounded-t-lg px-4 py-3 text-left font-medium hover:bg-muted/50"
								>
									<div class="flex items-center gap-2">
										<Book class="h-4 w-4 text-primary" />
										Citations
									</div>
								</Accordion.Trigger>
								<Accordion.Content class="px-4 pb-4 pt-1">
									<ul class="space-y-3">
										{#each form.data.citations as citation}
											<li
												class="flex items-start gap-3 rounded-md border border-primary/20 bg-muted/30 p-3 transition-colors hover:bg-muted/50"
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
											</li>
										{/each}
									</ul>
								</Accordion.Content>
							</Accordion.Item>
						</Accordion.Root>
					{/if}

					<!-- Myth Origin -->
					{#if form?.data?.mythOrigin}
						<div
							class="mt-4 rounded-lg border border-primary/20 bg-muted/30 p-4 transition-colors hover:bg-muted/40"
						>
							<h3 class="mb-2 text-lg font-medium">Origin of the Myth</h3>
							<p class="text-muted-foreground">{form.data.mythOrigin}</p>
						</div>
					{/if}

					<!-- Try Another Button -->
					<form method="GET" class="mt-6" use:enhance={handleReset}>
						<Button
							type="submit"
							variant="outline"
							class="w-full border-primary py-6 text-lg text-primary hover:bg-primary/70"
						>
							Verify Another Myth
						</Button>
					</form>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</section>

<!-- Citation Alert Dialog -->
<AlertDialog.Root open={activeCitation !== null}>
	<AlertDialog.Content class="bg-black/70">
		<AlertDialog.Header>
			<AlertDialog.Title>Citation Source</AlertDialog.Title>
			<AlertDialog.Description>
				{#if activeCitation}
					<div class="mb-4">
						<h4 class="font-medium text-white">{activeCitation.title}</h4>
						<p class="mt-1 break-all text-sm text-muted-foreground text-white/65">
							{activeCitation.url}
						</p>
					</div>
				{/if}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (activeCitation = null)}>Close</AlertDialog.Cancel>
			{#if activeCitation}
				<a href={activeCitation.url} target="_blank" rel="noopener noreferrer">
					<AlertDialog.Action>
						<div class="flex items-center gap-1">
							<span>Visit Source</span>
							<ExternalLink class="h-4 w-4" />
						</div>
					</AlertDialog.Action>
				</a>
			{/if}
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
