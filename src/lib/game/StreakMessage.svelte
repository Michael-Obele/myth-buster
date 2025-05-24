<script lang="ts">
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	import { Flame, CheckCircle2 } from 'lucide-svelte';

	const flame = '/lottie/flame.json';
	interface Props {
		streak: number;
	}

	let { streak }: Props = $props();

	let messageText = $derived.by(() => {
		// Renamed to avoid conflict with any potential 'message' prop from toast
		if (streak >= 10) {
			return 'Amazing streak!';
		} else if (streak >= 5) {
			return 'Great streak!';
		} else if (streak >= 1) {
			return 'Keep it up!';
		}
		return '';
	});
	const flameCount = $derived.by(() => {
		if (streak >= 10) {
			return 3;
		} else if (streak >= 5) {
			return 2;
		} else if (streak >= 1) {
			return 1;
		}
		return 0;
	});

	const flameColors = $derived(() => {
		if (streak >= 10) return 'primary:#f59e0b,secondary:#f59e0b'; // amber-500
		if (streak >= 5) return 'primary:#f97316,secondary:#f97316'; // orange-500
		if (streak >= 1) return 'primary:#eab308,secondary:#eab308'; // yellow-500
		return 'primary:#10B981,secondary:#10b981'; // Default color
	});

	const textColorClass = $derived(() => {
		if (streak >= 10) return 'text-amber-500';
		if (streak >= 5) return 'text-orange-500';
		if (streak >= 1) return 'text-yellow-500';
		return 'text-white'; // Default color
	});

	const flames = $derived(Array.from({ length: flameCount }));
</script>

<!-- Basic styling to mimic a success toast, adjust as needed -->
<div class="flex h-fit items-center gap-2 rounded-md px-1 text-[1.1rem] text-green-700">
	<!-- <CheckCircle2 class="h-5 w-5 text-green-500" /> -->
	<p class={textColorClass()}>{messageText}</p>
	{#each flames}
		<LordIcon
			src={flame}
			trigger="loop"
			stroke="thick"
			colors={flameColors()}
			mobileLoop={false}
			class={`size-6`}
		/>
	{/each}
</div>
