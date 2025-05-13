<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Check,
		X,
		RefreshCw,
		AlertTriangle,
		Trophy,
		Flame,
		Sparkles,
		LoaderCircle,
		Settings
	} from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { PageProps, ActionData } from './$types';
	import { Label } from '$lib/components/ui/label';
	import { Confetti } from 'svelte-confetti';
	import { PersistedState } from 'runed';

	// Import types from server
	interface Citation {
		url: string;
		title: string;
	}

	interface GenerateActionResult {
		success: boolean;
		error?: string;
		statement: string;
		isTrue: boolean;
		explanation: string;
		citations: Citation[] | string;
		cached?: boolean;
		result?: undefined;
		userAnswer?: undefined;
		points?: undefined;
	}

	interface CheckAnswerActionResult {
		success: boolean;
		error?: string;
		result: 'correct' | 'incorrect';
		statement: string;
		userAnswer: boolean;
		isTrue: boolean;
		explanation: string;
		citations: Citation[] | string;
		points: number;
		answer?: string;
	}

	type FormDataType = GenerateActionResult | CheckAnswerActionResult;

	// Get props from page data
	let { data, form }: PageProps = $props();

	// --- State Management with Svelte 5 Runes and PersistedState ---
	let confidence: number = $state(50);

	// Use PersistedState for values we want to persist across sessions
	const scoreState = new PersistedState('mythBusterScore', 0);
	const highScoreState = new PersistedState('mythBusterHighScore', 0);
	const streakState = new PersistedState('mythBusterStreak', 0);
	const categoryState = new PersistedState('mythBusterCategory', 'general');
	const difficultyState = new PersistedState('mythBusterDifficulty', 'medium');

	const difficulties = [
		{ label: 'Easy', value: 'easy' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'Hard', value: 'hard' }
	];

	const categories = [
		{ label: 'General', value: 'general' },
		{ label: 'Science', value: 'science' },
		{ label: 'History', value: 'history' },
		{ label: 'Geography', value: 'geography' },
		{ label: 'Entertainment', value: 'entertainment' }
	];

	// Temporary state for settings dialog
	let tempDifficulty: string = $state('');
	let tempCategory: string = $state('');

	// Use Runed PersistedState directly with Svelte state
	let score = $state(scoreState.current);
	let highScore = $state(highScoreState.current);
	let streak = $state(streakState.current);
	let selectedCategory = $state(categoryState.current);
	let selectedDifficulty = $state(difficultyState.current);

	// When changing any of these values, we'll persist them
	function updateScore(newScore: number) {
		score = newScore;
		scoreState.current = newScore;
		checkHighScore(newScore);
	}

	function updateStreak(newStreak: number) {
		streak = newStreak;
		streakState.current = newStreak;
	}

	function updateCategory(newCategory: string) {
		selectedCategory = newCategory;
		categoryState.current = newCategory;
	}

	function updateDifficulty(newDifficulty: string) {
		selectedDifficulty = newDifficulty;
		difficultyState.current = newDifficulty;
	}

	// UI state
	let showHighScoreMessage: boolean = $state(false);
	let showStreakAnimation: boolean = $state(false);
	let showConfetti: boolean = $state(false);
	let isGenerating: boolean = $state(false);
	let isAnswering: boolean = $state(false);

	// --- Derived values with Svelte 5 ---
	let hasResult = $derived(form?.result !== undefined);
	let hasStatement = $derived(form?.statement !== undefined);
	let isCorrect = $derived(form?.result === 'correct');

	// Type guard functions to safely check form data types
	function isGenerateResult(form: any): boolean {
		return !!form && 'statement' in form && !('result' in form);
	}

	function isCheckAnswerResult(form: any): boolean {
		return !!form && 'result' in form;
	}
	// Use $derived for simple expressions
	let confidenceLevel = $derived(confidence < 25 ? 'low' : confidence < 75 ? 'medium' : 'high');

	// Function to check and update high score
	function checkHighScore(newScore: number) {
		if (newScore > highScore) {
			highScore = newScore;
			highScoreState.current = newScore;

			// Show high score message if it's not the initial load
			if (newScore > 0) {
				showHighScoreMessage = true;
				setTimeout(() => {
					showHighScoreMessage = false;
				}, 3000);
			}
			return true;
		}
		return false;
	}

	// Helper function to process form results directly
	function processFormResult(formResult: any) {
		if (!formResult?.success) return;

		// Handle answer results with points
		if (formResult.points && typeof formResult.points === 'number') {
			// Update score
			updateScore(score + formResult.points);

			// Update streak based on result
			if (formResult.result === 'correct') {
				const oldStreak = streak;
				updateStreak(streak + 1);

				// Show streak animation if streak increased and is at least 2
				if (streak >= 2 && streak > oldStreak) {
					showStreakAnimation = true;
					setTimeout(() => {
						showStreakAnimation = false;
					}, 2000);
				}
			} else {
				updateStreak(0);
			}
		} else if (formResult.statement && !formResult.result) {
			// Reset confidence for new statements
			confidence = 50;
		}
	}

	// Interface for form success response
	interface FormResult {
		success: boolean;
		points?: number;
		result?: 'correct' | 'incorrect';
		statement?: string;
		isTrue?: boolean;
		explanation?: string;
		citations?: Citation[];
		error?: string;
	}

	// Parse citations from form data
	let citationsArray: Citation[] = $derived.by(() => {
		if (!form) {
			return [];
		}

		// Process citations from form data
		const formAny = form as any; // Use any type to safely access properties

		if (formAny.citations && Array.isArray(formAny.citations)) {
			return formAny.citations as Citation[];
		}

		if (typeof formAny.citations === 'string') {
			try {
				const parsed = JSON.parse(formAny.citations || '[]');
				return Array.isArray(parsed) ? parsed : [];
			} catch (e) {
				return [];
			}
		}

		return [];
	});

	// Helper functions
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

	// Track the current answer being submitted
	let currentAnswer: string | null = $state(null);

	function getStreakEmoji(streak: number): string {
		if (streak >= 10) return '🔥🔥🔥';
		if (streak >= 5) return '🔥🔥';
		if (streak >= 1) return '🔥';
		return '';
	}
