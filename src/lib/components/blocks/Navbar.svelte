<script lang="ts">
	import { page } from '$app/state';
	import { Flame, Menu, X, User } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { beforeNavigate } from '$app/navigation';
	import { goto } from '$app/navigation';

	// Get user from page data
	let user = $derived(page.data.user);

	// Filter nav links based on authentication status
	let authLinks = $derived(
		user
			? [] // No auth links needed if user is logged in
			: [
					{ href: '/signin', label: 'Sign In' },
					{ href: '/signup', label: 'Sign Up' }
				]
	);

	// Base nav links
	const baseNavLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/app', label: 'Verify Myths' },
		{ href: '/game', label: 'Game' },
		{ href: '/about', label: 'About' }
	];

	// Combine base links with auth links
	let navLinks = $derived([...baseNavLinks, ...authLinks]);

	let isMenuOpen: boolean = $state(false);
	let currentPath = $derived(page.url.pathname);

	// Get first letter of username for avatar
	let userInitial = $derived(user?.username ? user.username[0].toUpperCase() : '');

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

			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="p-0">
						<Avatar.Root class="h-9 w-9">
							<Avatar.Fallback class="bg-primary text-primary-foreground">
								{userInitial}
							</Avatar.Fallback>
						</Avatar.Root>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							<DropdownMenu.Item onclick={() => goto('/profile')}>
								<User class="mr-2 h-4 w-4" />
								<span>Profile</span>
							</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={() => goto('/signout')}>Sign out</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
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

				{#if user}
					<div class="flex items-center gap-2 rounded-md px-3 py-2">
						<Avatar.Root class="h-6 w-6">
							<Avatar.Fallback class="bg-primary text-xs text-primary-foreground">
								{userInitial}
							</Avatar.Fallback>
						</Avatar.Root>
						<span class="text-sm font-medium">{user.username}</span>
					</div>
					<a
						href="/signout"
						class="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
					>
						Sign out
					</a>
				{/if}
			</div>
		</div>
	{/if}
</nav>
