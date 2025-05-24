<script lang="ts">
	import { Trophy, Sparkles } from 'lucide-svelte';
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';

	interface Props {
		highScore: number;
	}

	let { highScore }: Props = $props();
</script>

<div class="flex h-fit items-center justify-center gap-2 rounded-md px-1 text-[1.1rem]">
	<p class="text-[1rem] text-white">New High Score: {highScore}!</p>
	<LordIcon
		src="https://cdn.lordicon.com/gqjpawbc.json"
		colors="primary:#a855f7,secondary:#f59e0b"
		mobileLoop={false}
		class={`relative -top-2 size-8`}
	/>
</div>
