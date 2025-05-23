<script lang="ts">
	// Import UI components
	import * as Tabs from '$lib/components/ui/tabs';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { DatabaseZap } from 'lucide-svelte';
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

	// Reactive state using Svelte 5 syntax
	let activeTab: string = $state('history');
	let loading: boolean = $state(false);

	// Stores the primary myth verification data
	let displayData: MythVerificationResult | null = $state(null);

	// Deep research state
	let activeResearchLenses: LensResult[] = $state([]);
	let activeLensId: string = $state('historical');
	let customLensInput: string = $state('');
	let showCustomLensInput: boolean = $state(false);
	let showSourceAnalysisDialog: boolean = $state(false);
	let selectedSource: { url: string; name: string; mythContext: string } | null = $state(null);
	let currentAnalysisType: string = $state('');
	let customSourceQuery: string = $state('');
	let sourceAnalysisResult: SourceAnalysisResult | null = $state(null);
	let synthesisResult: SynthesisResult | null = $state(null);

	// Predefined research lenses
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

	// Derived values
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

	// Functions
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
		selectedSource = source;
		currentAnalysisType = '';
		customSourceQuery = '';
		sourceAnalysisResult = null;
		showSourceAnalysisDialog = true;
	}

	// For researchLens action
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

		// Find existing lens or create new one
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
				} else {
					lens.error = 'Unknown error during analysis';
					lens.result = undefined;
				}
				// Trigger reactivity for the specific lens object if its properties were mutated directly
				// Or ensure activeResearchLenses itself is reassigned if items are replaced for Svelte 5 $state array patterns
				activeResearchLenses = [...activeResearchLenses]; // This ensures the array reference changes if items were mutated deeply
			}
		};
	};

	// For analyzeSource action
	interface AnalyzeSourceActionResult {
		success: boolean;
		result?: {
			analysis: string; // Made non-optional as SourceAnalysisResult expects it
			reliability?: string;
			methodology?: string;
			corroborating?: string[];
			contradicting?: string[];
			bias?: string;
			customAnalysis?: string;
		};
		error?: string;
	}

	const analyzeSource: SubmitFunction = () => {
		if (sourceAnalysisResult) {
			sourceAnalysisResult.loading = true;
			sourceAnalysisResult.error = undefined;
			sourceAnalysisResult.result = undefined;
		} else {
			sourceAnalysisResult = { loading: true };
		}

		return async ({ result, update }) => {
			await update();

			if (sourceAnalysisResult) {
				sourceAnalysisResult.loading = false;
				if (result.type === 'success' && result.data) {
					const actionResult = result.data as AnalyzeSourceActionResult;
					if (actionResult.success && actionResult.result) {
						sourceAnalysisResult.result = actionResult.result;
						sourceAnalysisResult.error = undefined;
					} else {
						sourceAnalysisResult.error = actionResult.error || 'Source analysis failed';
						sourceAnalysisResult.result = undefined;
					}
				} else if (result.type === 'error') {
					sourceAnalysisResult.error = result.error?.message || 'Source analysis request failed';
					sourceAnalysisResult.result = undefined;
				} else {
					sourceAnalysisResult.error = 'Unknown error during source analysis';
					sourceAnalysisResult.result = undefined;
				}
			}
		};
	};

	// For synthesizeInsights action
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
		if (synthesisResult) {
			synthesisResult.loading = true;
			synthesisResult.error = undefined;
		} else {
			synthesisResult = { loading: true };
		}

		return async ({ result, update }) => {
			await update();

			if (synthesisResult) {
				synthesisResult.loading = false;
				if (result.type === 'success' && result.data) {
					const actionResult = result.data as SynthesizeInsightsActionResult;
					if (actionResult.success && actionResult.result) {
						synthesisResult.overallInsight = actionResult.result.overallInsight;
						synthesisResult.themes = actionResult.result.themes;
						synthesisResult.connections = actionResult.result.connections;
						synthesisResult.contradictions = actionResult.result.contradictions;
						synthesisResult.error = undefined;
					} else {
						synthesisResult.error = actionResult.error || 'Synthesis failed';
					}
				} else if (result.type === 'error') {
					synthesisResult.error = result.error?.message || 'Synthesis request failed';
				} else {
					synthesisResult.error = 'Unknown error during synthesis';
				}
			}
		};
	};

	// Analysis types for source analysis
	const analysisTypes = [
		{ id: 'reliability', name: 'Source Reliability' },
		{ id: 'methodology', name: 'Research Methodology' },
		{ id: 'contradictions', name: 'Find Contradictions' },
		{ id: 'corroboration', name: 'Find Supporting Evidence' },
		{ id: 'custom', name: 'Custom Analysis' }
	];

	// We'll use CSS media queries instead of JavaScript for responsive design

	// Get props using Svelte 5 syntax
	let { form: pageFormProp }: PageProps = $props(); // Renamed to avoid conflict, this is SvelteKit's form data

	// Client-side persisted history
	const mythHistory = new PersistedState<MythHistoryEntry[]>('myth-history', []);
	const MAX_HISTORY_ITEMS = 100;

	// Function to add a verification result to the persisted history
	function addResultToHistory(result: MythVerificationResult) {
		console.log('[addResultToHistory] Received result:', JSON.parse(JSON.stringify(result)));
		if (result && result.success === true && typeof result.myth === 'string' && result.data) {
			const newEntry: MythHistoryEntry = {
				id: crypto.randomUUID(),
				myth: result.myth!, // myth is guaranteed by the if condition
				timestamp: Date.now(),
				result: result, // The entire form object which matches MythVerificationResult
				isBookmarked: false
			};

			let currentHistory = mythHistory.current || [];

			// Prevent adding if the latest entry seems identical based on myth and explanation
			// This helps avoid duplicates
			if (currentHistory.length > 0) {
				const latestEntry = currentHistory[0];
				if (
					latestEntry.myth === newEntry.myth &&
					latestEntry.result.data?.explanation === newEntry.result.data?.explanation &&
					latestEntry.result.data?.verdict === newEntry.result.data?.verdict &&
					latestEntry.result.cached === newEntry.result.cached
				) {
					return; // Skip adding identical entry
				}
			}

			const updatedHistory = [newEntry, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);
			console.log('[addResultToHistory] New entry created:', JSON.parse(JSON.stringify(newEntry)));
			console.log(
				'[addResultToHistory] Current history before update:',
				JSON.parse(JSON.stringify(mythHistory.current))
			);
			mythHistory.current = updatedHistory;
			console.log(
				'[addResultToHistory] History updated. New mythHistory.current:',
				JSON.parse(JSON.stringify(mythHistory.current))
			);
		} else {
			console.log(
				'[addResultToHistory] Conditions not met to add to history. Result:',
				JSON.parse(JSON.stringify(result))
			);
		}
	}

	// Handle form submission for the main myth
	const handleSubmit: SubmitFunction = ({ formData }) => {
		const mythFromInput = formData.get('myth') as string;

		// If a new myth is submitted, clear previous main display data and associated research
		if (displayData && displayData.myth !== mythFromInput) {
			displayData = null;
			activeResearchLenses = [];
			// activeLensId = 'historical'; // Optionally reset active lens
			sourceAnalysisResult = null;
			synthesisResult = null;
			console.log('[handleSubmit] New myth submitted, clearing previous displayData and research.');
		}

		loading = true;
		return async ({ update, result }) => {
			loading = false;
			// `update()` will cause `pageFormProp` to update.
			// The $effect watching `pageFormProp` will then update `displayData`.
			await update();

			// The result.data from a default action is directly the MythVerificationResult
			if (result.type === 'success' && result.data) {
				const verificationResult = result.data as MythVerificationResult;
				console.log(
					'[handleSubmit] Form submission successful. Server result:',
					JSON.parse(JSON.stringify(verificationResult))
				);
				// The $effect will handle setting displayData from pageFormProp.
				// We just need to ensure addResultToHistory is called with the correct, fresh data.
				if (
					verificationResult.success === true &&
					verificationResult.myth &&
					verificationResult.data
				) {
					// Directly use verificationResult for history, as this is the freshest data from this action.
					addResultToHistory(verificationResult);
				} else if (verificationResult.success === false) {
					// Update displayData to show the error if pageFormProp effect doesn't catch it well for errors
					displayData = verificationResult;
					console.log('[handleSubmit] Verification unsuccessful. Error should be in displayData.');
				}
			} else if (result.type === 'error') {
				console.error('[handleSubmit] Form submission error:', result.error);
				// Potentially set an error state in displayData for the current myth
				if (mythFromInput) {
					displayData = {
						success: false,
						myth: mythFromInput,
						error: result.error?.message || 'Submission failed',
						data: undefined, // Or existing data if you want to keep it alongside error
						cached: false
					};
				}
			} else {
				console.log(
					'[handleSubmit] Form submission result was not successful or data is missing. Result type:',
					result.type,
					'Result data:',
					result.type === 'redirect' ? 'no data for redirects' : result.data
				);
			}
		};
	};

	$effect(() => {
		// This effect runs when 'pageFormProp' (from $props) changes.
		console.log(
			'[Effect pageFormPropWatcher] pageFormProp changed:',
			JSON.parse(JSON.stringify(pageFormProp))
		);

		if (
			pageFormProp &&
			typeof pageFormProp.success === 'boolean' &&
			typeof pageFormProp.myth === 'string'
		) {
			// Check if it's a MythVerificationResult by looking for data.verdict
			const potentialMVRData = pageFormProp.data as Partial<MythVerificationResult['data']>; // Cast to check .verdict

			if (potentialMVRData && typeof potentialMVRData.verdict === 'string') {
				const newMVR = pageFormProp as MythVerificationResult; // Now it's safer to cast
				// Update if it's a different myth, different explanation, or different success status
				if (
					displayData?.myth !== newMVR.myth ||
					(displayData?.data &&
						newMVR.data &&
						displayData.data.explanation !== newMVR.data.explanation) ||
					displayData?.success !== newMVR.success ||
					(displayData === null && newMVR.success === true) // Handle initial load
				) {
					displayData = newMVR;
					console.log(
						'[Effect pageFormPropWatcher] Updated displayData with MythVerificationResult from pageFormProp.'
					);
				}
			} else if (pageFormProp.success === false && pageFormProp.error) {
				// This is an error response that includes a myth string (e.g. from handleSubmit error path)
				// Only update displayData if it concerns the current myth or if no myth is displayed.
				if ((displayData && pageFormProp.myth === displayData.myth) || !displayData) {
					displayData = {
						success: false,
						myth: pageFormProp.myth,
						error: pageFormProp.error,
						// Preserve existing data if error is for the current myth and data exists, otherwise undefined
						data:
							displayData?.myth === pageFormProp.myth && displayData.data
								? displayData.data
								: undefined,
						cached:
							'cached' in pageFormProp && typeof pageFormProp.cached === 'boolean'
								? pageFormProp.cached
								: false
					};
					console.log(
						'[Effect pageFormPropWatcher] Updated displayData with error from pageFormProp.'
					);
				}
			}
			// Other action results (Lens, Source, Synthesize) will not have 'pageFormProp.data.verdict'.
			// They update their own $state variables (allLenses, sourceAnalysisResult, etc.).
		} else if (pageFormProp === null && displayData !== null) {
			// This case might occur if an action returns nothing or form is reset by SvelteKit in certain ways.
			// Decide if displayData should be cleared. Typically, resetUIVisibility handles explicit clearing.
			// console.log('[Effect pageFormPropWatcher] pageFormProp is null. displayData not changed by this effect.');
		}
	});

	// Handle reset
	const handleResetSubmit: SubmitFunction = () => {
		resetUIVisibility(); // Clear client-side state immediately
		return async ({ update }) => {
			await update({ reset: true }); // Process server action result, update pageFormProp
			// The $effect watching pageFormProp will also run.
			// If pageFormProp is set to { success: true, reset: true } (from the server action),
			// the $effect logic should ensure displayData remains null or is set to null.
			// resetUIVisibility already sets displayData to null.
			console.log('[handleResetSubmit] Form reset action submitted and processed by client.');
		};
	};

	function resetUIVisibility() {
		displayData = null; // Clear the main displayed data
		activeResearchLenses = []; // Reset lenses, this will also update 'allLenses' derived state
		// activeLensId = 'historical'; // Optionally reset active lens to default
		customLensInput = '';
		showCustomLensInput = false;
		showSourceAnalysisDialog = false;
		selectedSource = null;
		currentAnalysisType = '';
		customSourceQuery = '';
		sourceAnalysisResult = null;
		synthesisResult = null;
		// pageFormProp = null; // Cannot assign to $props. SvelteKit handles form prop reset.
		// Navigating to the same page or specific logic in actions might be needed for full server form reset.
		// For client-side, clearing displayData and other states is key.
		console.log('[resetUIVisibility] UI and related states reset.');
	}
