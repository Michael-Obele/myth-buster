<script lang="ts">
	import { page } from '$app/state';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuLabel,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { User } from 'lucide-svelte';
	import SignOutButton from './SignOutButton.svelte';

	// Get the current user from the page store
	const user = $derived(page.data.user);
	const isAuthenticated = $derived(!!user);

	// Get the user's initials for the avatar
	const userInitials = $derived(() => {
		if (!user || !user.username) return '?';
		return user.username.substring(0, 2).toUpperCase();
	});
</script>

{#if isAuthenticated}
	<DropdownMenu>
		<DropdownMenuTrigger class="focus:outline-none">
			<Avatar>
				<AvatarFallback class="bg-primary text-primary-foreground">
					{userInitials}
				</AvatarFallback>
			</Avatar>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuLabel>
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">{user.username}</p>
					<p class="text-xs leading-none text-muted-foreground">{user.email}</p>
				</div>
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuItem>
				<SignOutButton />
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
{:else}
	<div class="flex items-center gap-2">
		<a href="/signin" class="text-sm font-medium hover:underline">Sign in</a>
		<a
			href="/signup"
			class="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
			>Sign up</a
		>
	</div>
{/if}