</script>

<!-- Svelte Confetti effect for correct answers -->
{#if form?.result === 'correct'}
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
		<h1 class="text-center text-3xl font-bold">Myth Buster Challenge</h1>
		<p class="text-center text-muted-foreground">
			Test your knowledge by determining if statements are true or false
		</p>

		<div class="mt-2 flex gap-2">
			<Badge variant="outline" class="flex items-center gap-1 bg-primary/5">
				<Trophy class="h-3.5 w-3.5 text-primary" />
				<span class="font-medium">Score: {score}</span>
			</Badge>

			<Badge
				variant="outline"
				class="flex items-center gap-1 {showStreakAnimation
					? 'animate-pulse bg-amber-100'
					: 'bg-primary/5'} transition-all duration-300"
			>
				<Flame class="h-3.5 w-3.5 {showStreakAnimation ? 'text-amber-500' : 'text-primary'}" />
				<span class="font-medium">Streak: {streak} {getStreakEmoji(streak)}</span>
			</Badge>

			<Badge
				variant="outline"
				class="flex items-center gap-1 {showHighScoreMessage
					? 'animate-pulse bg-purple-100'
					: 'bg-primary/5'} transition-all duration-300"
			>
				<Sparkles class="h-3.5 w-3.5 {showHighScoreMessage ? 'text-purple-500' : 'text-primary'}" />
				<span class="font-medium">High Score: {highScore}</span>
			</Badge>
		</div>

		{#if showStreakAnimation && streak >= 3}
			<div class="mt-2 animate-bounce font-bold text-amber-500">
				{#if streak >= 10}
					Amazing streak! 🔥🔥🔥
				{:else if streak >= 5}
					Great streak! 🔥🔥
				{:else}
					Keep it up! 🔥
				{/if}
			</div>
		{/if}

		{#if showHighScoreMessage}
			<div class="mt-2 animate-pulse font-bold text-purple-500">🎉 New High Score! 🎉</div>
		{/if}
	</div>

	<Card.Root class="mb-6 border-2 shadow-lg">
		<Card.Header>
			<Card.Title class="flex items-center justify-center gap-2">
				<Sparkles class="h-5 w-5 text-primary" />
				Test Your Knowledge
			</Card.Title>
			<Card.Description class="text-center">
				Is the statement true or false? How confident are you in your answer?
			</Card.Description>
		</Card.Header>

		<Card.Content class="space-y-6 p-6">
			{#if form?.error}
				<Alert variant="destructive">
					<AlertTriangle class="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{form.error}</AlertDescription>
				</Alert>
			{/if}

			{#if showHighScoreMessage}
				<div class="mt-2 animate-pulse font-bold text-purple-500">🎉 New High Score! 🎉</div>
			{/if}

			<!-- === State 1: Generate a new statement (or show Next button after result) === -->
			{#if !hasStatement || hasResult}
				<form
					method="POST"
					action="?/generate"
					use:enhance={() => {
						isGenerating = true;
						return ({ result, update }) => {
							isGenerating = false;

							// Process form result
							if (result.type === 'success') {
								processFormResult(result.data);
							}

							update({ reset: false });
						};
					}}
				>
					<div class="space-y-4">
						<!-- Hidden inputs to ensure difficulty and category are sent to the backend -->
						<input type="hidden" name="difficulty" value={selectedDifficulty} />
						<input type="hidden" name="category" value={selectedCategory} />

						{#if !hasResult}
							<Tabs.Root value="settings" class="w-full">
								<Tabs.List class="grid w-full grid-cols-2">
									<Tabs.Trigger value="settings">Game Settings</Tabs.Trigger>
									<Tabs.Trigger value="about">About</Tabs.Trigger>
								</Tabs.List>
								<Tabs.Content value="settings" class="space-y-4 pt-4">
									<div class="space-y-2">
										<Label>Difficulty</Label>
										<div class="flex gap-2">
											{#each difficulties as difficulty}
												<Button
													variant={selectedDifficulty === difficulty.value ? 'default' : 'outline'}
													onclick={() => updateDifficulty(difficulty.value)}
													size="sm"
												>
													{difficulty.label}
												</Button>
											{/each}
										</div>
									</div>

									<div class="space-y-2">
										<Label>Category</Label>
										<div class="flex flex-wrap gap-2">
											{#each categories as category}
												<Button
													variant={selectedCategory === category.value ? 'default' : 'outline'}
													onclick={() => updateCategory(category.value)}
													size="sm"
												>
													{category.label}
												</Button>
											{/each}
										</div>
									</div>
								</Tabs.Content>
								<Tabs.Content value="about" class="space-y-4 pt-4">
									<p class="text-sm text-muted-foreground">
										The Myth Buster Challenge tests your ability to identify true and false
										statements. Earn points based on your confidence level when you answer
										correctly.
									</p>
									<p class="text-sm text-muted-foreground">
										The higher your confidence, the more points you'll earn for correct answers.
										Build a streak by answering multiple questions correctly in a row!
									</p>
								</Tabs.Content>
							</Tabs.Root>
						{/if}

						<div class="flex w-full gap-2">
							<Button type="submit" class="flex-1" disabled={isGenerating}>
								{#if isGenerating}
									<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
									Generating...
								{:else if hasResult}
									Next Question
								{:else}
									Generate Statement
								{/if}
							</Button>

							{#if hasResult || hasStatement}
								<AlertDialog.Root>
									<AlertDialog.Trigger>
										<Button
											variant="outline"
											size="icon"
											onclick={() => {
												// Initialize temp values when opening dialog
												tempDifficulty = selectedDifficulty;
												tempCategory = selectedCategory;
											}}
										>
											<Settings class="h-4 w-4" />
										</Button>
									</AlertDialog.Trigger>
									<AlertDialog.Content>
										<AlertDialog.Header>
											<AlertDialog.Title>Game Settings</AlertDialog.Title>
											<AlertDialog.Description>
												Adjust difficulty and category for your next questions. Changes will apply
												after clicking Confirm.
											</AlertDialog.Description>
										</AlertDialog.Header>

										<div class="space-y-4">
											<div class="space-y-2">
												<Label>Difficulty</Label>
												<div class="flex gap-2">
													{#each difficulties as difficulty}
														<Button
															variant={tempDifficulty === difficulty.value ? 'default' : 'outline'}
															onclick={() => (tempDifficulty = difficulty.value)}
															size="sm"
														>
															{difficulty.label}
														</Button>
													{/each}
												</div>
											</div>

											<div class="space-y-2">
												<Label>Category</Label>
												<div class="flex flex-wrap gap-2">
													{#each categories as category}
														<Button
															variant={tempCategory === category.value ? 'default' : 'outline'}
															onclick={() => (tempCategory = category.value)}
															size="sm"
														>
															{category.label}
														</Button>
													{/each}
												</div>
											</div>
										</div>

										<AlertDialog.Footer class="flex justify-between">
											<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
											<AlertDialog.Action
												onclick={() => {
													// Apply changes only when Confirm is clicked
													updateDifficulty(tempDifficulty);
													updateCategory(tempCategory);
												}}
											>
												Confirm
											</AlertDialog.Action>
										</AlertDialog.Footer>
									</AlertDialog.Content>
								</AlertDialog.Root>
							{/if}
						</div>
					</div>
				</form>
			{/if}

			<!-- === State 2: Answer the current statement === -->
			{#if hasStatement && !hasResult && form && isGenerateResult(form)}
				<div>
					<div class="mb-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
						<h2 class="text-center text-xl font-semibold text-primary">"{form.statement}"</h2>
					</div>

					<form
						method="POST"
						action="?/checkAnswer"
						use:enhance={(formEl) => {
							isAnswering = true;
							// Get the button that was clicked
							const submitter = document.activeElement as HTMLButtonElement;
							if (submitter && submitter.name === 'answer') {
								currentAnswer = submitter.value;
							}
							return ({ result, update }) => {
								isAnswering = false;
								currentAnswer = null;

								// Process the answer result (updates score, streak, and animations)
								if (result.type === 'success') {
									processFormResult(result.data);
								}

								update({ reset: false });
							};
						}}
					>
						<input type="hidden" name="statement" value={form.statement || ''} />
						<input
							type="hidden"
							name="isTrue"
							value={form.isTrue !== undefined ? form.isTrue.toString() : 'false'}
						/>
						<input type="hidden" name="explanation" value={form.explanation || ''} />
						<input type="hidden" name="citations" value={JSON.stringify(form.citations || [])} />

						<div class="mb-8 grid gap-3">
							<div class="flex flex-col items-center">
								<div class="w-full max-w-xs space-y-3">
									<Slider type="single" bind:value={confidence} min={1} max={100} step={1} />
									<input type="hidden" name="confidence" value={confidence} />
									<Progress value={confidence} max={100} class="h-2" />
									<div class="flex justify-between text-sm">
										<p class="font-medium">{getConfidenceLabel(confidence)}</p>
										<p class="font-medium {getConfidenceColor(confidence)}">
											{confidence}%
										</p>
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
								class="flex-1 border-2 border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
								size="lg"
								disabled={isAnswering}
							>
								{#if isAnswering && currentAnswer === 'true'}
									<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
								{:else}
									<Check class="mr-2 h-5 w-5" />
								{/if}
								<span class="text-lg font-medium">TRUE</span>
							</Button>

							<Button
								type="submit"
								name="answer"
								value="false"
								variant="outline"
								class="flex-1 border-2 border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
								size="lg"
								disabled={isAnswering}
							>
								{#if isAnswering && currentAnswer === 'false'}
									<RefreshCw class="mr-2 h-5 w-5 animate-spin" />
								{:else}
									<X class="mr-2 h-5 w-5" />
								{/if}
								<span class="text-lg font-medium">FALSE</span>
							</Button>
						</div>
					</form>
				</div>
			{/if}

			<!-- === State 3: Show the result (but not the form to generate new statement) === -->
			{#if hasResult && form && isCheckAnswerResult(form)}
				<div
					class={isCorrect
						? 'rounded-lg border-2 border-emerald-200 bg-emerald-50 p-6 shadow-md'
						: 'rounded-lg border-2 border-red-200 bg-red-50 p-6 shadow-md'}
				>
					<div class="mb-6 flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if isCorrect}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
									<Check class="h-6 w-6 text-emerald-600" />
								</div>
								<p class="text-lg font-semibold text-emerald-800">Correct!</p>
							{:else}
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
									<X class="h-6 w-6 text-red-600" />
								</div>
								<p class="text-lg font-semibold text-red-800">Incorrect!</p>
							{/if}
						</div>

						{#if isCorrect}
							<Badge variant="outline" class="bg-emerald-100 text-emerald-800">
								+{form.points} points
							</Badge>
						{/if}
					</div>

					<div class="mb-6 rounded-md bg-white p-4 shadow-sm">
						<div class="mb-2 flex items-center justify-between">
							<p class="text-sm font-medium text-muted-foreground">
								Your Answer: <span class={form.userAnswer ? 'text-emerald-600' : 'text-red-600'}>
									{form.userAnswer ? 'TRUE' : 'FALSE'}
								</span>
							</p>
							<p class="text-sm font-medium text-muted-foreground">
								Confidence: <span class={getConfidenceColor(confidence)}>{confidence}%</span>
							</p>
						</div>
						<p class="text-lg font-medium text-primary">
							The statement "{form.statement}" is
							<span class={form.isTrue ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>
								{form.isTrue ? 'TRUE' : 'FALSE'}
							</span>
						</p>
					</div>

					<div class="mb-6">
						<h3 class="mb-2 text-base font-semibold">Explanation:</h3>
						<p class="text-muted-foreground">{form.explanation}</p>
					</div>

					{#if citationsArray.length > 0}
						<div class="rounded-md bg-slate-50 p-4">
							<h3 class="mb-2 text-sm font-semibold">Sources:</h3>
							<ul class="list-disc space-y-2 pl-5 text-sm">
								{#each citationsArray as citation}
									<li>
										<a
											href={citation.url || '#'}
											target="_blank"
											rel="noopener noreferrer"
											class="break-words text-primary hover:underline"
										>
											{citation.title || citation.url || 'Source link'}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<div class="flex items-center justify-between px-6 text-center">
		<div>
			<p class="text-lg font-semibold">Score</p>
			<p class="text-2xl font-bold text-primary">{score}</p>
		</div>
		<div>
			<p class="text-lg font-semibold">Streak</p>
			<p class="text-2xl font-bold text-primary">{streak} 🔥</p>
		</div>
	</div>
</div>
