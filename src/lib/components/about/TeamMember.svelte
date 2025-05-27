<script lang="ts">
	import { cn } from '$lib/utils';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Github, Twitter, Linkedin } from '@lucide/svelte';

	let {
		name = '',
		role = '',
		image = '',
		bio = '',
		github = '',
		twitter = '',
		linkedin = '',
		className = ''
	} = $props<{
		name: string;
		role: string;
		image: string;
		bio: string;
		github?: string;
		twitter?: string;
		linkedin?: string;
		className?: string;
	}>();
</script>

<Card.Root class={cn('overflow-hidden transition-all hover:shadow-lg', className)}>
	<div class="relative aspect-square overflow-hidden">
		<img
			src={image}
			alt={name}
			class="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
		/>
		<div class="absolute inset-0 bg-linear-to-t from-background/80 to-transparent"></div>
	</div>
	<Card.Content class="p-6">
		<div class="mb-2 flex items-center justify-between">
			<div>
				<h3 class="text-xl font-bold">{name}</h3>
				<Badge variant="outline" class="mt-1">{role}</Badge>
			</div>
		</div>
		<p class="text-sm text-muted-foreground">{bio}</p>
		<div class="mt-4 flex gap-2">
			{#if github}
				<Button variant="ghost" size="icon">
					<a href={github} target="_blank" rel="noopener noreferrer">
						<Github class="h-4 w-4" />
						<span class="sr-only">GitHub</span>
					</a>
				</Button>
			{/if}
			{#if twitter}
				<Button variant="ghost" size="icon">
					<a href={twitter} target="_blank" rel="noopener noreferrer">
						<Twitter class="h-4 w-4" />
						<span class="sr-only">Twitter</span>
					</a>
				</Button>
			{/if}
			{#if linkedin}
				<Button variant="ghost" size="icon">
					<a href={linkedin} target="_blank" rel="noopener noreferrer">
						<Linkedin class="h-4 w-4" />
						<span class="sr-only">LinkedIn</span>
					</a>
				</Button>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
