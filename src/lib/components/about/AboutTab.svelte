<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import {
		ArrowRight,
		Zap,
		Shield,
		BookOpen,
		Github,
		Linkedin,
		Twitter,
		type Icon as IconType
	} from '@lucide/svelte';
	import GridBeam from '$lib/components/blocks/GridBeam.svelte';
	import { fade } from 'svelte/transition';

	// Define prop types
	type TeamMember = {
		name: string;
		role: string;
		image: string;
		bio: string;
		github?: string;
		twitter?: string;
		linkedin?: string;
	};

	interface Props {
		team: TeamMember[];
	}

	// Define props
	let { team = [] }: Props = $props();

	let howItWorksSteps: {
		step: number;
		title: string;
		description: string;
		icon: typeof IconType;
	}[] = [
		{
			step: 1,
			title: 'Enter Your Statement',
			description:
				'Type any statement or question you want to verify into our intuitive input field.',
			icon: ArrowRight
		},
		{
			step: 2,
			title: 'AI-Powered Research',
			description:
				'Our system uses the Perplexity Sonar API to search for reliable information from across the web.',
			icon: Zap
		},
		{
			step: 3,
			title: 'Clear Verdict & Explanation',
			description:
				'Receive a clear verdict (True, False, or Inconclusive) along with a detailed explanation and sources.',
			icon: Shield
		},
		{
			step: 4,
			title: 'Learn & Share',
			description:
				'Discover the origins of myths, learn the facts, and share your findings with others.',
			icon: BookOpen
		}
	];

	let heroVisible = $state(true);
</script>

