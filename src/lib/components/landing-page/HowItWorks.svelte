<script lang="ts">
	import { Check, Search, FileText } from 'lucide-svelte';
	
	// Using $state for reactivity in Svelte 5
	const steps = $state([
		{
			icon: Search,
			title: 'Enter Your Myth',
			description: 'Type in any statement, claim, or myth you want to verify into the input field.',
			color: 'bg-primary',
			textColor: 'text-primary'
		},
		{
			icon: FileText,
			title: 'AI Analysis',
			description: 'Our AI analyzes the statement using advanced research and reliable sources.',
			color: 'bg-purple-500',
			textColor: 'text-purple-500'
		},
		{
			icon: Check,
			title: 'Get Results',
			description: 'Receive a detailed verdict (True/False/Inconclusive) with explanations and verifiable citations.',
			color: 'bg-emerald-500',
			textColor: 'text-emerald-500'
		}
	]);
</script>

<section class="py-16 w-full">
	<div class="max-w-6xl mx-auto px-4">
		<h2 class="text-3xl md:text-4xl font-serif font-bold text-center mb-12">How It Works</h2>
		
		<!-- Mobile view: vertical steps -->
		<div class="md:hidden space-y-8">
			{#each steps as step, i}
				<div class="flex items-start space-x-4">
					<div class="flex-shrink-0">
						<div class="w-10 h-10 rounded-full {step.color} flex items-center justify-center text-white">
							{i + 1}
						</div>
					</div>
					<div>
						<h3 class="text-xl font-semibold {step.textColor}">{step.title}</h3>
						<p class="mt-2 text-muted-foreground">{step.description}</p>
					</div>
				</div>
			{/each}
		</div>
		
		<!-- Desktop view: horizontal connected steps -->
		<div class="hidden md:grid grid-cols-3 gap-4">
			{#each steps as step, i}
				<div class="p-6 rounded-lg border bg-card relative">
					{#if i > 0}
						<!-- Connector line -->
						<div class="absolute top-1/2 -left-4 w-4 h-0.5 bg-muted-foreground/30"></div>
					{/if}
					<div class="flex flex-col items-center text-center">
						<div class="w-16 h-16 rounded-full {step.color} flex items-center justify-center text-white mb-4">
							{#if step.title === 'Enter Your Myth'}
								<Search class="h-7 w-7" />
							{:else if step.title === 'AI Analysis'}
								<FileText class="h-7 w-7" />
							{:else}
								<Check class="h-7 w-7" />
							{/if}
						</div>
						<h3 class="text-xl font-semibold {step.textColor} mb-2">{step.title}</h3>
						<p class="text-muted-foreground">{step.description}</p>
					</div>
				</div>
			{/each}
		
		<!-- Connection line between steps -->
		<div class="relative mt-8 hidden md:block">
			<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-emerald-500"></div>
		</div>
	</div>
</section>
