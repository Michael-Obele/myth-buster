<script lang="ts">
import AlternatingFeature from './AlternatingFeature.svelte';
import { Button } from '$lib/components/ui/button';
import { ArrowRight } from 'lucide-svelte';

import Approval from '$lib/img/Approval.png';
import Busy from '$lib/img/Busy.png';

const featureContent = $state([
	{
		title: 'Verify Any Claim Instantly',
		description:
			"Our AI-powered analysis can verify any statement in seconds, providing a definitive verdict with supporting evidence. Whether it's a viral social media post or a surprising 'fact' you heard, we've got you covered.",
		imgSrc: Approval,
		imgAlt: 'Stamp of Approval',
		reversed: false
	},
	{
		title: 'Learn the Origins of Common Myths',
		description:
			'Beyond just fact-checking, discover where popular myths originated and how they became widespread. Understanding the history of misinformation helps prevent its future spread.',
		imgSrc: Busy,
		imgAlt: 'People Checking Facts',
		reversed: true
	}
]);
</script>

{#each featureContent as content, index}
	<AlternatingFeature
		title={content.title}
		description={content.description}
		imgSrc={content.imgSrc}
		imgAlt={content.imgAlt}
		reversed={content.reversed}
		className="mt-24"
	>
		{#if index === 0}
			<Button href="/app" variant="outline" class="mt-4 border-primary text-primary">
				Try it yourself <ArrowRight class="ml-2 h-4 w-4" />
			</Button>
		{/if}
	</AlternatingFeature>
{/each}