<div class="space-y-8">
	<!-- Hero section with animated background -->

	<div
		class="from-primary/20 to-secondary/20 relative mb-12 overflow-hidden rounded-lg bg-linear-to-br p-8"
	>
		{#if heroVisible}
			<div class="relative z-10 text-center" transition:fade={{ duration: 700 }}>
				<h2 class="font-underdog mb-4 text-3xl font-bold tracking-tight md:text-4xl">
					Our Mission
				</h2>
				<p class="text-muted-foreground mx-auto max-w-2xl text-lg">
					Helping people separate fact from fiction in an engaging way through the power of AI and
					beautiful design.
				</p>
			</div>
		{/if}
	</div>

	<!-- Mission section -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Why We Built Myth Buster</Card.Title>
			<Card.Description>Our journey to create a better way to verify information</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="z-50 grid gap-6 md:grid-cols-2">
				<div>
					<p class="text-muted-foreground mb-4">
						Myth Buster was created to address the growing challenge of misinformation in our
						digital world. We believe that everyone deserves access to accurate information,
						presented in a way that's both engaging and educational.
					</p>
					<p class="text-muted-foreground mb-4">
						Our tool combines the power of AI with beautiful design to help you verify statements,
						debunk myths, and learn the fascinating origins of common misconceptions.
					</p>
					<p class="text-muted-foreground">
						Whether you're a curious learner, an educator, or someone who simply wants to check if
						something they heard is true, Myth Buster is designed to be your companion in the
						pursuit of truth.
					</p>
				</div>
				<div class="flex items-center justify-center">
					<div class="relative h-64 w-64 overflow-hidden rounded-lg">
						<!-- <GridBeam className="h-full w-full">
						</GridBeam> -->
						<div class="flex h-full items-center justify-center">
							<span class="text-primary text-2xl font-bold">Truth Matters</span>
						</div>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Project Goals & Vision section -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Zap class="text-primary h-5 w-5" />
				Project Goals & Vision
			</Card.Title>
			<Card.Description
				>Our aim: an engaging and reliable tool for seeking truth and debunking misinformation.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<div class="text-muted-foreground space-y-4" transition:fade={{ duration: 500, delay: 100 }}>
				<p>
					Myth Buster was conceived with a clear purpose: to create a web application where users
					can input statements to verify their truth. We emphasize detailed debunking for
					falsehoods, enriched with facts and citations powered by the Perplexity Sonar API.
				</p>
				<p>
					Our primary target audience includes curious users seeking an engaging, interactive way to
					debunk myths and discover factual information. We believe that uncovering truth can be
					both informative and enjoyable.
				</p>
				<p>
					The tech stack, featuring Svelte 5 and the Sonar API, was chosen for its modern
					capabilities, allowing us to build a responsive, fast, and intelligent application
					efficiently, with a focus on providing a high-quality user experience.
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Our Development Approach section -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Shield class="text-primary h-5 w-5" />
				Our Development Approach
			</Card.Title>
			<Card.Description
				>Focusing on a polished core for maximum impact and a strong foundation for future growth.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<div class="text-muted-foreground space-y-4" transition:fade={{ duration: 500, delay: 200 }}>
				<p>
					We prioritized features that deliver the core value proposition: a reliable myth
					verification interface, engaging visual cues, and robust Sonar API integration. This focus
					ensures a polished and impactful user experience from the outset.
				</p>
				<p>Our strategic approach to development is driven by several factors:</p>
				<ul class="list-disc space-y-2 pl-5">
					<li>
						<strong>Technical Feasibility & Innovation:</strong> Leveraging modern tools like Svelte
						5 allows for rapid development of high-quality features while carefully managing complexity
						to ensure a stable and reliable application.
					</li>
					<li>
						<strong>User Experience Quality:</strong> A focused feature set enables meticulous attention
						to detail in design and interaction, creating a delightful and intuitive user experience.
					</li>
					<li>
						<strong>Expandable Foundation:</strong> We are building a solid, extensible foundation. The
						core features are designed to be robust, allowing for easier integration of more advanced
						functionalities as the project evolves.
					</li>
				</ul>
				<p>
					By concentrating on quality and a strong core, Myth Buster aims to provide a valuable,
					memorable experience and a clear vision for its future potential in combating
					misinformation.
				</p>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Team section -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Meet the Team</Card.Title>
			<Card.Description>The developer behind Myth Buster</Card.Description>
		</Card.Header>
		<Card.Content>
			{#each team as member}
				<div
					class="bg-card flex flex-col items-center gap-6 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md sm:flex-row"
					transition:fade={{ duration: 500 }}
				>
					<img
						src={member.image}
						alt={member.name}
						class="border-primary h-24 w-24 rounded-full border-2 object-cover"
					/>
					<div class="text-center sm:text-left">
						<h3 class="text-xl font-semibold">{member.name}</h3>
						<p class="text-primary mb-2 text-sm">{member.role}</p>
						<p class="text-muted-foreground mb-3">{member.bio}</p>
						<div class="flex justify-center gap-3 sm:justify-start">
							{#if member.github}
								<a
									href={member.github}
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-primary"
									aria-label="GitHub profile"
								>
									<Github class="h-5 w-5" />
								</a>
							{/if}
							{#if member.twitter}
								<a
									href={member.twitter}
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-primary"
									aria-label="Twitter profile"
								>
									<Twitter class="h-5 w-5" />
								</a>
							{/if}
							{#if member.linkedin}
								<a
									href={member.linkedin}
									target="_blank"
									rel="noopener noreferrer"
									class="text-muted-foreground hover:text-primary"
									aria-label="LinkedIn profile"
								>
									<Linkedin class="h-5 w-5" />
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<!-- How it works section -->
	<Card.Root>
		<Card.Header>
			<Card.Title>How It Works</Card.Title>
			<Card.Description>The technology behind our myth-busting process</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-6">
				{#each howItWorksSteps as step}
					<div
						class="flex items-start gap-4"
						transition:fade={{ duration: 300, delay: 100 * step.step }}
					>
						<div
							class="bg-primary/20 mt-1 flex h-10 w-10 items-center justify-center rounded-full p-1"
						>
							{#if step.icon}
								{@const Icon = step.icon}
								<div class="flex h-full w-full items-center justify-center">
									<Icon class="text-primary h-5 w-5" />
								</div>
							{:else}
								<span
									class="bg-primary text-primary-foreground block rounded-full text-center text-xs leading-6 font-bold"
								>
									{step.step}
								</span>
							{/if}
						</div>
						<div>
							<h4 class="text-base font-medium">{step.title}</h4>
							<p class="text-muted-foreground text-sm">
								{step.description}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>
</div>
