# Animations and Transitions Plan

## Core Animation Philosophy

The redesigned myth-buster app will use animations thoughtfully to:
1. Enhance user understanding of state changes
2. Create a more engaging and polished experience
3. Guide user attention to important elements
4. Provide visual feedback for actions
5. Support the narrative flow of myth verification

All animations will be always-on and designed for performance across devices.

## Key Animation Components

### 1. Page Transitions

- **Fade-In Entry**: Subtle fade and slide up for initial page load
- **View Transitions**: Smooth transitions between input and results views
- **Content Staggering**: Sequential reveal of result components

```svelte
<script lang="ts">
  import { animate } from 'svelte-motion';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  
  let container: HTMLElement;
  let isVisible: boolean = $state(false);
  
  // Staggered animation for child elements
  function animateChildren() {
    if (!container) return;
    
    const children = Array.from(container.children);
    children.forEach((child, i) => {
      const delay = i * 100;
      animate(child, 
        { y: [20, 0], opacity: [0, 1] }, 
        { delay, duration: 500, easing: cubicOut }
      );
    });
  }
  
  // After content loads
  function onContentMounted(node: HTMLElement) {
    container = node;
    setTimeout(() => {
      isVisible = true;
      animateChildren();
    }, 100);
  }
</script>

<div 
  class="w-full transition-all duration-500 ease-out"
  class:opacity-0={!isVisible}
  class:opacity-100={isVisible}
  use:onContentMounted
>
  <slot />
</div>
```

### 2. Verdict Reveal Animation

Create a dramatic animation for revealing the verdict:

- **Build Anticipation**: Animated ellipsis during processing
- **Pulse Effect**: Quick pulse before the final verdict appears
- **Color Transition**: Background color shifts based on verdict (true/false/inconclusive)
- **Icon Animation**: Animated icon entry for the verdict symbol

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { animate } from 'svelte-motion';
  import { Check, X, HelpCircle } from 'lucide-svelte';
  
  let { verdict }: { verdict: string } = $props();
  let verdictContainer: HTMLElement;
  let isRevealed: boolean = $state(false);
  
  let verdictDetails = $derived(() => {
    switch (verdict) {
      case 'true':
        return { 
          icon: Check, 
          color: 'bg-emerald-500', 
          text: 'True (Confirmed!)' 
        };
      case 'false':
        return { 
          icon: X, 
          color: 'bg-red-500', 
          text: 'False (Busted!)' 
        };
      default:
        return { 
          icon: HelpCircle, 
          color: 'bg-purple-500', 
          text: 'Inconclusive' 
        };
    }
  });
  
  onMount(() => {
    setTimeout(() => {
      isRevealed = true;
      animateReveal();
    }, 500);
  });
  
  function animateReveal() {
    if (!verdictContainer) return;
    
    // First animate container
    animate(verdictContainer, 
      { scale: [0.9, 1.05, 1], opacity: [0, 1] }, 
      { duration: 0.6, ease: 'easeOut' }
    );
  }
</script>

<div 
  bind:this={verdictContainer} 
  class="flex items-center gap-3 opacity-0"
>
  <div
    class={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg ${verdictDetails.color}`}
  >
    <svelte:component this={verdictDetails.icon} class="h-6 w-6" />
  </div>
  <h2 class="text-3xl font-bold text-white">
    {verdictDetails.text}
  </h2>
</div>
```

### 3. Interactive Element Animations

- **Button Hover Effects**: Use magnetic or spotlight hover effects
- **Citation Hover Cards**: 3D transform effect on hover
- **Form Focus States**: Enhanced focus animations
- **Loading Indicators**: Creative and informative loaders

```svelte
<script lang="ts">
  import { MagneticButton } from 'svelte-magic-ui';
  import { SendIcon } from 'lucide-svelte';
  
  let disabled: boolean = $props().disabled ?? false;
  let label: string = $props().label ?? 'Submit';
  let icon: typeof SendIcon = $props().icon ?? SendIcon;
</script>

<MagneticButton 
  disabled={disabled}
  class="rounded-md bg-gradient-to-r from-primary to-purple-600 px-4 py-2 text-white"
>
  <span>{label}</span>
  <svelte:component this={icon} class="ml-2 h-4 w-4" />
</MagneticButton>
```

### 4. Explanation Text Animations

- **Text Reveal**: Progressive revealing of explanation text
- **Citation Highlighting**: Highlight effect when hovering over citations
- **Link Animations**: Subtle animations for interactive elements within text

```svelte
<script lang="ts">
  import { animate } from 'svelte-motion';
  import { HoverCard } from '$lib/components/ui/hover-card';
  
  let { segments } = $props<{segments: any[]}>();
  let container: HTMLElement;
  
  function animateText() {
    if (!container) return;
    
    const elements = container.querySelectorAll('span');
    elements.forEach((el, i) => {
      const delay = i * 30; // Staggered delay
      animate(el, 
        { opacity: [0, 1] }, 
        { delay, duration: 300 }
      );
    });
  }
  
  function onMount(node: HTMLElement) {
    container = node;
    setTimeout(animateText, 100);
  }
  
  // Highlight citation on hover
  function highlightCitation(e: MouseEvent) {
    const target = e.currentTarget as HTMLElement;
    animate(target, 
      { backgroundColor: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0)'] }, 
      { duration: 1.5 }
    );
  }
</script>

<div bind:this={container} use:onMount class="text-lg leading-relaxed">
  {#each segments as segment, i (i)}
    {#if segment.type === 'text'}
      <span class="opacity-0">{segment.content}</span>
    {:else if segment.type === 'citation' && segment.valid}
      <HoverCard.Root>
        <HoverCard.Trigger>
          <span 
            on:mouseover={highlightCitation}
            class="inline-flex cursor-pointer font-medium text-primary opacity-0 hover:underline"
          >
            {segment.content}
          </span>
        </HoverCard.Trigger>
        <HoverCard.Content side="top" class="w-80 border border-primary/30 bg-black/80 p-4">
          <!-- Citation content -->
        </HoverCard.Content>
      </HoverCard.Root>
    {:else}
      <span class="opacity-0">{segment.content}</span>
    {/if}
  {/each}
</div>
```

## Advanced Animation Features

### 1. Background Animations

- **Dynamic Gradient**: Subtle shifting gradient background
- **Particle Effects**: Optional particles that react to user interactions
- **Ambient Motion**: Subtle ambient motion in background elements

```svelte
<script lang="ts">
  import { BackgroundGradient } from 'svelte-magic-ui';
  
  let { intensity = 0.5 } = $props();
</script>

<BackgroundGradient
  interactive={true}
  containerClassName="rounded-xl"
  className="p-8 rounded-xl"
  intensity={intensity}
>
  <slot />
</BackgroundGradient>
```

### 2. Scroll-Based Animations

- **Parallax Effects**: Subtle depth to elements as user scrolls
- **Reveal on Scroll**: Elements animate in as they enter the viewport
- **Progress Indicators**: Visual progress as user scrolls through content

### 3. State Transition Animations

- **Loading States**: Creative loading indicators with progress feedback
- **Success/Error States**: Animated feedback for form submissions
- **Empty States**: Engaging animations for empty or loading states

### 4. Micro-Interactions

- **Button Press**: Tactile button press effects
- **Toggle Switches**: Smooth toggle animations
- **Input Feedback**: Visual feedback during typing
- **Checkbox/Radio**: Satisfying selection animations

## Accessibility and Performance

- **Performance Optimizations**: Use hardware-accelerated properties (`transform`, `opacity`) when possible
- **Testing**: Test animation performance on low-end devices

