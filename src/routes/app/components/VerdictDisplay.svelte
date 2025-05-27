<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'svelte-motion';
	import { Check, X, HelpCircle, Share2 } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import ShareOptions from './ShareOptions.svelte';

	const wrong = '/lottie/wrong.json';
	const right = '/lottie/right.json';
	const unsure = '/lottie/unsure.json';

	// Props using Svelte 5 syntax
	let {
		verdict = '',
		myth = '',
		explanation = ''
	}: {
		verdict: string;
		myth: string | undefined;
		explanation: string;
	} = $props();

	type TriggerType =
		| 'in'
		| 'click'
		| 'hover'
		| 'loop'
		| 'loop-on-hover'
		| 'morph'
		| 'boomerang'
		| 'sequence';

	// Derived values for verdict styling
	let verdictColor = $derived(() => {
		switch (verdict) {
			case 'true':
				return 'bg-emerald-500';
			case 'false':
				return 'bg-red-500';
			default:
				return 'bg-purple-500';
		}
	});

	let verdictGradient = $derived(() => {
		switch (verdict) {
			case 'true':
				return 'from-emerald-600/20 to-emerald-400/10';
			case 'false':
				return 'from-red-600/20 to-red-400/10';
			default:
				return 'from-purple-600/20 to-purple-400/10';
		}
	});

	let verdictText = $derived(() => {
		switch (verdict) {
			case 'true':
				return 'Mostly True';
			case 'false':
				return 'Mostly False';
			default:
				return 'Inconclusive';
		}
	});

	let iconState = $state({
		true: 'morph-up',
		false: 'in-reveal'
	});

	let iconTrigger: TriggerType = $state('in');

	onMount(() => {
		setTimeout(() => {
			iconState.true = 'hover-up';
			iconState.false = 'hover-down';
			iconTrigger = 'loop';
		}, 1500);
	});
</script>

<div class="space-y-4">
	<div class="rounded-lg border border-primary/20 bg-gradient-to-br {verdictGradient} p-6">
		<div class="mb-4 flex w-full items-center gap-3 px-14">
			<div
				class="mx-4 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg {verdictColor}"
			>
				{#if verdict === 'true'}
					<LordIcon
						src={wrong}
						state={iconState.true}
						trigger={iconTrigger}
						stroke="thick"
						colors="primary:#10B981,secondary:#10b981"
						class="size-8 shrink-0 md:block md:size-12"
					/>
				{:else if verdict === 'false'}
					<LordIcon
						src={wrong}
						trigger="loop"
						state={iconState.false}
						stroke="thick"
						target="#hero"
						colors="primary:#10B981,secondary:#10b981"
						class="size-8 shrink-0 md:block md:size-12"
					/>
				{:else}
					<LordIcon
						src={unsure}
						trigger="loop"
						stroke="thick"
						target="#hero"
						colors="primary:#10B981,secondary:#10b981"
						class="size-8 shrink-0 md:block md:size-12"
					/>
				{/if}
			</div>
			<h2 class="text-3xl font-bold text-white">
				{verdictText()}
			</h2>
		</div>

		<!-- Removed for now -->
		<!-- <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
			<div class="flex items-center gap-2">
				<ShareOptions {verdict} {myth} {explanation} />
			</div>
		</div> -->
	</div>

	<div>
		<h3 class="mb-2 font-medium text-muted-foreground">Myth that was analyzed</h3>
		<div class="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm">
			{myth}
		</div>
	</div>
</div>
