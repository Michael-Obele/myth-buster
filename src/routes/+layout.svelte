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

<Toaster expand={true} position="top-center" />

<Navbar />
<!-- Spacer to prevent content from being hidden under the navbar -->
<div class="pt-14">
	{@render children()}
</div>
