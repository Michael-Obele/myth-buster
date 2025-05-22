<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import type { PageData } from './$types';
	import type {
		GameActionData,
		GenerateActionResult,
		CheckAnswerActionResult,
		Citation
	} from '$lib/game/types';

	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { Progress } from '$lib/components/ui/progress';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import * as GameDialog from '$lib/components/ui/dialog/index.js';

	import {
		Check,
		X,
		RefreshCw,
		AlertTriangle,
		Trophy as TrophyIcon,
		Flame,
		Sparkles,
		LoaderCircle,
		Info,
		BookOpen,
		Brain,
		FlaskConical,
		Globe,
		Laptop,
		Palette,
		Scale,
		ScrollText,
		Video
	} from 'lucide-svelte';

	import { Confetti } from 'svelte-confetti';
	import { PersistedState } from 'runed';
	import { toast } from 'svelte-sonner';
	import GameAbout from '$lib/game/GameAbout.svelte';

	// --- Component Props ---
	let { data: pageLoadData, form: formProp }: { data: PageData; form: GameActionData } = $props();

	// --- Persistent Game State (Score, Streak, High Score) ---
	const scoreState = new PersistedState('mythBusterScore', 0);
	const highScoreState = new PersistedState('mythBusterHighScore', 0);
	const streakState = new PersistedState('mythBusterStreak', 0);

	let score = $state(scoreState.current);
	let highScore = $state(highScoreState.current);
	let streak = $state(streakState.current);

	function updateScore(newScore: number) {
		score = newScore;
		scoreState.current = newScore;
		checkHighScore(newScore);
	}

	function updateStreak(newStreak: number) {
		streak = newStreak;
		streakState.current = newStreak;
		if (newStreak >= 3) {
			let message = `🔥 ${newStreak} in a row! Keep it up!`;
			if (newStreak >= 10) message = `🔥🔥🔥 ${newStreak} in a row! Incredible!`;
			else if (newStreak >= 5) message = `🔥🔥 ${newStreak} in a row! Great job!`;
			toast.success(message);
		}
	}

	function checkHighScore(newScore: number): boolean {
		if (newScore > highScore) {
			highScore = newScore;
			highScoreState.current = newScore;
			if (newScore > 0) {
				toast.success('🎉 New High Score! 🎉');
			}
			return true;
		}
		return false;
	}

	// --- UI & Interaction State ---
	let confidence = $state(50);
	let isGenerating = $state(false);
	let isAnswering = $state(false);
	let currentAnswerSubmission = $state<string | null>(null);

	// --- Current Myth State ---
	let currentMythStatement = $state<string | null>(null);
	let currentMythIsTrue = $state<boolean | null>(null);
	let currentMythExplanation = $state<string | null>(null);
	let currentMythCitations = $state<Citation[]>([]);
	let currentMythIndexInTrack = $state(0); // 0-indexed
	let isLastMythInTrack = $state(false);
	let showTrackCompletedMessage = $state(false);
	let justFinishedTrackTitle = $state<string | null>(pageLoadData.trackTitle);

	// --- Error state for form processing issues not covered by formProp.error ---
	let clientSideError = $state<string | null>(null);

	// --- Type Guards ---
	function isGenerateResult(formData: GameActionData): formData is GenerateActionResult {
		return !!formData && formData.action === 'generateMyth';
	}

	function isCheckAnswerResult(formData: GameActionData): formData is CheckAnswerActionResult {
		return !!formData && formData.action === 'checkAnswer';
	}

	// --- Form Result Handling Function ---
	function handleFormUpdate(actionResult: GameActionData) {
		clientSideError = null; // Clear previous client-side errors

		if (!actionResult) {
			currentMythStatement = null;
			console.warn('[TrackPlayer handleFormUpdate] Received null or undefined actionResult.');
			return;
		}

		console.log('[TrackPlayer handleFormUpdate] Processing:', actionResult);

		if (isGenerateResult(actionResult)) {
			if (actionResult.success) {
				currentMythStatement = actionResult.statement;
				currentMythIsTrue = actionResult.isTrue;
				currentMythExplanation = actionResult.explanation;
				currentMythCitations = actionResult.citations || [];
				currentMythIndexInTrack = actionResult.currentMythIndex ?? 0;
				isLastMythInTrack = actionResult.isLastMythInTrack ?? false;
				showTrackCompletedMessage = false;
				currentAnswerSubmission = null;
				confidence = 50;
			} else if (actionResult.trackCompleted) {
				showTrackCompletedMessage = true;
				justFinishedTrackTitle = actionResult.trackTitle || pageLoadData.trackTitle;
				currentMythStatement = null;
			}
			if (actionResult.error) {
				toast.error(actionResult.error);
			}
		} else if (isCheckAnswerResult(actionResult)) {
			if (actionResult.success) {
				updateScore(score + actionResult.points);
				if (actionResult.result === 'correct') {
					updateStreak(streak + 1);
					if (isLastMythInTrack) {
						showTrackCompletedMessage = true;
						justFinishedTrackTitle = pageLoadData.trackTitle;
					}
				} else {
					updateStreak(0);
					if (actionResult.points >= 0) {
						toast.error('Incorrect answer. Better luck next time!');
					} else {
						toast.error(`${actionResult.points} points. Incorrect answer.`);
					}
				}
			}
			if (actionResult.error) {
				toast.error(actionResult.error);
			}
		} else {
			const potentialError = (actionResult as { error?: string }).error;
			if (typeof potentialError === 'string') {
				toast.error(potentialError);
			} else {
				toast.error('An unexpected issue occurred while processing the form.');
			}
			console.warn(
				'[TrackPlayer handleFormUpdate] Received actionResult of unknown structure:',
				actionResult
			);
		}
	}

	// Call handler once on initial load if formProp has data (e.g. from server error on initial action)
	if (formProp) {
		handleFormUpdate(formProp);
	}

	// --- Derived UI States ---
	let hasValidStatementForDisplay = $derived(!!currentMythStatement);
	let hasAnswerResultForDisplay = $derived(
		formProp && isCheckAnswerResult(formProp) && formProp.success === true
	);
	let isCurrentAnswerCorrect = $derived(
		hasAnswerResultForDisplay && (formProp as CheckAnswerActionResult).result === 'correct'
	);

	// --- Form Element Reference & Initial Myth Load ---
	let generateMythFormElement: HTMLFormElement | null = $state(null);

	onMount(() => {
		if (generateMythFormElement && !currentMythStatement && !showTrackCompletedMessage) {
			console.log('[TrackPlayer onMount] Attempting to load first myth.');
			const formData = new FormData(generateMythFormElement);
			formData.set('mythIndex', '0');
			formData.set('trackTitle', pageLoadData.trackTitle);
			formData.set('trackCategory', pageLoadData.trackCategory);
			formData.set('trackDifficulty', pageLoadData.trackDifficulty);
			formData.set('totalMythsInTrack', pageLoadData.totalMythsInTrack.toString());

			if (typeof generateMythFormElement.requestSubmit === 'function') {
				generateMythFormElement.requestSubmit();
			} else {
				generateMythFormElement.submit();
			}
		}
	});

	// --- UI Helper Functions ---
	function getConfidenceColor(value: number): string {
		if (value < 25) return 'text-yellow-500';
		if (value < 50) return 'text-orange-500';
		if (value < 75) return 'text-blue-500';
		return 'text-emerald-500';
	}

	function getConfidenceLabel(value: number): string {
		if (value < 25) return 'Not very confident';
		if (value < 50) return 'Somewhat confident';
		if (value < 75) return 'Confident';
		if (value < 90) return 'Very confident';
		return 'Extremely confident';
	}

	// --- Icon Map for Dynamic Track Icon ---
	const iconMap: Record<string, ComponentType<SvelteComponent>> = {
		BookOpen,
		Brain,
		FlaskConical,
		Globe,
		Laptop,
		Palette,
		Scale,
		ScrollText,
		Video,
		Default: BookOpen
	};
