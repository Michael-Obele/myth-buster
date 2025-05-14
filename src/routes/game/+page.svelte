<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { Progress } from '$lib/components/ui/progress';
	import { Separator } from '$lib/components/ui/separator';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
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
		Settings,
		ChevronDown
	} from 'lucide-svelte';
	import { onMount, onDestroy } from 'svelte';
	import type { PageProps, ActionData } from './$types';
	import { Label } from '$lib/components/ui/label';
	import { Confetti } from 'svelte-confetti';
	import { PersistedState } from 'runed';
	import { toast } from 'svelte-sonner';
	import GameAbout from './GameAbout.svelte';
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

	// Use PersistedState for values we want to persist across sessions
	const scoreState = new PersistedState('mythBusterScore', 0);
	const highScoreState = new PersistedState('mythBusterHighScore', 0);
	const streakState = new PersistedState('mythBusterStreak', 0);
	const categoryState = new PersistedState('mythBusterCategory', 'general');
	const difficultyState = new PersistedState('mythBusterDifficulty', 'medium');
	const confidenceState = new PersistedState('mythBusterConfidence', 50);

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
	let confidence = $state(confidenceState.current);

	// When changing any of these values, we'll persist them
	function updateScore(newScore: number) {
		score = newScore;
		scoreState.current = newScore;
		console.log('Score updated:', newScore);
		checkHighScore(newScore);
	}

	function updateStreak(newStreak: number) {
		streak = newStreak;
		streakState.current = newStreak;
		console.log('Streak updated:', newStreak);

		// Show streak notification for streaks of 3 or more
		if (newStreak >= 3) {
			let message = 'Keep it up! 🔥';
			if (newStreak >= 10) {
				message = 'Amazing streak! 🔥🔥🔥';
			} else if (newStreak >= 5) {
				message = 'Great streak! 🔥🔥';
			}

			toast.success(message, {
				duration: 3000
			});
		}
	}

	function updateCategory(newCategory: string) {
		selectedCategory = newCategory;
		categoryState.current = newCategory;
		console.log('Category updated:', newCategory);
	}

	function updateDifficulty(newDifficulty: string) {
		selectedDifficulty = newDifficulty;
		difficultyState.current = newDifficulty;
		console.log('Difficulty updated:', newDifficulty);
	}

	function updateConfidence(newValue: number) {
		confidence = newValue;
		confidenceState.current = newValue;
		console.log('Confidence updated:', newValue);
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
	function checkHighScore(newScore: number): boolean {
		if (newScore > highScore) {
			highScore = newScore;
			highScoreState.current = newScore;
			if (newScore > 0) {
				toast.success('🎉 New High Score! 🎉', {
					duration: 3000
				});
				console.log('New high score achieved:', newScore);
			}
			return true;
		}
		return false;
	}

	// Helper function to process form results directly
	function processFormResult(formResult: any) {
		console.log('Processing form result:', formResult);
		if (!formResult?.success) {
			console.log('Form result unsuccessful');
			return;
		}

		// Handle answer results with points
		if (formResult.points && typeof formResult.points === 'number') {
			console.log('Processing answer with points:', formResult.points);
			// Update score
			updateScore(score + formResult.points);

			// Update streak for correct answers
			if (formResult.result === 'correct') {
				console.log('Correct answer, updating streak');
				updateStreak(streak + 1);
			} else {
				// Reset streak on wrong answers
				console.log('Incorrect answer, resetting streak');
				updateStreak(0);
			}
		} else if (formResult.statement && !formResult.result) {
			// Reset confidence for new statements
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

	function getStreakCount(streak: number): number {
		if (streak >= 10) return 3;
		if (streak >= 5) return 2;
		if (streak >= 1) return 1;
		return 0;
	}

	function getStreakColor(streak: number): string {
		if (streak >= 10) return 'text-amber-500';
		if (streak >= 5) return 'text-orange-500';
		if (streak >= 1) return 'text-yellow-500';
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
				<span class="font-medium">Streak: {streak} </span>
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

		<!-- Streak and high score notifications now handled by toast -->
	</div>

	<Card.Root class="mb-6 border-2 shadow-lg">
		<Card.Header class="px-6 py-5">
			<Card.Title class="flex items-center justify-center gap-2 text-2xl font-bold">
				<Sparkles class="h-6 w-6 text-primary" />
				Test Your Knowledge
			</Card.Title>
			<Card.Description class="mt-2 text-center text-base font-medium">
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

			<!-- High score notifications now handled by toast -->

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
								<Tabs.Content value="about" class="pt-4">
									<GameAbout />
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
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										<Button
											variant="outline"
											size="icon"
											onclick={() => {
												// Initialize temp values when opening dropdown
												console.log('Settings dropdown opened');
												tempDifficulty = selectedDifficulty;
												tempCategory = selectedCategory;
											}}
										>
											<Settings class="h-4 w-4" />
										</Button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content class="w-64 bg-card text-primary">
										<DropdownMenu.Label>Game Settings</DropdownMenu.Label>
										<DropdownMenu.Separator />

										<div class="space-y-4 p-2">
											<div class="space-y-2">
												<Label>Difficulty</Label>
												<div class="flex space-x-2">
													{#each difficulties as difficulty}
														<Button
															variant={tempDifficulty === difficulty.value ? 'default' : 'outline'}
															onclick={() => {
																console.log(`Difficulty changed to ${difficulty.value}`);
																tempDifficulty = difficulty.value;
															}}
															size="sm"
															class="bg-background"
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
															onclick={() => {
																console.log(`Category changed to ${category.value}`);
																tempCategory = category.value;
															}}
															size="sm"
															class="bg-background"
														>
															{category.label}
														</Button>
													{/each}
												</div>
											</div>
										</div>

										<DropdownMenu.Separator />
										<DropdownMenu.Item
											onclick={() => {
												console.log('Settings applied:', { tempDifficulty, tempCategory });
												// Apply changes
												updateDifficulty(tempDifficulty);
												updateCategory(tempCategory);
												toast.success('Settings updated successfully');
											}}
										>
											Apply Settings
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
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
									<!-- onValueChange={updateConfidence} -->
									<Slider
										type="single"
										bind:value={confidence}
										onValueCommit={(v) => {
											console.log('user is done sliding!', v);
											updateConfidence(v);
										}}
										min={1}
										max={100}
										step={1}
									/>
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
						? 'rounded-lg border-2 border-emerald-700/30 bg-emerald-950/20 p-6 shadow-md'
						: 'rounded-lg border-2 border-red-700/30 bg-red-950/20 p-6 shadow-md'}
				>
					<div class="mb-6 flex items-center justify-between">
						<div class="flex items-center gap-2">
							{#if isCorrect}
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

						{#if isCorrect}
							<Badge
								variant="outline"
								class="border-emerald-700/50 bg-emerald-800/30 text-emerald-400"
							>
								+{form.points} points
							</Badge>
						{/if}
					</div>

					<div class="mb-6 rounded-md border border-slate-700/50 bg-slate-900/60 p-4 shadow-sm">
						<div class="mb-2 flex items-center justify-between">
							<p class="text-sm font-medium text-slate-300">
								Your Answer: <span class={form.userAnswer ? 'text-emerald-400' : 'text-red-400'}>
									{form.userAnswer ? 'TRUE' : 'FALSE'}
								</span>
							</p>
							<p class="text-sm font-medium text-slate-300">
								Confidence: <span class={getConfidenceColor(confidence)}>{confidence}%</span>
							</p>
						</div>
						<p class="text-lg font-medium text-slate-100">
							The statement "{form.statement}" is
							<span class={form.isTrue ? 'font-bold text-emerald-400' : 'font-bold text-red-400'}>
								{form.isTrue ? 'TRUE' : 'FALSE'}
							</span>
						</p>
					</div>

					<div class="mb-6">
						<h3 class="mb-2 text-base font-semibold text-slate-200">Explanation:</h3>
						<p class="text-slate-300">{form.explanation}</p>
					</div>

					{#if citationsArray.length > 0}
						<div class="rounded-md border border-slate-700/50 bg-slate-800/50 p-4">
							<h3 class="mb-2 text-sm font-semibold text-slate-200">Sources:</h3>
							<ul class="list-disc space-y-2 pl-5 text-sm">
								{#each citationsArray as citation}
									<li>
										<a
											href={citation.url || '#'}
											target="_blank"
											rel="noopener noreferrer"
											class="break-words text-blue-400 hover:underline"
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
			<p class="flex items-center gap-1 text-2xl font-bold">
				<span>{streak}</span>
				{#if streak > 0}
					<span class="flex">
						{#each Array(getStreakCount(streak)) as _}
							<Flame class="h-5 w-5 {getStreakColor(streak)}" />
						{/each}
					</span>
				{/if}
			</p>
		</div>
	</div>
</div>
