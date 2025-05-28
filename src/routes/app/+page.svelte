<script lang="ts">
	// Import UI components
	import * as Tabs from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { SubmitFunction, ActionResult } from '@sveltejs/kit';
	import { DatabaseZap } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import RouteHead from '$lib/components/layout/RouteHead.svelte';
	import { PersistedState } from 'runed';
	import type {
		MythHistoryEntry,
		MythVerificationResult,
		LensResult,
		SourceAnalysisResult,
		SynthesisResult
	} from '$lib/types';
	import { enhance } from '$app/forms';
	import { fade } from 'svelte/transition';

	// Import our components
	import MythInput from './components/MythInput.svelte';
	import VerdictDisplay from './components/VerdictDisplay.svelte';
	import ExplanationDisplay from './components/ExplanationDisplay.svelte';
	import CitationList from './components/CitationList.svelte';
	import RelatedMyths from './components/RelatedMyths.svelte';
	import ShareOptions from './components/ShareOptions.svelte';
	import HistoryTimeline from './components/HistoryTimeline.svelte';
	import AuroraText from '$lib/components/blocks/AuroraText.svelte';
	import DeepResearchSection from './components/DeepResearchSection.svelte';
	import SourceAnalysisDisplay from './components/SourceAnalysisDisplay.svelte';

	let activeTab: string = $state('history');
	let loading: boolean = $state(false);
	let displayData: MythVerificationResult | null = $state(null);

	let activeResearchLenses: LensResult[] = $state([]);
	let activeLensId: string = $state('historical');
	let customLensInput: string = $state('');
	let showCustomLensInput: boolean = $state(false);

	let showSourceAnalysisDialog: boolean = $state(false);
	let selectedSourceForAnalysis: { url: string; name: string; mythContext: string } | null =
		$state(null);

	let synthesisResult: SynthesisResult | null = $state(null);

	const predefinedLenses = [
		{ id: 'historical', name: 'Historical', description: 'Examine origins and historical context' },
		{ id: 'scientific', name: 'Scientific', description: 'Analyze from scientific evidence' },
		{ id: 'cultural', name: 'Cultural', description: 'Explore cultural and social perspectives' },
		{
			id: 'psychological',
			name: 'Psychological',
			description: 'Investigate cognitive and psychological factors'
		},
		{ id: 'economic', name: 'Economic', description: 'Examine economic interests and factors' },
		{ id: 'political', name: 'Political', description: 'Analyze political and power dynamics' }
	];

	const allLenses = $derived.by(() => {
		const custom = activeResearchLenses.filter((lens) => lens.isCustom);
		return [
			...predefinedLenses.map((lens) => ({
				...lens,
				isCustom: false,
				...activeResearchLenses.find((active) => active.id === lens.id)
			})),
			...custom
		];
	});

	const canSynthesize = $derived(
		activeResearchLenses.filter((lens) => lens.result && !lens.error).length >= 2
	);

	function addCustomLens() {
		if (!customLensInput.trim()) return;
		const customLens: LensResult = {
			id: `custom_${Date.now()}`,
			name: customLensInput.trim(),
			isCustom: true
		};
		activeResearchLenses = [...activeResearchLenses, customLens];
		activeLensId = customLens.id;
		customLensInput = '';
		showCustomLensInput = false;
	}

	function openSourceAnalysis(source: { url: string; name: string; mythContext: string }) {
		selectedSourceForAnalysis = source;
		showSourceAnalysisDialog = true;
	}

	interface ResearchLensActionResult {
		success: boolean;
		lensId?: string;
		result?: {
			explanation: string;
			keyInsights: string[];
			citations: { title: string; url: string }[];
		};
		error?: string;
	}

	const analyzeLens: SubmitFunction = ({ formData }) => {
		const lensId = formData.get('lensType') as string;
		const lensName = formData.get('lensName') as string;

		let existingLens = activeResearchLenses.find((lens) => lens.id === lensId);
		if (!existingLens) {
			const isCustom = lensId.startsWith('custom_');
			existingLens = {
				id: lensId,
				name: lensName,
				isCustom,
				loading: true
			};
			activeResearchLenses = [...activeResearchLenses, existingLens];
		} else {
			existingLens.loading = true;
			existingLens.error = undefined;
			existingLens.result = undefined;
		}

		return async ({ result, update }) => {
			await update();
			const lens = activeResearchLenses.find((l) => l.id === lensId);
			if (lens) {
				lens.loading = false;
				if (result.type === 'success' && result.data) {
					const actionResult = result.data as ResearchLensActionResult;
					if (actionResult.success && actionResult.result) {
						lens.result = actionResult.result;
						lens.error = undefined;
					} else {
						lens.error = actionResult.error || 'Analysis failed';
						lens.result = undefined;
					}
				} else if (result.type === 'error') {
					lens.error = result.error?.message || 'Analysis request failed';
					lens.result = undefined;
				} else if (result.type === 'failure') {
					lens.error =
						(result.data as { error: string })?.error ||
						'Form submission failed for lens analysis.';
					lens.result = undefined;
				} else {
					lens.error = 'Unknown error during analysis';
					lens.result = undefined;
				}
				activeResearchLenses = [...activeResearchLenses];
			}
		};
	};

	const analyzeSourceActionEnhancer: SubmitFunction<
		SourceAnalysisResult,
		SourceAnalysisResult
	> = () => {
		return async ({ result, update }) => {
			await update();
			if (result.type === 'success' && result.data) {
				const actionOutcome = result.data;
				if (!actionOutcome.success) {
					console.error(
						'[+page.svelte] Source analysis action reported an error:',
						actionOutcome.error
					);
				} else {
					console.log('[+page.svelte] Source analysis successful (details in dialog).');
				}
			} else if (result.type === 'error') {
				console.error(
					'[+page.svelte] Source analysis action request failed:',
					result.error?.message
				);
			} else if (result.type === 'failure' && result.data) {
				console.error(
					'[+page.svelte] Source analysis form submission failed:',
					(result.data as { error: string })?.error
				);
			}
		};
	};

	interface SynthesizeInsightsActionResult {
		success: boolean;
		result?: {
			overallInsight: string;
			themes: { title: string; description: string }[];
			connections: string[];
			contradictions: string[];
		};
		error?: string;
	}

	const synthesizeInsights: SubmitFunction = () => {
		if (!synthesisResult) {
			synthesisResult = { loading: true, success: false };
		} else {
			synthesisResult.loading = true;
			synthesisResult.success = false;
			synthesisResult.error = undefined;
		}

		return async ({ result, update }) => {
			await update();

			if (synthesisResult) {
				synthesisResult.loading = false;
				if (result.type === 'success' && result.data) {
					const actionResult = result.data as SynthesizeInsightsActionResult;
					if (actionResult.success && actionResult.result) {
						synthesisResult.success = true;
						synthesisResult.overallInsight = actionResult.result.overallInsight;
						synthesisResult.themes = actionResult.result.themes;
						synthesisResult.connections = actionResult.result.connections;
						synthesisResult.contradictions = actionResult.result.contradictions;
						synthesisResult.error = undefined;
					} else {
						synthesisResult.success = false;
						synthesisResult.error = actionResult.error || 'Synthesis failed';
					}
				} else if (result.type === 'error') {
					synthesisResult.success = false;
					synthesisResult.error = result.error?.message || 'Synthesis request failed';
				} else if (result.type === 'failure' && result.data) {
					synthesisResult.success = false;
					synthesisResult.error =
						(result.data as { error: string })?.error || 'Form submission failed for synthesis.';
				} else {
					synthesisResult.success = false;
					synthesisResult.error = 'Unknown error during synthesis';
				}
			}
		};
	};

	const analysisTypesForDialog = [
		{ id: 'reliability', name: 'Source Reliability' },
		{ id: 'methodology', name: 'Research Methodology' },
		{ id: 'contradictions', name: 'Find Contradictions' },
		{ id: 'corroboration', name: 'Find Supporting Evidence' },
		{ id: 'custom', name: 'Custom Analysis' }
	];

	let { form: pageFormProp }: PageProps = $props();

	const mythHistory = new PersistedState<MythHistoryEntry[]>('myth-history', []);
	const MAX_HISTORY_ITEMS = 100;

	function addResultToHistory(resultToAdd: MythVerificationResult) {
		if (
			resultToAdd &&
			resultToAdd.success === true &&
			typeof resultToAdd.myth === 'string' &&
			resultToAdd.data
		) {
			const newEntry: MythHistoryEntry = {
				id: crypto.randomUUID(),
				myth: resultToAdd.myth!,
				timestamp: Date.now(),
				result: resultToAdd,
				isBookmarked: false
			};

			let currentHistory = mythHistory.current || [];
			if (currentHistory.length > 0) {
				const latestEntry = currentHistory[0];
				if (
					latestEntry.myth === newEntry.myth &&
					latestEntry.result.data?.explanation === newEntry.result.data?.explanation &&
					latestEntry.result.data?.verdict === newEntry.result.data?.verdict &&
					latestEntry.result.cached === newEntry.result.cached
				) {
					return;
				}
			}
			const updatedHistory = [newEntry, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
			mythHistory.current = updatedHistory;
		}
	}

	const handleSubmit: SubmitFunction = ({ formData }) => {
		const mythFromInput = formData.get('myth') as string;
		if (displayData && displayData.myth !== mythFromInput) {
			displayData = null;
			activeResearchLenses = [];
			synthesisResult = null;
		}
		loading = true;
		return async ({ update, result }) => {
			loading = false;
			await update();
			if (result.type === 'success' && result.data) {
				const verificationResult = result.data as MythVerificationResult;
				if (
					verificationResult.success === true &&
					verificationResult.myth &&
					verificationResult.data
				) {
					addResultToHistory(verificationResult);
				} else if (verificationResult.success === false) {
					displayData = verificationResult;
				}
			} else if (result.type === 'error') {
				if (mythFromInput) {
					displayData = {
						success: false,
						myth: mythFromInput,
						error: result.error?.message || 'Submission failed',
						data: undefined,
						cached: false
					};
				}
			} else if (result.type === 'failure' && result.data && mythFromInput) {
				displayData = {
					success: false,
					myth: mythFromInput,
					error:
						(result.data as { error: string })?.error ||
						'Form submission failed. Please check your input.',
					data: undefined,
					cached: false
				};
			}
		};
	};

	$effect(() => {
		if (pageFormProp && typeof pageFormProp.success === 'boolean') {
			const potentialMVRData = pageFormProp.data as Partial<MythVerificationResult['data']>;

			if (pageFormProp.myth && potentialMVRData && typeof potentialMVRData.verdict === 'string') {
				const newMVR = pageFormProp as MythVerificationResult;
				if (
					displayData?.myth !== newMVR.myth ||
					(displayData?.data &&
						newMVR.data &&
						displayData.data.explanation !== newMVR.data.explanation) ||
					displayData?.success !== newMVR.success ||
					(displayData === null && newMVR.success === true)
				) {
					displayData = newMVR;
				}
			} else if (pageFormProp.myth && pageFormProp.success === false && pageFormProp.error) {
				if ((displayData && pageFormProp.myth === displayData.myth) || !displayData) {
					displayData = {
						success: false,
						myth: pageFormProp.myth,
						error: pageFormProp.error,
						data:
							displayData?.myth === pageFormProp.myth && displayData.data
								? displayData.data
								: undefined,
						cached:
							'cached' in pageFormProp && typeof pageFormProp.cached === 'boolean'
								? pageFormProp.cached
								: false
					};
				}
			} else if ((pageFormProp as any).reset === true && pageFormProp.success === true) {
				resetUIVisibility();
			}
		}
	});

	const handleResetSubmit: SubmitFunction = () => {
		resetUIVisibility();
		return async ({ update }) => {
			await update({ reset: true });
		};
	};

	function resetUIVisibility() {
		displayData = null;
		activeResearchLenses = [];
		customLensInput = '';
		showCustomLensInput = false;
		showSourceAnalysisDialog = false;
		selectedSourceForAnalysis = null;
		synthesisResult = null;
	}
</script>

<RouteHead
	title="Myth Buster Game - Test Your Knowledge"
	description="Test your knowledge and bust myths in our interactive game. See if you can distinguish fact from fiction."
	keywords={['myth buster game', 'trivia', 'fact or fiction', 'knowledge test', 'ai game']}
/>

<div class="from-background to-background/50 min-h-screen bg-linear-to-br">
	<main class="relative mx-auto min-h-screen w-full">
		<h3 class="p-6 text-center text-2xl font-bold md:text-5xl">
			Verify <AuroraText>Myths</AuroraText>
		</h3>
		<section class="mx-auto max-w-3xl p-4">
			<div class="flex flex-col lg:justify-center lg:gap-8 xl:gap-12">
				<div class="flex w-full flex-col items-center space-y-6">
					{#if !displayData?.data?.verdict || displayData?.success === false}
						<div class="flex w-full justify-center py-8 sm:py-12 md:py-16">
							<MythInput {loading} {handleSubmit} />
						</div>
					{:else if displayData && displayData.data}
						<div class="flex flex-col space-y-2" transition:fade={{ duration: 500 }}>
							{#if displayData.cached}
								<div class="flex w-full items-center justify-end">
									<Badge variant="outline" class="text-muted-foreground text-xs">
										<DatabaseZap class="mr-2 h-3 w-3" />
										Cached Response
									</Badge>
								</div>
							{/if}

							<VerdictDisplay
								explanation={displayData.data.explanation}
								verdict={displayData.data.verdict}
								myth={displayData.myth}
							/>

							<ExplanationDisplay
								explanation={displayData.data.explanation}
								citations={displayData.data.citations}
							/>

							{#if displayData.data.mythOrigin}
								<div class="border-primary/20 bg-muted/30 w-full rounded-lg border p-4">
									<h3 class="mb-2 text-lg font-medium">Origin of the Myth</h3>
									<p class="text-muted-foreground">{displayData.data.mythOrigin}</p>
								</div>
							{/if}

							{#if displayData.data.whyBelieved}
								<div class="border-primary/20 bg-muted/30 w-full rounded-lg border p-4">
									<h3 class="mb-2 text-lg font-medium">Why People Believe This Myth</h3>
									<p class="text-muted-foreground">{displayData.data.whyBelieved}</p>
								</div>
							{/if}

							{#if displayData.myth && displayData.data.verdict}
								<div class="w-full">
									<ShareOptions myth={displayData.myth} verdict={displayData.data.verdict} />
								</div>
							{/if}

							{#if displayData?.success && displayData?.data}
								<form
									method="POST"
									action="?/resetPage"
									use:enhance={handleResetSubmit}
									class="w-full"
								>
									<Button
										type="submit"
										variant="outline"
										class="border-primary text-primary hover:bg-primary/70 hover:text-primary-foreground w-full py-6 text-lg"
									>
										Verify Another Myth
									</Button>
								</form>
							{/if}

							{#if displayData?.success && displayData?.data}
								<DeepResearchSection
									mythStatement={displayData?.myth}
									initialCitations={displayData?.data?.citations}
									bind:activeLensId
									predefinedLenses={predefinedLenses.map((lens) => ({ ...lens, isCustom: false }))}
									activeResearchLensesProp={activeResearchLenses}
									{allLenses}
									bind:customLensInput
									bind:showCustomLensInput
									addCustomLensFunction={addCustomLens}
									openSourceAnalysisFunction={openSourceAnalysis}
									analyzeLensEnhancer={analyzeLens}
									canSynthesizeSignal={canSynthesize}
									synthesisResultSignal={synthesisResult}
									synthesizeInsightsEnhancer={synthesizeInsights}
								/>
							{/if}
						</div>
					{/if}
				</div>

				<div class="mt-6 w-full">
					<div class="block">
						<Tabs.Root value={activeTab} onValueChange={(v) => (activeTab = v)}>
							<Tabs.List class="grid grid-cols-3">
								<Tabs.Trigger
									value="citations"
									class="flex items-center gap-1"
									disabled={!displayData?.data?.citations ||
										displayData.data.citations.length === 0}
								>
									Citations
								</Tabs.Trigger>
								<Tabs.Trigger
									value="related"
									class="flex items-center gap-1"
									disabled={!displayData?.data?.relatedMyth}
								>
									Related
								</Tabs.Trigger>
								<Tabs.Trigger value="history" class="flex items-center gap-1">History</Tabs.Trigger>
							</Tabs.List>
							<div class="mt-4">
								{#if activeTab === 'citations'}
									{#if displayData?.data?.citations && displayData.data.citations.length > 0}
										<CitationList citations={displayData.data.citations} />
									{:else}
										<div
											class="text-muted-foreground flex h-40 items-center justify-center rounded-md border border-dashed"
										>
											No citations available for this myth yet.
										</div>
									{/if}
								{:else if activeTab === 'related'}
									{#if displayData?.data?.relatedMyth}
										<RelatedMyths relatedMyth={displayData.data.relatedMyth} />
									{:else}
										<div
											class="text-muted-foreground flex h-40 items-center justify-center rounded-md border border-dashed"
										>
											No related myths found or analyzed yet.
										</div>
									{/if}
								{:else if activeTab === 'history'}
									<HistoryTimeline {mythHistory} />
								{/if}
							</div>
						</Tabs.Root>
					</div>
				</div>
			</div>
		</section>
	</main>

	<SourceAnalysisDisplay
		bind:open={showSourceAnalysisDialog}
		sourceDetails={selectedSourceForAnalysis}
		analysisTypes={analysisTypesForDialog}
		analyzeSourceEnhancer={analyzeSourceActionEnhancer}
	/>
</div>