</script>

{#if isCurrentAnswerCorrect}
	<div
		class="pointer-events-none fixed -top-[50px] left-0 flex h-screen w-screen justify-center overflow-hidden"
	>
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[500, 2000]}
			duration={5000}
			amount={200}
			colorArray={['#FFD700', '#FF6347', '#7FFF00', '#1E90FF', '#FF1493']}
			fallDistance="100vh"
		/>
	</div>
{/if}

<div class="container mx-auto min-h-screen max-w-3xl px-4 py-8 text-white">
	<div class="mb-6 flex flex-col items-center justify-center gap-2">
		<h1 class="text-center text-3xl font-bold">
			Track: {pageLoadData.trackTitle}
		</h1>
		<p class="text-center text-muted-foreground">
			Category: {pageLoadData.trackCategory} | Difficulty: {pageLoadData.trackDifficulty
				.charAt(0)
				.toUpperCase() + pageLoadData.trackDifficulty.slice(1)}
		</p>

		<div class="mt-2 flex gap-2">
			<Badge variant="outline" class="flex items-center gap-1 bg-primary/5">
				<TrophyIcon class="h-3.5 w-3.5 text-primary" /> Score: {score}
			</Badge>
			<Badge variant="outline" class="flex items-center gap-1 bg-primary/5">
				<Flame class="h-3.5 w-3.5 text-primary" /> Streak: {streak}
			</Badge>
			<Badge variant="outline" class="flex items-center gap-1 bg-primary/5">
				<Sparkles class="h-3.5 w-3.5 text-primary" /> High Score: {highScore}
			</Badge>
		</div>
	</div>

	<Card.Root class="mb-6 border-2 shadow-lg">
		<Card.Header class="px-6 py-5">
			<Card.Title class="flex items-center justify-center gap-2 text-2xl font-bold">
				{#if iconMap[pageLoadData.trackIcon || 'Default']}
					{@const Icon = iconMap[pageLoadData.trackIcon || 'Default']}
					<Icon class="h-6 w-6 text-primary" />
				{/if}
				Myth #{currentMythIndexInTrack + 1} of {pageLoadData.totalMythsInTrack}

				<GameDialog.Root>
					<GameDialog.Trigger><Info /></GameDialog.Trigger>
					<GameDialog.Content><GameAbout /></GameDialog.Content>
				</GameDialog.Root>
			</Card.Title>
			<Card.Description class="mt-2 text-center text-base font-medium">
				Is the statement true or false? How confident are you?
			</Card.Description>
			{#if pageLoadData.totalMythsInTrack > 0}
				<div class="px-6 pb-0 pt-2">
					<Progress
						value={((currentMythIndexInTrack + (hasAnswerResultForDisplay ? 1 : 0)) /
							pageLoadData.totalMythsInTrack) *
							100}
						max={100}
						class="h-2 w-full"
					/>
				</div>
			{/if}
		</Card.Header>

		<Card.Content class="space-y-6 p-6">
			{#if clientSideError}
				<Alert variant="destructive">
					<AlertTriangle class="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{clientSideError}</AlertDescription>
				</Alert>
			{:else if formProp?.error && !formProp?.success}
				<Alert variant="destructive">
					<AlertTriangle class="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{formProp.error}</AlertDescription>
				</Alert>
			{/if}

			<GameDialog.Root bind:open={showTrackCompletedMessage}>
				<GameDialog.Content class="sm:max-w-md">
					<GameDialog.Header>
						<GameDialog.Title class="flex items-center gap-2 text-2xl">
							<TrophyIcon class="h-7 w-7 text-yellow-400" /> Track Completed!
						</GameDialog.Title>
						<GameDialog.Description class="pt-2 text-base">
							Congratulations! You've successfully completed the <strong class="text-primary"
								>"{justFinishedTrackTitle}"</strong
							> track.
						</GameDialog.Description>
					</GameDialog.Header>
					<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
						<Button
							href="/game/tracks"
							variant="outline"
							onclick={() => (showTrackCompletedMessage = false)}>Back to Tracks</Button
						>
						<Button href="/game" onclick={() => (showTrackCompletedMessage = false)}
							>Play Random Myth</Button
						>
					</div>
				</GameDialog.Content>
			</GameDialog.Root>

			{#if showTrackCompletedMessage}
				<!-- Track completed message is handled by the dialog -->
				<!-- Optionally, add a specific message here if dialog isn't shown or for other reasons -->
				<div class="text-center">
					<p class="text-xl font-semibold">Track Finished!</p>
					<p>You can start a new track or play random myths.</p>
				</div>
			{:else if hasAnswerResultForDisplay && formProp && isCheckAnswerResult(formProp)}
				<!-- State 3: Show Answer Result (this block now comes first after completed check) -->
				{@const resultData = formProp}
				<div
					class={resultData.result === 'correct'
						? 'rounded-lg border-2 border-emerald-700/30 bg-emerald-950/20 p-6 shadow-md'
						: 'rounded-lg border-2 border-red-700/30 bg-red-950/20 p-6 shadow-md'}
				>
					<div class="mb-6 flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if resultData.result === 'correct'}
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800/30"
								>
									<Check class="h-6 w-6 text-emerald-400" />
								</div>
								<p class="text-lg font-semibold text-emerald-400">Correct!</p>
							{:else}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-800/30">
									<X class="h-6 w-6 text-red-400" />
								</div>
								<p class="text-lg font-semibold text-red-400">Incorrect!</p>
							{/if}
						</div>
						{#if resultData.result === 'correct'}
							<Badge
								variant="outline"
								class="border-emerald-700/50 bg-emerald-800/30 text-emerald-400"
								>+{resultData.points} points</Badge
							>
						{/if}
					</div>
					<div class="mb-6 rounded-md border border-slate-700/50 bg-slate-900/60 p-4 shadow-sm">
						<div class="mb-2 flex items-center justify-between">
							<p class="text-sm font-medium text-slate-300">
								Your Answer: <span
									class={resultData.userAnswer ? 'text-emerald-400' : 'text-red-400'}
									>{resultData.userAnswer ? 'TRUE' : 'FALSE'}</span
								>
							</p>
							<p class="text-sm font-medium text-slate-300">
								Confidence: <span class={getConfidenceColor(confidence)}>{confidence}%</span>
							</p>
						</div>
						<p class="text-lg font-medium text-slate-100">
							The statement "{resultData.statement}" is
							<span
								class={resultData.isTrue ? 'font-bold text-emerald-400' : 'font-bold text-red-400'}
								>{resultData.isTrue ? 'TRUE' : 'FALSE'}</span
							>
						</p>
					</div>
					<div class="mb-6">
						<h3 class="mb-2 text-base font-semibold text-slate-200">Explanation:</h3>
						<p class="text-slate-300">{resultData.explanation}</p>
					</div>
					{#if resultData.citations && resultData.citations.length > 0}
						<div class="rounded-md border border-slate-700/50 bg-slate-800/50 p-4">
							<h3 class="mb-2 text-sm font-semibold text-slate-200">Sources:</h3>
							<ul class="list-disc space-y-2 pl-5 text-sm">
								{#each resultData.citations as citation}
									<li>
										<a
											href={citation.url || '#'}
											target="_blank"
											rel="noopener noreferrer"
											class="break-words text-blue-400 hover:underline"
											>{citation.title || citation.url || 'Source link'}</a
										>
									</li>
								{/each}
							</ul>
						</div>
					{/if}

					<!-- Form for Next Myth / Finish Track (inside answer result block) -->
					<form
						method="POST"
						action="?/generateMyth"
						class="mt-6"
						use:enhance={() => {
							isGenerating = true;
							clientSideError = null;
							return async ({ result, update }) => {
								await update({ reset: false });
								isGenerating = false;
								if (result.type === 'error') {
									clientSideError = result.error.message || 'Failed to request new myth.';
									handleFormUpdate(null);
								} else {
									handleFormUpdate(formProp);
								}
							};
						}}
					>
						<input type="hidden" name="trackTitle" value={pageLoadData.trackTitle} />
						<input type="hidden" name="trackCategory" value={pageLoadData.trackCategory} />
						<input type="hidden" name="trackDifficulty" value={pageLoadData.trackDifficulty} />
						<input
							type="hidden"
							name="totalMythsInTrack"
							value={pageLoadData.totalMythsInTrack.toString()}
						/>
						<input type="hidden" name="mythIndex" value={currentMythIndexInTrack + 1} />
						<Button type="submit" class="w-full" disabled={isGenerating}>
							{#if isGenerating}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Loading...
							{:else if isLastMythInTrack}
								Finish Track
							{:else}
								Next Myth
							{/if}
						</Button>
					</form>
				</div>
			{:else if hasValidStatementForDisplay}
				<!-- State 2: Show Statement and Answer Buttons -->
				<div>
					<div class="mb-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
						<h2 class="text-center text-xl font-semibold text-primary">"{currentMythStatement}"</h2>
					</div>
					<form
						method="POST"
						action="?/checkAnswer"
						use:enhance={() => {
							isAnswering = true;
							clientSideError = null;
							currentAnswerSubmission =
								(document.activeElement as HTMLButtonElement)?.value || null;
							return async ({ result, update }) => {
								await update({ reset: false });
								isAnswering = false;
								if (result.type === 'error') {
									clientSideError = result.error.message || 'Failed to submit answer.';
									handleFormUpdate(null);
								} else {
									handleFormUpdate(formProp);
								}
							};
						}}
					>
						<input type="hidden" name="statement" value={currentMythStatement || ''} />
						<input
							type="hidden"
							name="isTrue"
							value={currentMythIsTrue !== null ? currentMythIsTrue.toString() : 'false'}
						/>
						<input type="hidden" name="explanation" value={currentMythExplanation || ''} />
						<input
							type="hidden"
							name="citations"
							value={JSON.stringify(currentMythCitations || [])}
						/>

						<div class="mb-8 grid gap-3">
							<div class="flex flex-col items-center">
								<div class="w-full max-w-xs space-y-3">
									<Slider type="single" bind:value={confidence} min={1} max={100} step={1} />
									<input type="hidden" name="confidence" value={confidence} />
									<Progress value={confidence} max={100} class="h-2" />
									<div class="flex justify-between text-sm">
										<p class="font-medium">{getConfidenceLabel(confidence)}</p>
										<p class="font-medium {getConfidenceColor(confidence)}">{confidence}%</p>
									</div>
								</div>
							</div>
						</div>

						<div class="flex flex-col gap-4 sm:flex-row">
							<Button
								type="submit"
								name="answer"
								value="true"
								variant="outline"
								class="flex-1 border-2 border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700"
								size="lg"
								disabled={isAnswering}
							>
								{#if isAnswering && currentAnswerSubmission === 'true'}
									<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
								{:else}
									<Check class="mr-2 h-5 w-5" />
								{/if} TRUE
							</Button>
							<Button
								type="submit"
								name="answer"
								value="false"
								variant="outline"
								class="flex-1 border-2 border-red-500 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-700"
								size="lg"
								disabled={isAnswering}
							>
								{#if isAnswering && currentAnswerSubmission === 'false'}
									<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
								{:else}
									<X class="mr-2 h-5 w-5" />
								{/if} FALSE
							</Button>
						</div>
					</form>
				</div>
			{:else}
				<!-- State 1: Initial Load / Generating First Myth (via onMount) -->
				<form
					method="POST"
					action="?/generateMyth"
					bind:this={generateMythFormElement}
					class="text-center"
					use:enhance={() => {
						isGenerating = true;
						clientSideError = null;
						return async ({ result, update }) => {
							await update({ reset: false });
							isGenerating = false;
							if (result.type === 'error') {
								clientSideError = result.error.message || 'Failed to request new myth.';
								handleFormUpdate(null);
							} else {
								handleFormUpdate(formProp);
							}
						};
					}}
				>
					<input type="hidden" name="trackTitle" value={pageLoadData.trackTitle} />
					<input type="hidden" name="trackCategory" value={pageLoadData.trackCategory} />
					<input type="hidden" name="trackDifficulty" value={pageLoadData.trackDifficulty} />
					<input
						type="hidden"
						name="totalMythsInTrack"
						value={pageLoadData.totalMythsInTrack.toString()}
					/>
					<input type="hidden" name="mythIndex" value={currentMythIndexInTrack} />

					{#if !generateMythFormElement || isGenerating}
						<!--This button isn't really meant to be clicked manually in this state, onMount handles it -->
						<!--It serves as the target for the programmatic submission -->
						<Button type="submit" class="w-full" disabled={true}>
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" /> Loading Myth...
						</Button>
					{/if}
				</form>
			{/if}
		</Card.Content>
	</Card.Root>

	<div class="mt-12 text-center">
		<Button href="/game/tracks" variant="link" class="text-primary hover:text-primary/90"
			>‹ Back to All Tracks</Button
		>
	</div>
</div>
