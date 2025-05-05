<script lang="ts">
	import { page } from '$app/state';
	import { Flame, Menu, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	// Use Svelte 5 $state for reactivity
	let isMenuOpen: boolean = $state(false);

	// Derive the current path for active link highlighting
	let currentPath = $derived(page.url.pathname);

	// Function to toggle mobile menu
	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	// Function to check if a link is active
	function isActive(path: string) {
		if (path === '/') {
			return currentPath === path;
		}
		return currentPath.startsWith(path);
	}
</script>

<nav
	class="fixed left-0 top-0 z-50 w-full border-b border-primary/20 bg-background/80 backdrop-blur-lg"
>
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
		<!-- Logo and brand -->
		<div class="flex items-center gap-2">
			<a href="/" class="flex items-center gap-2 text-primary">
				<Flame class="h-6 w-6" />
				<span class="font-serif text-xl font-bold tracking-tight">Myth Buster</span>
			</a>
			<Badge class="bg-primary/20 text-primary">AI Powered</Badge>
		</div>

		<!-- Desktop navigation -->
		<div class="hidden md:flex md:items-center md:gap-6">
			<a
				href="/"
				class={`text-sm font-medium transition-colors hover:text-primary ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
			>
				Home
			</a>
			<a
				href="/app"
				class={`text-sm font-medium transition-colors hover:text-primary ${isActive('/app') ? 'text-primary' : 'text-muted-foreground'}`}
			>
				Verify Myths
			</a>
			<a
				href="/about"
				class={`text-sm font-medium transition-colors hover:text-primary ${isActive('/about') ? 'text-primary' : 'text-muted-foreground'}`}
			>
				About
			</a>

			<Button
				variant="outline"
				size="sm"
				class="ml-4 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
			>
				Get Started
			</Button>
		</div>

		<!-- Mobile menu button -->
		<Button
			variant="ghost"
			size="icon"
			class="md:hidden"
			onclick={toggleMenu}
			aria-label="Toggle menu"
		>
			{#if isMenuOpen}
				<X class="h-5 w-5" />
			{:else}
				<Menu class="h-5 w-5" />
			{/if}
		</Button>
	</div>

	<!-- Mobile navigation menu -->
	{#if isMenuOpen}
		<div class="md:hidden">
			<div class="flex flex-col space-y-3 border-t border-primary/20 bg-background/95 px-4 py-4">
				<a
					href="/"
					class={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
					onclick={() => (isMenuOpen = false)}
				>
					Home
				</a>
				<a
					href="/app"
					class={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${isActive('/app') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
					onclick={() => (isMenuOpen = false)}
				>
					Verify Myths
				</a>
				<a
					href="/about"
					class={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${isActive('/about') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
					onclick={() => (isMenuOpen = false)}
				>
					About
				</a>

				<Button
					variant="outline"
					class="mt-2 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
				>
					Get Started
				</Button>
			</div>
		</div>
	{/if}
</nav>

<!-- Spacer to prevent content from being hidden under the navbar -->
<div class="h-16 bg-black"></div>
