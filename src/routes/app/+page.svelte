<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import { Switch } from '$lib/components/ui/switch';
	import * as Popover from '$lib/components/ui/popover';
	import * as Alert from '$lib/components/ui/alert';
	// Svelte 5 reactivity
	let theme = $state('light');
	let { children } = $props();

	// Example: Toggle theme
	$effect(() => {
		if (typeof window !== 'undefined') {
			document.documentElement.classList.toggle('dark', theme === 'dark');
		}
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}
</script>

<Card.Root class="mx-auto mt-12 max-w-2xl bg-background shadow-lg">
	<Card.Header>
		<Card.Title class="font-serif text-3xl">Myth Buster AI Code Editor</Card.Title>
		<Card.Description class="text-lg text-muted-foreground">
			An enchanted, AI-powered Svelte 5 playground for myth-themed code experiments.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<Tabs.Root value="editor" class="w-full">
			<Tabs.List>
				<Tabs.Trigger value="editor">Editor</Tabs.Trigger>
				<Tabs.Trigger value="snippets">Snippets</Tabs.Trigger>
				<Tabs.Trigger value="tutorials">Tutorials</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="editor">
				<div class="flex flex-col gap-4">
					<Popover.Root>
						<Popover.Trigger>
							<Button variant="outline">AI Suggest</Button>
						</Popover.Trigger>
						<Popover.Content>
							<Alert.Root>
								<Alert.Title>AI Suggestions</Alert.Title>
								<Alert.Description>
									(Coming soon) Get Svelte 5 code suggestions powered by Sonar.
								</Alert.Description>
							</Alert.Root>
						</Popover.Content>
					</Popover.Root>
					<textarea
						class="min-h-[200px] w-full rounded border bg-muted p-3 font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
						placeholder="Write Svelte 5 code here..."
					></textarea>
				</div>
			</Tabs.Content>
			<Tabs.Content value="snippets">
				<div class="p-4 text-muted-foreground">
					(Coming soon) Myth-related code snippets will appear here.
				</div>
			</Tabs.Content>
			<Tabs.Content value="tutorials">
				<div class="p-4 text-muted-foreground">
					(Coming soon) Interactive Svelte 5 tutorials and myth-busting challenges.
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</Card.Content>
	<Card.Footer class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			<span class="text-sm">Theme</span>
			<Switch checked={theme === 'dark'} onchange={toggleTheme} />
		</div>
		<Button href="/">Back to Landing</Button>
	</Card.Footer>
</Card.Root>

<style>
	:global(.dark) {
		--background: #18181b;
		--foreground: #f4f4f5;
	}
</style>
