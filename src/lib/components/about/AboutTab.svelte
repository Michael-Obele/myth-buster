<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<div class="space-y-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Our Mission</Card.Title>
			<Card.Description>
				Helping people separate fact from fiction in an engaging way
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="mb-4 text-muted-foreground">
				Myth Buster was created to address the growing challenge of misinformation in our
				digital world. We believe that everyone deserves access to accurate information,
				presented in a way that's both engaging and educational.
			</p>
			<p class="mb-4 text-muted-foreground">
				Our tool combines the power of AI with beautiful design to help you verify statements,
				debunk myths, and learn the fascinating origins of common misconceptions.
			</p>
			<p class="text-muted-foreground">
				Whether you're a curious learner, an educator, or someone who simply wants to check if
				something they heard is true, Myth Buster is designed to be your companion in the
				pursuit of truth.
			</p>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>How It Works</Card.Title>
			<Card.Description>The technology behind our myth-busting process</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				<div class="flex items-start gap-3">
					<div class="mt-1 rounded-full bg-primary/20 p-1">
						<span
							class="block h-6 w-6 rounded-full bg-primary text-center text-xs font-bold leading-6 text-primary-foreground"
						>
							1
						</span>
					</div>
					<div>
						<h4 class="text-base font-medium">Enter Your Statement</h4>
						<p class="text-sm text-muted-foreground">
							Type any statement or question you want to verify into our intuitive input
							field.
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<div class="mt-1 rounded-full bg-primary/20 p-1">
						<span
							class="block h-6 w-6 rounded-full bg-primary text-center text-xs font-bold leading-6 text-primary-foreground"
						>
							2
						</span>
					</div>
					<div>
						<h4 class="text-base font-medium">AI-Powered Research</h4>
						<p class="text-sm text-muted-foreground">
							Our system uses the Perplexity Sonar API to search for reliable information from
							across the web.
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<div class="mt-1 rounded-full bg-primary/20 p-1">
						<span
							class="block h-6 w-6 rounded-full bg-primary text-center text-xs font-bold leading-6 text-primary-foreground"
						>
							3
						</span>
					</div>
					<div>
						<h4 class="text-base font-medium">Clear Verdict & Explanation</h4>
						<p class="text-sm text-muted-foreground">
							Receive a clear verdict (True, False, or Inconclusive) along with a detailed
							explanation and sources.
						</p>
					</div>
				</div>

				<div class="flex items-start gap-3">
					<div class="mt-1 rounded-full bg-primary/20 p-1">
						<span
							class="block h-6 w-6 rounded-full bg-primary text-center text-xs font-bold leading-6 text-primary-foreground"
						>
							4
						</span>
					</div>
					<div>
						<h4 class="text-base font-medium">Learn & Share</h4>
						<p class="text-sm text-muted-foreground">
							Discover the origins of myths, learn the facts, and share your findings with
							others.
						</p>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
