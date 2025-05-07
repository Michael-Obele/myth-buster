<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import Navbar from '$lib/components/Navbar.svelte';
	import { onMount } from 'svelte';

	onMount(async () => {
		const lottie = (await import('lottie-web')).default;
		const { defineElement } = await import('@lordicon/element');
		defineElement(lottie.loadAnimation);
	});
</script>

<Toaster />

<div class="dark">
	<Navbar />
	<!-- Spacer to prevent content from being hidden under the navbar -->
	<div class="bg-black pt-14">
		{@render children()}
	</div>
</div>
