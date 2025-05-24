<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		AlertCircle,
		CheckCircle2,
		FileText,
		Microscope,
		GitMerge,
		GitPullRequestClosed,
		ExternalLink,
		Loader2,
		Search
	} from 'lucide-svelte';
	import type { SourceAnalysisResult } from '$lib/types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';

	// Props
	let {
		open = $bindable(),
		sourceDetails,
		analysisTypes,
		analyzeSourceEnhancer
	}: {
		open: boolean;
		sourceDetails: { url: string; name: string; mythContext: string } | null;
		analysisTypes: { id: string; name: string }[];
		analyzeSourceEnhancer: SubmitFunction;
	} = $props();

	// Internal state
	let currentAnalysisType: string = $state('');
	let customSourceQuery: string = $state('');

	let internalDisplayState: {
		loading: boolean;
		success?: boolean;
		data?: {
			analysis: string;
			reliability?: string;
			methodology?: string;
			corroborating?: string[];
			contradicting?: string[];
		};
		error?: string;
	} | null = $state(null);

	$effect(() => {
		if (open) {
			currentAnalysisType = '';
			customSourceQuery = '';
			internalDisplayState = null;
		}
	});

	const selectedAnalysisTypeName = $derived(
		analysisTypes.find((t) => t.id === currentAnalysisType)?.name ?? 'Select analysis type'
	);

	const handleInternalSubmit: SubmitFunction = (submitOpts) => {
		internalDisplayState = { loading: true };

		const enhanceResult = analyzeSourceEnhancer(submitOpts);

		return async ({ result, update }) => {
			if (enhanceResult && typeof enhanceResult === 'function') {
				await enhanceResult({ ...submitOpts, result, update });
			} else {
				await update();
			}

			if (internalDisplayState) {
				internalDisplayState.loading = false;
				if (result.type === 'success' && result.data) {
					const actionData = result.data as SourceAnalysisResult;
					internalDisplayState.success = actionData.success;
					internalDisplayState.data = actionData.result;
					internalDisplayState.error = actionData.error;
				} else if (result.type === 'error') {
					internalDisplayState.success = false;
					internalDisplayState.error = result.error?.message || 'Source analysis request failed';
					internalDisplayState.data = undefined;
				} else if (result.type === 'failure' && result.data) {
					internalDisplayState.success = false;
					internalDisplayState.error =
						(result.data as { error: string })?.error || 'Form submission failed.';
					internalDisplayState.data = undefined;
				} else {
					internalDisplayState.success = false;
					internalDisplayState.error = 'Unknown error during source analysis';
					internalDisplayState.data = undefined;
				}
			}
		};
	};

	type Section = {
		title: string;
		content: string | string[];
		icon: any;
		type: 'text' | 'list';
	};

	let sections = $derived(() => {
		if (!internalDisplayState?.data) return [] as Section[];
		const r = internalDisplayState.data;
		const s: Section[] = [];

		if (r.analysis && typeof r.analysis === 'string' && r.analysis.trim() !== '') {
			s.push({ title: 'Detailed Analysis', content: r.analysis, icon: FileText, type: 'text' });
		}
		if (r.reliability && typeof r.reliability === 'string' && r.reliability.trim() !== '') {
			s.push({
				title: 'Reliability Assessment',
				content: r.reliability,
				icon: CheckCircle2,
				type: 'text'
			});
		}
		if (r.methodology && typeof r.methodology === 'string' && r.methodology.trim() !== '') {
			s.push({
				title: 'Methodology Evaluation',
				content: r.methodology,
				icon: Microscope,
				type: 'text'
			});
		}
		if (r.corroborating && Array.isArray(r.corroborating) && r.corroborating.length > 0) {
			s.push({
				title: 'Supporting Evidence',
				content: r.corroborating.filter(
					(item: unknown): item is string => typeof item === 'string'
				),
				icon: GitMerge,
				type: 'list'
			});
		}
		if (r.contradicting && Array.isArray(r.contradicting) && r.contradicting.length > 0) {
			s.push({
				title: 'Contradicting Evidence',
				content: r.contradicting.filter(
					(item: unknown): item is string => typeof item === 'string'
				),
				icon: GitPullRequestClosed,
				type: 'list'
			});
		}
		return s;
	});

	function isValidUrl(string: string): boolean {
		try {
			const url = new URL(string);
			return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'ftp:';
		} catch (_) {
			return false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="w-[90vw] max-w-2xl p-0">
		<Dialog.Header class="border-b px-6 py-4">
			<Dialog.Title class="flex items-center gap-2 text-xl">
				<Search class="h-5 w-5 text-primary" />
				Analyze Source
			</Dialog.Title>
			{#if sourceDetails}
				<Dialog.Description class="pt-1 text-sm text-muted-foreground">
					For:
					<span class="break-all font-medium text-foreground">
						{sourceDetails.name || sourceDetails.url}
					</span>
				</Dialog.Description>
			{/if}
		</Dialog.Header>

		<ScrollArea class="max-h-[calc(80vh_-_100px)] md:max-h-[calc(70vh_-_100px)]">
			<div class="grid gap-6 px-6 py-4">
				<form method="POST" action="?/analyzeSource" use:enhance={handleInternalSubmit}>
					<input type="hidden" name="sourceUrl" value={sourceDetails?.url || ''} />
					<input type="hidden" name="sourceName" value={sourceDetails?.name || ''} />
					<input type="hidden" name="mythContext" value={sourceDetails?.mythContext || ''} />

					<div class="grid gap-4">
						<div class="grid gap-2">
							<Label for="analysisType-dialog" class="text-base">Analysis Type</Label>
							<Select.Root
								type="single"
								name="analysisType-dialog"
								bind:value={currentAnalysisType}
							>
								<Select.Trigger id="analysisType-dialog" class="w-full">
									{selectedAnalysisTypeName}
								</Select.Trigger>
								<Select.Content>
									{#each analysisTypes as type (type.id)}
										<Select.Item value={type.id}>{type.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="analysisType" value={currentAnalysisType} />
						</div>

						{#if currentAnalysisType === 'custom'}
							<div class="grid gap-2">
								<Label for="customQuery-dialog" class="text-base">Custom Question</Label>
								<Textarea
									id="customQuery-dialog"
									name="customQuery"
									bind:value={customSourceQuery}
									placeholder="e.g., What is the main argument of this source regarding X?"
									class="min-h-[80px]"
								/>
							</div>
						{/if}

						<Button
							type="submit"
							class="w-full"
							disabled={internalDisplayState?.loading ||
								!currentAnalysisType ||
								(currentAnalysisType === 'custom' && !customSourceQuery.trim()) ||
								!sourceDetails?.url}
						>
							{#if internalDisplayState?.loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Analyzing...
							{:else}
								<Search class="mr-2 h-4 w-4" />
								Analyze Source
							{/if}
						</Button>
					</div>
				</form>

				{#if internalDisplayState}
					<div class="mt-2 rounded-lg border bg-card p-0.5 shadow-sm">
						{#if internalDisplayState.loading && !internalDisplayState.data && !internalDisplayState.error}
							<div class="flex flex-col items-center justify-center p-6 text-muted-foreground">
								<Loader2 class="h-8 w-8 animate-spin text-primary" />
								<p class="mt-2">Fetching analysis...</p>
							</div>
						{:else if internalDisplayState.error}
							<Alert.Root variant="destructive" class="m-2">
								<AlertCircle class="h-4 w-4" />
								<Alert.Title>Analysis Error</Alert.Title>
								<Alert.Description>{internalDisplayState.error}</Alert.Description>
							</Alert.Root>
						{:else if internalDisplayState.data && sections().length > 0}
							<Accordion.Root type="multiple" class="w-full" value={sections().map((s) => s.title)}>
								{#each sections() as section (section.title)}
									{@const IconComponent = section.icon}
									<Accordion.Item value={section.title} class="border-b-0 last:border-b-0">
										<Accordion.Trigger
											class="px-4 py-3 text-base font-medium hover:bg-muted/30 [&[data-state=open]]:bg-muted/20"
										>
											<div class="flex items-center">
												<IconComponent class="mr-3 h-5 w-5 text-primary" />
												{section.title}
											</div>
										</Accordion.Trigger>
										<Accordion.Content
											class="prose prose-sm dark:prose-invert max-w-none px-4 pb-4 pt-1 text-muted-foreground"
										>
											{#if section.type === 'text'}
												<p class="whitespace-pre-wrap leading-relaxed">
													{typeof section.content === 'string' ? section.content : ''}
												</p>
											{:else if section.type === 'list' && Array.isArray(section.content)}
												<ul class="list-disc space-y-1.5 pl-5">
													{#each section.content as item (item)}
														<li>
															{#if typeof item === 'string' && isValidUrl(item)}
																<a
																	href={item}
																	target="_blank"
																	rel="noopener noreferrer"
																	class="inline-flex items-center text-primary hover:underline"
																>
																	{item}
																	<ExternalLink class="ml-1.5 h-3.5 w-3.5 shrink-0" />
																</a>
															{:else if typeof item === 'string'}
																{item}
															{/if}
														</li>
													{/each}
												</ul>
											{/if}
										</Accordion.Content>
									</Accordion.Item>
									{#if sections().find((s) => s.title === section.title) !== sections()[sections().length - 1]}
										<Separator />
									{/if}
								{/each}
							</Accordion.Root>
						{:else if !internalDisplayState.loading}
							<div class="p-6 text-center text-muted-foreground">
								<FileText class="mx-auto mb-2 h-10 w-10 text-border" />
								No analysis data returned or the format was unexpected.
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</ScrollArea>

		<Dialog.Footer class="border-t px-6 py-3">
			<Button variant="outline" onclick={() => (open = false)}>Close</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
