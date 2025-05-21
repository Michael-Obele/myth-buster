<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from "$lib/components/ui/card/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Progress from "$lib/components/ui/progress/index.js";
	import CheckIcon from "@lucide/svelte/icons/check";
	import XIcon from "@lucide/svelte/icons/x";
	import { fly, fade } from 'svelte/transition';
	
	// Sample myths array
	const myths = [
		{
			statement: "Humans only use 10% of their brains.",
			verdict: false,
			explanation: "We use all parts of our brain, though not all at the same time. Different activities engage different areas of the brain. This myth likely originated from early neuroscience research that was misinterpreted in popular culture."
		},
		{
			statement: "Lightning never strikes the same place twice.",
			verdict: false,
			explanation: "Lightning can and does strike the same place multiple times. Tall structures like the Empire State Building are struck numerous times each year. This myth likely started as a way to comfort people during thunderstorms."
		},
		{
			statement: "Dogs can only see in black and white.",
			verdict: false,
			explanation: "Dogs can see colors, but their color perception is more limited than humans. They can see blue and yellow wavelengths, but have difficulty distinguishing red and green, similar to red-green color blindness in humans."
		},
		{
			statement: "Eating carrots improves your night vision.",
			verdict: false,
			explanation: "While carrots contain vitamin A which is important for eye health, eating extra carrots won't improve vision beyond normal levels. This myth was propagated during WWII by the British to hide their radar technology from the Germans."
		},
		{
			statement: "Mount Everest is the tallest mountain on Earth.",
			verdict: true,
			explanation: "Mount Everest is indeed the tallest mountain above sea level at 29,032 feet (8,849 meters). However, if measured from base to peak, Mauna Kea in Hawaii is taller, and if measured from the center of Earth, Chimborazo in Ecuador extends furthest due to Earth's equatorial bulge."
		}
	];

	let currentMythIndex = $state(0);
	let selectedAnswer = $state<boolean | null>(null);
	let showExplanation = $state(false);
	let isAnimating = $state(false);
	let progressValue = $state(0);
	
	// Function to handle user's answer
	function handleAnswer(answer: boolean) {
		if (isAnimating || selectedAnswer !== null) return;
		
		selectedAnswer = answer;
		showExplanation = true;
	}
	
	// Function to move to the next myth
	function nextMyth() {
		isAnimating = true;
		showExplanation = false;
		selectedAnswer = null;
		
		// Update the current myth index
		if (currentMythIndex < myths.length - 1) {
			currentMythIndex++;
		} else {
			currentMythIndex = 0;
		}
		
		// Reset animation state after a delay
		setTimeout(() => {
			isAnimating = false;
		}, 500);
	}
	
	// Automatically update progress value when current myth changes
	$effect(() => {
		progressValue = ((currentMythIndex + 1) / myths.length) * 100;
	});
	
	// Get current myth
	const currentMyth = $derived(myths[currentMythIndex]);
	
	// Determine if user was correct
	const isCorrect = $derived(selectedAnswer !== null && selectedAnswer === currentMyth.verdict);
</script>

<Card.Root class="w-full max-w-2xl mx-auto my-12 overflow-hidden">
	<Card.Header class="pb-0">
		<Card.Title class="text-center text-xl sm:text-2xl">Mini-Myth Quick Check</Card.Title>
		<Card.Description class="text-center mb-2">Test your knowledge: Is this statement true or false?</Card.Description>
	</Card.Header>
	
	<Card.Content class="pt-0">
		<!-- Progress indicator -->
		<div class="w-full mt-2 mb-4">
			<Progress.Root value={progressValue} class="h-2">
				<Progress.Indicator
					style="transform: translateX(-{100 - progressValue}%)"
					class="h-full transition-transform duration-500 ease-in-out"
				/>
			</Progress.Root>
			<p class="text-xs text-right mt-1 text-muted-foreground">Myth {currentMythIndex + 1} of {myths.length}</p>
		</div>
		
		<!-- Myth statement -->
		<div class="min-h-20 flex items-center justify-center my-6">
			{#key currentMythIndex}
				<p 
					class="text-lg sm:text-xl text-center font-medium" 
					in:fly={{ y: 20, duration: 400, delay: 200 }}
					out:fade={{ duration: 200 }}
				>
					{currentMyth.statement}
				</p>
			{/key}
		</div>
		
		<!-- True/False buttons -->
		<div class="flex justify-center gap-4 my-4">
			<Button 
				variant={selectedAnswer === true ? (currentMyth.verdict === true ? "default" : "destructive") : "outline"} 
				size="lg"
				onclick={() => handleAnswer(true)}
				disabled={selectedAnswer !== null}
				class={selectedAnswer === true && currentMyth.verdict === true ? "bg-green-600 hover:bg-green-700" : ""}
			>
				{#if selectedAnswer === true && currentMyth.verdict === true}
					<CheckIcon />
				{/if}
				True
			</Button>
			
			<Button 
				variant={selectedAnswer === false ? (currentMyth.verdict === false ? "default" : "destructive") : "outline"} 
				size="lg"
				onclick={() => handleAnswer(false)}
				disabled={selectedAnswer !== null}
				class={selectedAnswer === false && currentMyth.verdict === false ? "bg-green-600 hover:bg-green-700" : ""}
			>
				{#if selectedAnswer === false && currentMyth.verdict === false}
					<CheckIcon />
				{/if}
				False
			</Button>
		</div>
		
		<!-- Explanation section -->
		{#if showExplanation}
			<div 
				class="mt-6 p-4 rounded-md bg-accent text-accent-foreground"
				in:fly={{ y: 10, duration: 300 }}
			>
				<div class="flex items-center gap-2 mb-2">
					{#if isCorrect}
						<div class="p-1 rounded-full bg-green-600 text-white">
							<CheckIcon size={16} />
						</div>
						<p class="font-medium">Correct!</p>
					{:else}
						<div class="p-1 rounded-full bg-destructive text-destructive-foreground">
							<XIcon size={16} />
						</div>
						<p class="font-medium">Not quite.</p>
					{/if}
				</div>
				<p>{currentMyth.explanation}</p>
				<div class="flex justify-end mt-4">
					<Button onclick={nextMyth}>Next Myth</Button>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>