</script>

<RouteHead
	title="Myth Buster Game - Test Your Knowledge"
	description="Test your knowledge and bust myths in our interactive game. See if you can distinguish fact from fiction."
	keywords={['myth buster game', 'trivia', 'fact or fiction', 'knowledge test', 'ai game']}
/>

<!-- Using CSS media queries instead of JavaScript for responsive design -->

<div class="min-h-screen bg-gradient-to-br from-background to-background/50">
	<!-- Main Content -->
	<main class="relative mx-auto min-h-screen w-full">
		<!-- <RetroGrid /> -->

		<h3 class="p-6 text-center text-2xl font-bold md:text-5xl">
			Verify <AuroraText>Myths</AuroraText>
		</h3>
		<section class="mx-auto max-w-7xl p-4">
			<div class="flex flex-col lg:justify-center lg:gap-8 xl:gap-12">
				<!-- Main Analysis Column -->
				<div class="flex w-full flex-col items-center space-y-6">
					<!-- Add this log -->
					{console.log(
						'[Template] Evaluating displayData condition. displayData:',
						displayData,
						'Should show input:',
						!displayData?.data?.verdict || displayData?.success === false
					)}

					{#if !displayData?.data?.verdict || displayData?.success === false}
						<!-- Input Form View -->
						<div class="flex w-full justify-center py-8 sm:py-12 md:py-16">
							<MythInput {loading} {handleSubmit} />
						</div>
					{:else if displayData && displayData.data}
						<!-- Results View for Main Column -->
						<!-- Cached indicator -->
						{#if displayData.cached}
							<div class="flex w-full items-center justify-end">
								<Badge variant="outline" class="text-xs text-muted-foreground">
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

						<!-- Myth Origin -->
						{#if displayData.data.mythOrigin}
							<div class="w-full rounded-lg border border-primary/20 bg-muted/30 p-4">
								<h3 class="mb-2 text-lg font-medium">Origin of the Myth</h3>
								<p class="text-muted-foreground">{displayData.data.mythOrigin}</p>
							</div>
						{/if}

						<!-- Why People Believe This Myth -->
						{#if displayData.data.whyBelieved}
							<div class="w-full rounded-lg border border-primary/20 bg-muted/30 p-4">
								<h3 class="mb-2 text-lg font-medium">Why People Believe This Myth</h3>
								<p class="text-muted-foreground">{displayData.data.whyBelieved}</p>
							</div>
						{/if}

						<!-- Share Options for current myth -->
						{#if displayData.myth && displayData.data.verdict}
							<div class="w-full">
								<ShareOptions
									myth={displayData.myth}
									explanation={displayData.data.explanation}
									verdict={displayData.data.verdict}
								/>
							</div>
						{/if}

						<!-- Deep Research Section Component-->
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

						<!-- Try Another Button -->
						<form method="POST" action="?/resetPage" use:enhance={handleResetSubmit}>
							<Button
								type="submit"
								variant="outline"
								class="w-full border-primary py-6 text-lg text-primary hover:bg-primary/70"
							>
								Verify Another Myth
							</Button>
						</form>
					{/if}
				</div>

				<!-- Secondary Information Column -->
				<div class="mt-6 w-full">
					<!-- Mobile view with tabs (shown only on small screens) -->
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
											class="flex h-40 items-center justify-center rounded-md border border-dashed text-muted-foreground"
										>
											No citations available for this myth yet.
										</div>
									{/if}
								{:else if activeTab === 'related'}
									{#if displayData?.data?.relatedMyth}
										<RelatedMyths relatedMyth={displayData.data.relatedMyth} />
									{:else}
										<div
											class="flex h-40 items-center justify-center rounded-md border border-dashed text-muted-foreground"
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

	<!-- Source Analysis Dialog -->
	{#if showSourceAnalysisDialog}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div class="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
				<div class="mb-4">
					<h3 class="text-lg font-semibold">Analyze Source</h3>
					<p class="text-sm text-muted-foreground">Deep analysis of: {selectedSource?.name}</p>
				</div>

				<form method="POST" action="?/analyzeSource" use:enhance={analyzeSource}>
					<input type="hidden" name="sourceUrl" value={selectedSource?.url || ''} />
					<input type="hidden" name="sourceName" value={selectedSource?.name || ''} />
					<input type="hidden" name="mythContext" value={selectedSource?.mythContext || ''} />

					<div class="space-y-4">
						<div>
							<label for="analysisType" class="block text-sm font-medium">Analysis Type</label>
							<select
								id="analysisType"
								bind:value={currentAnalysisType}
								name="analysisType"
								class="w-full rounded-md border px-3 py-2"
							>
								<option value="">Select analysis type</option>
								{#each analysisTypes as type}
									<option value={type.id}>{type.name}</option>
								{/each}
							</select>
						</div>

						{#if currentAnalysisType === 'custom'}
							<div>
								<label for="customQuery" class="block text-sm font-medium">Custom Question</label>
								<textarea
									id="customQuery"
									bind:value={customSourceQuery}
									name="customQuery"
									placeholder="Enter your custom question about the source"
									class="w-full rounded-md border px-3 py-2"
									rows="3"
								></textarea>
							</div>
						{/if}

						<div class="flex gap-2">
							<button
								type="submit"
								disabled={sourceAnalysisResult?.loading || !currentAnalysisType}
								class="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
							>
								{#if sourceAnalysisResult?.loading}
									Analyzing...
								{:else}
									Analyze Source
								{/if}
							</button>
							<button
								type="button"
								onclick={() => (showSourceAnalysisDialog = false)}
								class="rounded-md border px-4 py-2 hover:bg-muted"
							>
								Close
							</button>
						</div>
					</div>
				</form>

				{#if sourceAnalysisResult && !sourceAnalysisResult.loading}
					<div class="mt-4 max-h-60 overflow-y-auto rounded-md border p-4">
						{#if sourceAnalysisResult.error}
							<p class="text-destructive">Error: {sourceAnalysisResult.error}</p>
						{:else if sourceAnalysisResult.result}
							<div class="space-y-3 text-sm">
								{#if sourceAnalysisResult.result.analysis}
									<div>
										<h6 class="font-medium">Analysis:</h6>
										<p>{sourceAnalysisResult.result.analysis}</p>
									</div>
								{/if}
								{#if sourceAnalysisResult.result.reliability}
									<div>
										<h6 class="font-medium">Reliability Assessment:</h6>
										<p>{sourceAnalysisResult.result.reliability}</p>
									</div>
								{/if}
								{#if sourceAnalysisResult.result.methodology}
									<div>
										<h6 class="font-medium">Methodology Evaluation:</h6>
										<p>{sourceAnalysisResult.result.methodology}</p>
									</div>
								{/if}
								{#if sourceAnalysisResult.result.corroborating && sourceAnalysisResult.result.corroborating.length > 0}
									<div>
										<h6 class="font-medium">Supporting Evidence:</h6>
										<ul class="list-disc pl-5">
											{#each sourceAnalysisResult.result.corroborating as item}
												<li>{item}</li>
											{/each}
										</ul>
									</div>
								{/if}
								{#if sourceAnalysisResult.result.contradicting && sourceAnalysisResult.result.contradicting.length > 0}
									<div>
										<h6 class="font-medium">Contradicting Evidence:</h6>
										<ul class="list-disc pl-5">
											{#each sourceAnalysisResult.result.contradicting as item}
												<li>{item}</li>
											{/each}
										</ul>
									</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
