<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import Navbar from '$lib/components/blocks/Navbar.svelte';
	import { onMount } from 'svelte';
	onMount(async () => {
		const lottie = (await import('lottie-web')).default;
		const { defineElement } = await import('@lordicon/element');
		defineElement(lottie.loadAnimation);
	});
</script>

<Toaster position="top-center" />

<Navbar />
<!-- Spacer to prevent content from being hidden under the navbar -->
<div class="bg-gradient-to-br from-slate-900 to-slate-800 pt-14">
	{@render children()}
</div>
