<script lang="ts">
	import '../app.css';
	let { children } = $props();
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import Navbar from '$lib/components/Navbar.svelte';
</script>

<Toaster />

<div class="dark">
	<Navbar />
	{@render children()}
</div>
