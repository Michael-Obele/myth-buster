<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Button } from '$lib/components/ui/button';
	import { LucideEye, LucideEyeOff } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import { Input } from '$lib/components/ui/input/index.js';

	let { class: className, value = $bindable(), ...restProps }: HTMLInputAttributes = $props();

	let showPassword = $state(false);

	function togglePassword() {
		showPassword = !showPassword;
	}
</script>

<div class="relative">
	<Input
		bind:value
		type={showPassword ? 'text' : 'password'}
		class={cn('w-full pr-10', className)}
	/>
	<Button
		variant="ghost"
		size="icon"
		class="absolute right-2 top-1/2 -translate-y-1/2"
		onclick={togglePassword}
	>
		{#if showPassword}
			<LucideEyeOff class="h-4 w-4" />
		{:else}
			<LucideEye class="h-4 w-4" />
		{/if}
	</Button>
</div>
