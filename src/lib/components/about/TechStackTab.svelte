<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { ExternalLink, Github } from '@lucide/svelte';

	// Tech stack
	let techStack = $state([
		{
			name: 'Svelte 5',
			description: 'Modern reactive UI framework with runes',
			url: 'https://svelte.dev'
		},
		{
			name: 'SvelteKit',
			description: 'Full-stack framework for building web applications',
			url: 'https://kit.svelte.dev'
		},
		{
			name: 'shadcn-svelte',
			description: 'UI components built with Bits UI and Tailwind CSS',
			url: 'https://shadcn-svelte.com'
		},
		{
			name: 'Tailwind CSS',
			description: 'Utility-first CSS framework',
			url: 'https://tailwindcss.com'
		},
		{
			name: 'Lucide Icons',
			description: 'Beautiful & consistent icon set',
			url: 'https://lucide.dev'
		},
		{
			name: 'Perplexity Sonar API',
			description: 'Advanced AI search and reasoning',
			url: 'https://docs.perplexity.ai/docs'
		}
	]);
</script>

<div class="space-y-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Our Technology Stack</Card.Title>
			<Card.Description>Modern tools powering the Myth Buster experience</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each techStack as tech}
					<div class="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
						<h3 class="mb-1 text-lg font-medium">{tech.name}</h3>
						<p class="mb-3 text-sm text-muted-foreground">{tech.description}</p>
						<a
							href={tech.url}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
						>
							Learn more <ExternalLink class="h-3 w-3" />
						</a>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<div class="flex justify-center">
		<a
			href="https://github.com/Michael-Obele/myth-buster"
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			<Github class="h-4 w-4" />
			View on GitHub
		</a>
	</div>
</div>
