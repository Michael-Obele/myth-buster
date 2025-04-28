<script lang="ts">
	import { Button } from '$lib/components/ui/button';
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
	<h1 class="mb-4 font-serif text-4xl font-bold">Welcome to Myth Buster Web App</h1>
	<p class="mb-8 max-w-xl text-center text-lg text-muted-foreground">
		Bust myths, learn the facts, and explore myth-themed Svelte 5 coding with AI assistance.<br />
		Enter a myth to verify, explore myth origins, or try myth-themed coding challenges!
	</p>
	<Button href="/app" variant="outline" class="px-8 py-4 text-lg">Start Busting Myths</Button>
</main>
