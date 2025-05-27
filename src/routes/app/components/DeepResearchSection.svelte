<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Search, Lightbulb, Microscope, Loader2, ChevronDown } from '@lucide/svelte';
	import type { LensResult, SynthesisResult } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { AlertTriangle, CheckCircle2, Link2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	// Props
	let {
		mythStatement,
		initialCitations,
		activeLensId = $bindable(),
		predefinedLenses,
		activeResearchLensesProp, // Renamed to avoid conflict, this is the array from parent
		allLenses, // Derived array from parent
		customLensInput = $bindable(),
		showCustomLensInput = $bindable(),
		addCustomLensFunction, // Renamed
		openSourceAnalysisFunction, // Renamed
		analyzeLensEnhancer, // Renamed
		canSynthesizeSignal, // Renamed
		synthesisResultSignal, // Renamed
		synthesizeInsightsEnhancer // Renamed
	}: {
		mythStatement: string | undefined;
		initialCitations: Array<{ title: string; url: string }> | undefined;
		activeLensId: string;
		predefinedLenses: LensResult[]; // Assuming LensResult is the common structure
		activeResearchLensesProp: LensResult[];
		allLenses: LensResult[];
		customLensInput: string;
		showCustomLensInput: boolean;
		addCustomLensFunction: () => void;
		openSourceAnalysisFunction: (source: {
			url: string;
			name: string;
			mythContext: string;
		}) => void;
		analyzeLensEnhancer: SubmitFunction;
		canSynthesizeSignal: boolean;
		synthesisResultSignal: SynthesisResult | null;
		synthesizeInsightsEnhancer: SubmitFunction;
	} = $props();
</script>

<section class="w-full rounded-lg border border-primary/20 bg-muted/30 p-6">
	<h3 class="mb-4 flex items-center gap-2 text-xl font-semibold">
		<Microscope class="h-5 w-5" />
		Deep Research Analysis
	</h3>
	<p class="mb-6 text-muted-foreground">
		Explore this myth from multiple perspectives and analyze the evidence in detail.
	</p>

	<!-- Multi-Angle Investigation -->
	<div class="mb-8">
		<h4 class="mb-4 text-lg font-medium">Research Perspectives</h4>

		<!-- Lens Selection -->
		<div class="mb-4 flex flex-wrap gap-2">
			{#each predefinedLenses as lens}
				<Button
					variant={activeLensId === lens.id ? 'default' : 'outline'}
					size="sm"
					onclick={() => (activeLensId = lens.id)}
				>
					{lens.name}
				</Button>
			{/each}
			{#each activeResearchLensesProp.filter((lens) => lens.isCustom) as lens (lens.id)}
				<Button
					variant={activeLensId === lens.id ? 'default' : 'outline'}
					size="sm"
					onclick={() => (activeLensId = lens.id)}
				>
					{lens.name}
				</Button>
			{/each}
			<Button
				variant="outline"
				size="sm"
				onclick={() => (showCustomLensInput = !showCustomLensInput)}
			>
				{showCustomLensInput ? 'Cancel' : '+ Custom'}
			</Button>
		</div>

		{#if showCustomLensInput}
			<div class="mb-4 flex items-center gap-2">
				<Input
					type="text"
					bind:value={customLensInput}
					placeholder="Enter custom research angle (e.g., 'Environmental impact')"
					class="grow"
				/>
				<Button onclick={addCustomLensFunction}>Add</Button>
			</div>
		{/if}

		<!-- Research Results -->
		{#each allLenses as lens (lens.id)}
			{#if activeLensId === lens.id}
				<Card.Root class="w-full">
					{#if lens.loading}
						<Card.Header>
							<Card.Title>
								<Skeleton class="h-6 w-3/4" />
							</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-4">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-4 w-5/6" />
							<div class="space-y-2 pt-2">
								<Skeleton class="h-4 w-1/4" />
								<Skeleton class="h-4 w-full" />
								<Skeleton class="h-4 w-full" />
							</div>
							<div class="space-y-2 pt-2">
								<Skeleton class="h-4 w-1/4" />
								<Skeleton class="h-4 w-full" />
								<Skeleton class="h-4 w-full" />
							</div>
						</Card.Content>
					{:else if lens.error}
						<Card.Content class="p-0">
							<Alert.Root
								variant="destructive"
								class="m-4 flex flex-col space-y-3 border-destructive/50 text-destructive"
							>
								<div class="flex items-center gap-2">
									<AlertTriangle class="h-4 w-4" />
									<Alert.Title>Analysis Error</Alert.Title>
								</div>
								<Alert.Description>{lens.error}</Alert.Description>
								<!-- Add Try Again Button -->
								<form method="POST" action="?/researchLens" use:enhance={analyzeLensEnhancer}>
									<input type="hidden" name="mythStatement" value={mythStatement || ''} />
									<input type="hidden" name="lensType" value={lens.id} />
									<input type="hidden" name="lensName" value={lens.name} />
									{#if lens.isCustom}
										<input type="hidden" name="customQuery" value={lens.name} />
									{/if}
									<Button type="submit" variant="outline" class="mt-2 w-full md:w-auto">
										<Microscope class="mr-2 h-4 w-4" /> Try Again
									</Button>
								</form>
							</Alert.Root>
						</Card.Content>
					{:else if lens.result}
						<Card.Header>
							<Card.Title>{lens.name} Analysis</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-6">
							<div>
								<h6 class="mb-2 text-base font-semibold">Explanation:</h6>
								<p class="break-words text-sm leading-relaxed text-muted-foreground">
									{lens.result.explanation}
								</p>
							</div>
							{#if lens.result.keyInsights && lens.result.keyInsights.length > 0}
								<div>
									<h6 class="mb-2 text-base font-semibold">Key Insights:</h6>
									<ul class="space-y-2 text-sm">
										{#each lens.result.keyInsights as insight}
											<li class="flex items-start">
												<CheckCircle2 class="mr-2 mt-1 h-4 w-4 shrink-0 text-primary" />
												<span class="break-words text-muted-foreground">{insight}</span>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
							{#if lens.result.citations && lens.result.citations.length > 0}
								<div>
									<h6 class="mb-2 text-base font-semibold">Sources:</h6>
									<ul class="space-y-2 text-sm">
										{#each lens.result.citations as citation}
											<li class="flex items-start justify-between">
												<div class="flex grow items-start">
													<Link2 class="mr-2 mt-1 h-4 w-4 shrink-0 text-primary" />
													<a
														href={citation.url}
														target="_blank"
														rel="noopener noreferrer"
														class="grow break-words text-primary hover:underline"
														title={citation.title}
													>
														{citation.title}
													</a>
												</div>
												<Button
													variant="outline"
													size="sm"
													class="ml-2 h-auto shrink-0 px-2 py-1 text-xs"
													onclick={() =>
														openSourceAnalysisFunction({
															url: citation.url,
															name: citation.title,
															mythContext: mythStatement || ''
														})}
												>
													<Search class="mr-1 h-3 w-3" /> Analyze
												</Button>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</Card.Content>
					{:else}
						<Card.Content class="flex flex-col items-center justify-center p-6 text-center">
							<p class="mb-4 text-muted-foreground">
								No analysis performed for the "{lens.name}" perspective yet.
							</p>
							<form method="POST" action="?/researchLens" use:enhance={analyzeLensEnhancer}>
								<input type="hidden" name="mythStatement" value={mythStatement || ''} />
								<input type="hidden" name="lensType" value={lens.id} />
								<input type="hidden" name="lensName" value={lens.name} />
								{#if lens.isCustom}
									<input type="hidden" name="customQuery" value={lens.name} />
								{/if}
								<Button type="submit">
									<Microscope class="mr-2 h-4 w-4" /> Analyze from {lens.name} perspective
								</Button>
							</form>
						</Card.Content>
					{/if}
				</Card.Root>
			{/if}
		{/each}
	</div>

	<!-- Initial Citations Analysis -->
	{#if initialCitations && initialCitations.length > 0}
		<Card.Root class="mb-8">
			<Card.Header>
				<Card.Title>Initial Sources Analysis</Card.Title>
				<Card.Description
					>Review and analyze the initial sources provided for the myth.</Card.Description
				>
			</Card.Header>
			<Card.Content class="p-0">
				<Accordion.Root type="single" class="w-full">
					<Accordion.Item value="initial-citations" class="border-b-0">
						<Accordion.Trigger
							class="flex w-full items-center justify-between px-6 py-4 text-base font-medium hover:bg-muted/50 [&[data-state=open]>svg]:rotate-180"
						>
							<span>View Initial Citations ({initialCitations.length})</span>
						</Accordion.Trigger>
						<Accordion.Content class="px-6 pb-4 pt-0">
							<ul class="space-y-3">
								{#each initialCitations as citation}
									<li class="flex items-center justify-between rounded-md border p-3">
										<a
											href={citation.url}
											target="_blank"
											rel="noopener noreferrer"
											class="grow break-words text-primary hover:underline"
											title={citation.title}
										>
											{citation.title}
										</a>
										<Button
											variant="outline"
											size="sm"
											class="ml-2 h-auto shrink-0 px-2 py-1 text-xs"
											onclick={() =>
												openSourceAnalysisFunction({
													url: citation.url,
													name: citation.title,
													mythContext: mythStatement || ''
												})}
										>
											<Search class="mr-1 h-3 w-3" />
											Analyze
										</Button>
									</li>
								{/each}
							</ul>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Synthesis Section -->
	{#if canSynthesizeSignal}
		<Card.Root class="mb-8 bg-primary/5">
			<Card.Header>
				<Card.Title class="flex items-center gap-2">
					<Lightbulb class="h-5 w-5" />
					Insight Synthesis
				</Card.Title>
				<Card.Description>
					Combine findings from different research perspectives to generate comprehensive insights.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form method="POST" action="?/synthesizeInsights" use:enhance={synthesizeInsightsEnhancer}>
					<input type="hidden" name="mythStatement" value={mythStatement || ''} />
					<input
						type="hidden"
						name="lensResults"
						value={JSON.stringify(
							activeResearchLensesProp.filter((lens) => lens.result && !lens.error)
						)}
					/>
					<Button
						type="submit"
						disabled={!canSynthesizeSignal || synthesisResultSignal?.loading}
						class="w-full sm:w-auto"
					>
						{#if synthesisResultSignal?.loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Synthesizing insights...
						{:else}
							<Lightbulb class="mr-2 h-4 w-4" />
							Synthesize Insights
						{/if}
					</Button>
				</form>

				{#if synthesisResultSignal && !synthesisResultSignal.loading}
					<div class="mt-6 space-y-6">
						{#if synthesisResultSignal.error}
							<Alert.Root variant="destructive">
								<AlertTriangle class="h-4 w-4" />
								<Alert.Title>Synthesis Error</Alert.Title>
								<Alert.Description>{synthesisResultSignal.error}</Alert.Description>
							</Alert.Root>
						{:else}
							{#if synthesisResultSignal.overallInsight}
								<div class="rounded-lg border bg-background p-4">
									<h5 class="mb-2 text-lg font-semibold">Overall Insight</h5>
									<p class="text-sm text-muted-foreground">
										{synthesisResultSignal.overallInsight}
									</p>
								</div>
							{/if}

							{#if synthesisResultSignal.themes && synthesisResultSignal.themes.length > 0}
								<div>
									<h5 class="mb-3 text-lg font-semibold">Key Themes</h5>
									<div class="grid gap-4 md:grid-cols-2">
										{#each synthesisResultSignal.themes as theme}
											<Card.Root>
												<Card.Header class="pb-2 pt-4">
													<Card.Title class="text-base">{theme.title}</Card.Title>
												</Card.Header>
												<Card.Content>
													<p class="text-sm text-muted-foreground">{theme.description}</p>
												</Card.Content>
											</Card.Root>
										{/each}
									</div>
								</div>
							{/if}

							{#if synthesisResultSignal.connections && synthesisResultSignal.connections.length > 0}
								<div>
									<h5 class="mb-3 text-lg font-semibold">Cross-Perspective Connections</h5>
									<ul class="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
										{#each synthesisResultSignal.connections as connection}
											<li>{connection}</li>
										{/each}
									</ul>
								</div>
							{/if}

							{#if synthesisResultSignal.contradictions && synthesisResultSignal.contradictions.length > 0}
								<div>
									<h5 class="mb-3 text-lg font-semibold">Notable Contradictions</h5>
									<ul class="list-disc space-y-1 pl-5 text-sm">
										{#each synthesisResultSignal.contradictions as contradiction}
											<li class="text-orange-600 dark:text-orange-500">{contradiction}</li>
										{/each}
									</ul>
								</div>
							{/if}
						{/if}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{:else}
		<Alert.Root class="mb-8">
			<Lightbulb class="h-4 w-4" />
			<Alert.Title>Ready to Synthesize?</Alert.Title>
			<Alert.Description>
				Explore at least 2 different research perspectives to enable insight synthesis.
			</Alert.Description>
		</Alert.Root>
	{/if}
</section>
