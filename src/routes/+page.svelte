<script lang="ts">
  import { Button } from "$lib/components/ui/button";
</script>

<main class="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
  <h1 class="text-4xl font-bold mb-4 font-serif">Welcome to Myth Buster Web App</h1>
  <p class="mb-8 text-lg text-muted-foreground max-w-xl text-center">
    Bust myths, learn the facts, and explore myth-themed Svelte 5 coding with AI assistance.<br/>
    Enter a myth to verify, explore myth origins, or try myth-themed coding challenges!
  </p>
  <Button href="/app" variant="outline" class="text-lg px-8 py-4">Start Busting Myths</Button>
</main>
