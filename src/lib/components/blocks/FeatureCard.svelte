<script lang="ts">
	import { onMount } from 'svelte';
	import LordIcon from './LordIcon.svelte';

	interface Props {
		// Svelte 5 Code : https://svelte.dev/playground/39866a136f0d4268821e5ae901dce47f?version=5.0.5
		collapseDelay?: number;
		ltr?: boolean;
		linePosition?: 'left' | 'right' | 'top' | 'bottom';
		data?: Array<{
			id: number;
			title: string;
			content: string;
			image?: string;
			video?: string;
			lottie?: string;
			icon?: any;
		}>;
	}

	let { collapseDelay = 5000, ltr = false, linePosition = 'left', data = [] }: Props = $props();

	let currentIndex = $state(-1);
	let carouselRef: HTMLUListElement | undefined = $state();
	let isInView = $state(false);

	const scrollToIndex = (index: number) => {
		if (carouselRef) {
			const cards = carouselRef.querySelectorAll('.card_code');
			const card = cards[index] as HTMLElement;

			if (card) {
				const cardRect = card.getBoundingClientRect();
				const carouselRect = carouselRef.getBoundingClientRect();
				const offset =
					cardRect.left - carouselRect.left - (carouselRect.width - cardRect.width) / 2;

				carouselRef.scrollTo({
					left: carouselRef.scrollLeft + offset,
					behavior: 'smooth'
				});
			}
		}
	};
	onMount(() => {
		let timmer = setTimeout(() => {
			currentIndex = 0;
		}, 100);
		return () => clearTimeout(timmer);
	});
	onMount(() => {
		handleScroll();
	});
	let handleScroll = () => {
		let autoScrollTimer: number;
		let handleAutoScroll = () => {
			currentIndex = (currentIndex + 1) % data.length;
			scrollToIndex(currentIndex);
		};

		autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

		return () => clearInterval(autoScrollTimer);
	};
</script>

<section id="features">
	<div class="container">
		<div class="mx-auto max-w-6xl">
			<div class="mx-auto my-12 grid h-full items-center gap-10 lg:grid-cols-2">
				<div
					class="order-1 hidden lg:order-none lg:flex {ltr
						? 'lg:order-2 lg:justify-end'
						: 'justify-start'} "
				>
					<div>
						{#each data as item, index}
							<div class="relative mb-8 flex items-center last:mb-0">
								{#if linePosition === 'left' || linePosition === 'right'}
									<div
										class="absolute inset-y-0 h-full w-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 {linePosition ===
										'right'
											? 'left-auto right-0'
											: 'left-0 right-auto'}"
									>
										<div
											class="absolute left-0 top-0 w-full {currentIndex === index
												? 'h-full'
												: 'h-0'} origin-top bg-primary transition-all ease-linear dark:bg-white"
											style="
            transition-duration: {currentIndex === index ? `${collapseDelay}ms` : '0s'};"
										></div>
									</div>
								{/if}

								{#if linePosition === 'top' || linePosition === 'bottom'}
									<div
										class="absolute inset-x-0 h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 {linePosition ===
										'bottom'
											? 'bottom-0'
											: 'top-0'}"
									>
										<div
											class="absolute left-0 {linePosition === 'bottom'
												? 'bottom-0'
												: 'top-0'} h-full {currentIndex === index
												? 'w-full'
												: 'w-0'} origin-left bg-primary transition-all ease-linear dark:bg-white"
											style="
                         transition-duration: {currentIndex === index
												? `${collapseDelay}ms`
												: '0s'};"
										></div>
									</div>
								{/if}
								<div
									class="item-box mx-2 flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:mx-6"
								>
									<item.icon class="size-6 text-primary" />
								</div>
								<div class="space-y-2">
									<h3 class="text-lg font-bold lg:text-2xl">{item.title}</h3>
									<div class="w-96 text-[16px] text-muted-foreground">
										{item.content}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="mx-auto h-[350px] min-h-[200px] w-auto {ltr && 'lg:order-1'}">
					{#if data[currentIndex]?.image}
						<!-- <img
							src={data[currentIndex].image}
							alt="feature"
							class="aspect-auto size-full rounded-xl border border-neutral-300/50 object-cover object-top-left p-1 shadow-lg"
						/> -->
						<div>
							<LordIcon
								src={data[currentIndex].image}
								trigger="loop"
								stroke="thick"
								target="#hero"
								colors="primary:#10B981,secondary:#10b981"
								mobileLoop={false}
								class="mx-auto size-64 md:size-96"
							/>
						</div>
					{:else if data[currentIndex]?.video}
						<video
							preload="auto"
							src={data[currentIndex].video}
							class="aspect-auto size-full rounded-lg object-cover shadow-lg"
							autoplay
							loop
							muted
						></video>
					{:else}
						<div
							class="aspect-auto size-full rounded-xl border border-neutral-300/50 bg-gray-200 p-1"
						></div>
					{/if}
				</div>

				<div
					class="relative -mb-8 pb-0.5 [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] mask-[linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] md:hidden"
				>
					{#each data, index}
						<div
							class="absolute inset-x-0 top-0 h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30"
						>
							<div
								class="absolute left-0 top-0 h-full {currentIndex === index
									? 'w-full'
									: 'w-0'} origin-left bg-primary transition-all ease-linear dark:bg-white"
								style="
                       transition-duration: {currentIndex === index ? `${collapseDelay}ms` : '0s'};"
							></div>
						</div>
					{/each}
				</div>
				<ul
					bind:this={carouselRef}
					class="relative flex h-full snap-x snap-mandatory flex-nowrap overflow-x-auto px-4 pl-20 [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] mask-[linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
				>
					{#each data as item, index}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->

						<li
							class="card_code relative mr-2 h-full max-w-full shrink-0 cursor-pointer items-start justify-center last:mr-0"
							onclick={() => (currentIndex = index)}
							style="scroll-snap-align: center;"
						>
							<span class="flex items-center gap-2">
								<p>{index + 1}</p>
								<h2 class=" text-sm font-bold md:text-xl">{item.title}</h2>
							</span>
							<p class="mx-0 max-w-sm text-balance text-sm">{item.content}</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<style>
	.card_code {
		transition: all 0.3s ease;
	}
	.item-box {
		width: 3rem;
		height: 3rem;
	}
</style>
