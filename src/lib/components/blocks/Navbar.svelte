<script lang="ts">
	import { page } from '$app/state';
	import { Flame, Menu, X } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { beforeNavigate } from '$app/navigation';

	// Nav links array
	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/app', label: 'Verify Myths' },
		{ href: '/game', label: 'Game' },
		{ href: '/about', label: 'About' }
	];

	let isMenuOpen: boolean = $state(false);
	let currentPath = $derived(page.url.pathname);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}
	beforeNavigate(() => {
		isMenuOpen = false;
	});

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
				<span class="font-underdog text-xl font-bold tracking-tight">Myth Buster</span>
			</a>
			<Badge class="bg-primary/20 text-primary">AI Powered</Badge>
		</div>

		<!-- Desktop navigation -->
		<div class="hidden md:flex md:items-center md:gap-6">
			{#each navLinks as link}
				<a
					href={link.href}
					class={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.href) ? 'text-primary' : 'text-muted-foreground'}`}
				>
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Mobile menu button -->
		<Button
			variant="ghost"
			size="icon"
			class="border border-green-400 text-green-400 md:hidden"
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
				{#each navLinks as link}
					<a
						href={link.href}
						class={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-primary/10 hover:text-primary ${isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
					>
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</nav>
