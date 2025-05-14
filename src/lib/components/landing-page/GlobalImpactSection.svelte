<script lang="ts">
import { Button } from '$lib/components/ui/button';
import Globe from '$lib/components/blocks/Globe.svelte';
</script>

<section class="relative my-16 py-16">
	<div class="mx-auto max-w-7xl px-4">
		<div class="mb-8 text-center">
			<h2 class="mb-4 font-underdog text-4xl font-bold">Global Impact of Misinformation</h2>
			<p class="mx-auto max-w-2xl text-xl text-muted-foreground">
				Myths and misinformation spread across the globe in seconds. Our mission is to provide
				fact-checking tools that reach every corner of the world.
			</p>
		</div>

		<div
			class="relative mx-auto flex h-fit w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg border bg-background px-4 pb-40 pt-8 md:pb-60 md:shadow-xl"
		>
			<span
				class="pointer-events-none select-none whitespace-pre-wrap bg-gradient-to-b from-primary to-accent/80 bg-clip-text text-center text-6xl font-semibold leading-none text-transparent"
			>
				Truth Worldwide
			</span>
			<main class="absolute inset-0 top-28 mx-auto aspect-[1/1] w-full max-w-[600px]">
				<!-- Your Globe component here -->
				<Globe />
			</main>
			<div
				class="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]"
			></div>
		</div>

		<div class="mt-8 text-center">
			<p class="mx-auto max-w-2xl text-lg">
				Join our worldwide community of myth busters who are committed to spreading truth and
				challenging misinformation everywhere.
			</p>
			<Button href="/join" variant="default" size="lg" class="mt-6">Join the Movement</Button>
		</div>
	</div>
</section>
