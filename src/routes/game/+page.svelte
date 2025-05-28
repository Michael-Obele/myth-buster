<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import { Progress } from '$lib/components/ui/progress'; // Ensure Progress is imported
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
		Info
	} from '@lucide/svelte';
	import type { PageData } from './$types';
	import { Label } from '$lib/components/ui/label';
	import type {
		GameActionData,
		GenerateActionResult,
		CheckAnswerActionResult,
		Citation
	} from '$lib/game/types';
	import { Confetti } from 'svelte-confetti';
	import { PersistedState } from 'runed';
	import { toast } from 'svelte-sonner';
	import GameAbout from '$lib/game/GameAbout.svelte';
	import * as GameDialog from '$lib/components/ui/dialog/index.js';
	import StreakMessage from '$lib/game/StreakMessage.svelte';
	import HighScoreMessage from '$lib/game/HighScoreMessage.svelte';
	import OopsMessage from '$lib/game/OopsMessage.svelte'; // Import the new component
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	const flame = '/lottie/flame.json';

	// Get props from page data
	let { form: formProp }: { data: PageData; form: GameActionData } = $props();
	let form: GameActionData = $state(formProp);

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
		if (newStreak >= 1) {
			toast.success(StreakMessage, {
				componentProps: { streak: newStreak },
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
	let isGenerating: boolean = $state(false);
	let isAnswering: boolean = $state(false);

	// --- Derived values with Svelte 5 (simplified for random game) ---
	// Type guard functions to safely check form data types
	function isGenerateResult(formData: GameActionData): formData is GenerateActionResult {
		// Check for a property unique to GenerateActionResult if action is not always reliable from server fail states
		return (
			!!formData &&
			(formData.action === 'generate' ||
				(formData.action === undefined &&
					typeof formData.statement === 'string' &&
					(formData as any).result === undefined))
		);
	}

	function isCheckAnswerResult(formData: GameActionData): formData is CheckAnswerActionResult {
		return !!formData && formData.action === 'checkAnswer';
	}

	let hasResult = $derived(!!(form && isCheckAnswerResult(form) && form.result !== undefined));
	let hasStatement = $derived(
		!!(form && isGenerateResult(form) && form.statement !== undefined && form.statement !== '')
	);
	let isCorrect = $derived(!!(form && isCheckAnswerResult(form) && form.result === 'correct'));
	// confidenceLevel was unused

	// Function to check and update high score
	function checkHighScore(newScore: number): boolean {
		if (newScore > highScore) {
			highScore = newScore;
			highScoreState.current = newScore;
			if (newScore > 0) {
				toast.success(HighScoreMessage, {
					componentProps: { highScore: newScore },
					duration: 3500
				});
				console.log('New high score achieved:', newScore);
			}
			return true;
		}
		return false;
	}

	// Helper function to process form results directly
	function processFormResult(formResult: GameActionData) {
		if (!formResult) return;
		// console.log('Processing form result (Random Game):', formResult);

		if (isGenerateResult(formResult)) {
			if (!formResult.success && formResult.error) {
				console.log('Generate action unsuccessful:', formResult.error);
				toast.error(formResult.error);
				return;
			}
			if (formResult.success && typeof formResult.statement === 'string') {
				// Confidence could be reset here
				// updateConfidence(50);
				console.log('New random myth generated.');
			}
		} else if (isCheckAnswerResult(formResult)) {
			if (!formResult.success && formResult.error) {
				console.log('CheckAnswer action unsuccessful:', formResult.error);
				toast.error(formResult.error);
				return;
			}
			// The 'isCheckAnswerResult' type guard already ensures 'points' is a number if 'success' is true.
			if (formResult.success) {
				console.log('Processing answer with points:', formResult.points);
				updateScore(score + formResult.points);

				if (formResult.result === 'correct') {
					console.log('Correct answer, updating streak');
					updateStreak(streak + 1);
				} else {
					console.log('Incorrect answer, resetting streak');
					updateStreak(0);
					// Show toast notification for incorrect answer
					toast.error(`That's not quite right! You lost ${Math.abs(formResult.points)} points.`, {
						// More constructive message
						duration: 3000
					});
					// Show secondary "Oops!" message using custom component
					toast(OopsMessage, {
						duration: 3500 // Same duration as the main message
					});
				}
			}
		}
	}

	// Parse citations from form data
	let citationsArray: Citation[] = $derived.by(() => {
		if (!form) return [];

		// Access citations safely based on action type
		if (isGenerateResult(form) && form.citations) {
			return Array.isArray(form.citations) ? form.citations : [];
		}
		if (isCheckAnswerResult(form) && form.citations) {
			return Array.isArray(form.citations) ? form.citations : [];
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
		if (streak >= 10) return 'primary:#f59e0b,secondary:#f59e0b'; // amber-500
		if (streak >= 5) return 'primary:#f97316,secondary:#f97316'; // orange-500
		if (streak >= 1) return 'primary:#eab308,secondary:#eab308'; // yellow-500
		return 'primary:#10B981,secondary:#10b981'; // Default color
	}

	// onMount is no longer needed here for track loading

	// --- Form Submit Handlers ---
	const handleGenerateSubmit: SubmitFunction = () => {
		isGenerating = true;
		return async ({ result, update }) => {
			isGenerating = false;
			if (
				result.type === 'success' &&
				result.data &&
				typeof result.data === 'object' &&
				'action' in result.data &&
				(result.data as any).action === 'generate'
			) {
				form = result.data as unknown as GenerateActionResult;
			} else if (result.type === 'error') {
				const errorMessage = result.error.message || 'Failed to generate statement.';
				// toast.error(errorMessage); // Toast will be handled by processFormResult
				form = {
					success: false,
					error: errorMessage,
					action: 'generate',
					statement: '',
					isTrue: false,
					explanation: '',
					citations: []
				} as GenerateActionResult;
			} else if (
				result.type === 'failure' &&
				result.data &&
				typeof result.data === 'object' &&
				'action' in result.data &&
				(result.data as any).action === 'generate'
			) {
				form = result.data as unknown as GenerateActionResult; // Server fail for generate provides this structure
			} else if (result.type === 'failure' && result.data && typeof result.data === 'object') {
				const errorMessage =
					(result.data as { error?: string }).error ||
					'Failed to generate statement due to server error.';
				form = {
					success: false,
					error: errorMessage,
					action: 'generate',
					statement: '',
					isTrue: false,
					explanation: '',
					citations: []
				} as GenerateActionResult;
			} else if (result.type === 'failure') {
				// General failure with no specific data
				form = {
					success: false,
					error: 'Unexpected server error',
					action: 'generate',
					statement: '',
					isTrue: false,
					explanation: '',
					citations: []
				} as GenerateActionResult;
			}

			if (form) {
				// Process the form state, whether success or error
				processFormResult(form);
			}
			await update({ reset: false });
		};
	};

	const handleAnswerSubmit: SubmitFunction = () => {
		// formEl parameter removed as it was unused
		isAnswering = true;

		return async ({ result, update }) => {
			isAnswering = false;
			currentAnswer = null;

			if (
				result.type === 'success' &&
				result.data &&
				typeof result.data === 'object' &&
				'action' in result.data &&
				(result.data as any).action === 'checkAnswer'
			) {
				form = result.data as unknown as CheckAnswerActionResult;
			} else if (result.type === 'error') {
				const errorMessage = result.error.message || 'Failed to check answer.';
				form = {
					success: false,
					error: errorMessage,
					action: 'checkAnswer',
					statement: '',
					isTrue: false,
					explanation: '',
					citations: [],
					result: 'incorrect',
					points: 0,
					userAnswer: false
				} as CheckAnswerActionResult;
			} else if (
				result.type === 'failure' &&
				result.data &&
				typeof result.data === 'object' &&
				'action' in result.data &&
				(result.data as any).action === 'checkAnswer'
			) {
				// Server fail for checkAnswer is minimal, so reconstruct a full error object for client side
				const serverError =
					(result.data as { error?: string }).error ||
					'Failed to process answer due to a server issue.';
				form = {
					success: false,
					error: serverError,
					action: 'checkAnswer',
					statement: '',
					isTrue: false,
					explanation: '',
					citations: [],
					result: 'incorrect',
					points: 0,
					userAnswer: false
				} as CheckAnswerActionResult;
			} else if (result.type === 'failure' && result.data && typeof result.data === 'object') {
				// Failure data without 'action', assume context from current form action
				const errorMessage =
					(result.data as { error?: string }).error ||
					'Failed to check answer due to server error.';
				form = {
					success: false,
					error: errorMessage,
					action: 'checkAnswer',
					statement: '',
					isTrue: false,
					explanation: '',
					citations: [],
					result: 'incorrect',
					points: 0,
					userAnswer: false
				} as CheckAnswerActionResult;
			} else if (result.type === 'failure') {
				// General failure with no specific data
				form = {
					success: false,
					error: 'Unexpected server error while checking answer.',
					action: 'checkAnswer',
					statement: '',
					isTrue: false,
					explanation: '',
					citations: [],
					result: 'incorrect',
					points: 0,
					userAnswer: false
				} as CheckAnswerActionResult;
			}

			if (form) {
				// Process the form state, whether success or error
				processFormResult(form);
			}
			await update({ reset: false });
		};
	};
</script>

<!-- Svelte Confetti effect for correct answers -->
{#if isCorrect}
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
		<p class="text-muted-foreground text-center">
			Test your knowledge by determining if statements are true or false
		</p>

		<div class="mt-2 flex gap-2">
			<Badge variant="outline" class="bg-primary/5 flex items-center gap-1">
				<Trophy class="text-primary h-3.5 w-3.5" />
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
				<Sparkles class="text-primary h-6 w-6" />
				Test Your Knowledge

				<GameDialog.Root>
					<GameDialog.Trigger>
						<Info />
					</GameDialog.Trigger>
					<GameDialog.Content>
						<GameAbout />
					</GameDialog.Content>
				</GameDialog.Root>
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
				<form method="POST" action="?/generate" use:enhance={handleGenerateSubmit}>
					<div class="space-y-4">
						<!-- Hidden inputs for difficulty, category -->
						<input type="hidden" name="difficulty" value={selectedDifficulty} />
						<input type="hidden" name="category" value={selectedCategory} />

						{#if !hasResult}
							<!-- Only show settings if no result -->
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
								<!-- Show settings dropdown if there's a statement or result -->
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
										onclick={() => {
											// Initialize temp values when opening dropdown
											console.log('Settings dropdown opened');
											tempDifficulty = selectedDifficulty;
											tempCategory = selectedCategory;
										}}
									>
										<Settings class="h-4 w-4" />
										<span class="sr-only">Open Settings</span>
									</DropdownMenu.Trigger>
									<DropdownMenu.Content class="bg-card text-primary w-64">
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
															class={tempDifficulty === difficulty.value
																? 'bg-green-300 text-black'
																: '' + 'bg-background '}
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
															class={tempCategory === category.value
																? 'bg-green-300 text-black'
																: '' + 'bg-background '}
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
						<div class="mt-4 text-center">
							<Button href="/tracks" variant="link" class="text-primary text-sm hover:underline">
								Explore Learning Tracks →
							</Button>
						</div>
					</div>
				</form>
			{:else if hasStatement && !hasResult && form && isGenerateResult(form)}
				<div>
					<div class="bg-card text-card-foreground mb-6 rounded-lg border p-4 shadow-sm">
						<h2 class="text-primary text-center text-xl font-semibold">"{form.statement}"</h2>
					</div>
					<form method="POST" action="?/checkAnswer" use:enhance={handleAnswerSubmit}>
						<input
							type="hidden"
							name="statement"
							value={(form as GenerateActionResult).statement || ''}
						/>
						<input
							type="hidden"
							name="isTrue"
							value={(form as GenerateActionResult).isTrue !== undefined
								? (form as GenerateActionResult).isTrue.toString()
								: 'false'}
						/>
						<input
							type="hidden"
							name="explanation"
							value={(form as GenerateActionResult).explanation || ''}
						/>
						<input type="hidden" name="citations" value={JSON.stringify(citationsArray || [])} />
						<!-- No track-specific hidden inputs needed here anymore -->

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
								class="flex-1 border-2 border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-500"
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
								class="flex-1 border-2 border-red-500 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-500"
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
			{#if hasResult && isCheckAnswerResult(form)}
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
								Your Answer: <span
									class={isCheckAnswerResult(form) && form.userAnswer
										? 'text-emerald-400'
										: 'text-red-400'}
								>
									{isCheckAnswerResult(form) ? (form.userAnswer ? 'TRUE' : 'FALSE') : ''}
								</span>
							</p>
							<p class="text-sm font-medium text-slate-300">
								Confidence: <span class={getConfidenceColor(confidence)}>{confidence}%</span>
							</p>
						</div>
						<p class="text-lg font-medium text-slate-100">
							The statement "{(form as CheckAnswerActionResult).statement ||
								(form as GenerateActionResult).statement ||
								''}" is
							<span
								class={(form as CheckAnswerActionResult).isTrue ||
								(form as GenerateActionResult).isTrue
									? 'font-bold text-emerald-400'
									: 'font-bold text-red-400'}
							>
								{(form as CheckAnswerActionResult).isTrue || (form as GenerateActionResult).isTrue
									? 'TRUE'
									: 'FALSE'}
							</span>
						</p>
					</div>

					<div class="mb-6">
						<h3 class="mb-2 text-base font-semibold text-slate-200">Explanation:</h3>
						<p class="text-slate-300">
							{isCheckAnswerResult(form)
								? (form as CheckAnswerActionResult).explanation
								: isGenerateResult(form)
									? (form as GenerateActionResult).explanation
									: ''}
						</p>
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
			<p class="text-primary text-2xl font-bold">{score}</p>
		</div>
		<div>
			<p class="text-lg font-semibold">Streak</p>
			<p class="flex items-center gap-1 text-2xl font-bold">
				<span>{streak}</span>
				{#if streak > 0}
					<span class="flex">
						{#each Array(getStreakCount(streak))}
							<LordIcon src={flame} colors={getStreakColor(streak)} class={`size-6`} />
						{/each}
					</span>
				{/if}
			</p>
		</div>
	</div>
</div>
