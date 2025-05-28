<script lang="ts">
	import LordIcon from '$lib/components/blocks/LordIcon.svelte';
	const skull = '/lottie/skull.json';
</script>

<div
	class="flex h-fit items-center justify-center gap-2 rounded-md px-1 text-center text-[1.1rem] text-white"
>
	<LordIcon src={skull} colors="primary:#EF4444,secondary:#FCD34D" class={`relative size-8`} />
	<p class="text-sm font-bold text-white">Nope! That was a wrong!</p>
</div>
