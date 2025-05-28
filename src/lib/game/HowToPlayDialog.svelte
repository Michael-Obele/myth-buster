<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		Info,
		Target,
		Settings as SettingsIcon,
		CheckCircle,
		XCircle,
		TrendingUp,
		FileText,
		VenetianMask,
		GraduationCap,
		Wand2
	} from '@lucide/svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const sections = [
		{
			value: 'objective',
			title: 'Game Objective',
			icon: Target,
			content: [
				'The main goal of Myth Buster Challenge is to test your knowledge by determining if statements presented to you are TRUE or FALSE.',
				'Challenge common assumptions and learn interesting facts backed by evidence!'
			]
		},
		{
			value: 'generating',
			title: 'Starting a Round',
			icon: Wand2,
			content: [
				'To begin, you can select a preferred "Difficulty" (Easy, Medium, Hard) and "Category" (e.g., Science, History).',
				'Once you\'ve set your preferences, click the "Generate Statement" button.',
				'A new myth or fact will be presented to you.'
			]
		},
		{
			value: 'confidence',
			title: 'Setting Your Confidence',
			icon: VenetianMask,
			content: [
				'Before answering, use the "Confidence Slider" to indicate how sure you are about your answer (from 1% to 100%).',
				'Your confidence level directly impacts your potential score for that round.'
			]
		},
		{
			value: 'answering',
			title: 'Answering the Statement',
			icon: CheckCircle, // Could also use XCircle here, or a generic "gamepad" icon
			content: [
				'After setting your confidence, evaluate the statement.',
				'Click the "TRUE" button if you believe the statement is correct.',
				'Click the "FALSE" button if you believe the statement is incorrect.'
			]
		},
		{
			value: 'scoring',
			title: 'Scoring System',
			icon: TrendingUp,
			content: [
				'<strong>Correct Answer:</strong> If your answer is correct, you will gain points equal to your set confidence level (e.g., 75% confidence = +75 points).',
				'<strong>Incorrect Answer:</strong> If your answer is incorrect, you will lose points equal to your set confidence level (e.g., 75% confidence = -75 points). Be careful with high confidence on wrong answers!',
				'<strong>Streaks:</strong> Answering correctly multiple times in a row builds up your "Streak". Keep it going for bragging rights!'
			]
		},
		{
			value: 'learning',
			title: 'Learning & Verification',
			icon: FileText,
			content: [
				'After you submit your answer, the game will reveal if you were correct or incorrect.',
				'A detailed "Explanation" for the statement will be provided.',
				'You can also review the "Sources" (citations) used to verify the statement. Click on them to explore the evidence yourself.'
			]
		},
		{
			value: 'settings',
			title: 'Game Settings',
			icon: SettingsIcon,
			content: [
				'During the game (after a statement is generated or a result is shown), you can change the "Difficulty" and "Category" for the *next* question by clicking the settings icon (cogwheel).',
				'This allows you to tailor the game to your preferences as you play.'
			]
		},
		{
			value: 'tracks',
			title: 'Learning Tracks',
			icon: GraduationCap,
			content: [
				'Want a more guided experience? Click the "Explore Learning Tracks →" link.',
				'Learning Tracks group myths around specific themes or topics for focused learning.'
			]
		}
	];

	function handleTriggerClick() {
		open = true;
	}

	// This effect ensures that if the dialog is closed by means other than the explicit close button
	// (e.g., Escape key, clicking outside), the `open` prop is correctly updated.
	// However, Dialog.Root's two-way binding with `bind:open` should handle this.
	// We also need to make sure that when `open` becomes false, it is reflected.
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		<Button
			onclick={handleTriggerClick}
			variant="outline"
			size="icon"
			class="h-8 w-8"
			aria-label="How to Play"
		>
			<Info class="h-4 w-4" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="text-foreground sm:max-w-[650px]">
		<Dialog.Header>
			<Dialog.Title class="text-center text-2xl font-bold">How to Play Myth Buster</Dialog.Title>
			<Dialog.Description class="text-center">
				Welcome! Here's a quick guide to get you started on your myth-busting journey.
			</Dialog.Description>
		</Dialog.Header>

		<ScrollArea class="h-[60vh] rounded-md p-1 pr-4">
			<Accordion.Root type="multiple" class="w-full">
				{#each sections as section (section.value)}
					{@const Icon = section.icon}
					<Accordion.Item value={section.value}>
						<Accordion.Trigger class="text-lg hover:no-underline">
							<div class="flex items-center gap-2">
								<Icon class="text-primary h-5 w-5" />
								{section.title}
							</div>
						</Accordion.Trigger>
						<Accordion.Content class="space-y-2 pl-2 text-base">
							{#each section.content as point}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								<p>{@html point}</p>
							{/each}
						</Accordion.Content>
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</ScrollArea>

		<Dialog.Footer class="mt-4">
			<Dialog.Close>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Got it!</Button>
			</Dialog.Close>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
