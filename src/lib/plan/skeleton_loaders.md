# Skeleton Loaders for API-Dependent UI Elements

Skeleton loaders provide visual feedback during data fetching operations, improving perceived performance and user experience. This document outlines the implementation of skeleton loaders for all API-dependent UI elements in the Myth Buster app.

## Skeleton Loader Design Principles

1. **Match Content Structure**: Skeleton loaders should mirror the shape and structure of the content they represent
2. **Subtle Animation**: Use gentle pulse or wave animations to indicate loading state
3. **Realistic Dimensions**: Maintain similar size and proportion to actual content
4. **Consistent Style**: Apply the same visual treatment across all skeletons
5. **Branded Experience**: Incorporate app's design language into loading states

## Component Implementation

### 1. Skeleton Base Component

```svelte
<!-- src/lib/components/ui/skeleton.svelte -->
<script>
  import { cn } from "@/lib/utils";
  
  const { class: className = "" } = $props();
</script>

<div
  class={cn("animate-pulse rounded-md bg-muted", className)}
  {...$$restProps}
>
  <slot />
</div>
```

### 2. Verdict Card Skeleton

```svelte
<!-- src/lib/components/skeletons/VerdictSkeleton.svelte -->
<script>
  import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
  import { Skeleton } from "@/lib/components/ui/skeleton";
  import { cn } from "@/lib/utils";
  
  const { class: className = "" } = $props();
</script>

<Card class={cn("w-full", className)}>
  <CardHeader class="pb-2">
    <div class="flex items-center gap-3">
      <!-- Icon placeholder -->
      <Skeleton class="h-8 w-8 rounded-full" />
      
      <!-- Title placeholder -->
      <Skeleton class="h-7 w-48" />
    </div>
  </CardHeader>
  
  <CardContent class="space-y-4">
    <!-- Explanation text placeholders -->
    <Skeleton class="h-4 w-full" />
    <Skeleton class="h-4 w-full" />
    <Skeleton class="h-4 w-[85%]" />
    
    <!-- Citations placeholders -->
    <div class="mt-6 space-y-2">
      <Skeleton class="h-3 w-24" />
      <Skeleton class="h-4 w-[70%]" />
      <Skeleton class="h-4 w-[60%]" />
    </div>
  </CardContent>
</Card>
```

### 3. Citations List Skeleton

```svelte
<!-- src/lib/components/skeletons/CitationsSkeleton.svelte -->
<script>
  import { Skeleton } from "@/lib/components/ui/skeleton";
  
  const { count = 3 } = $props(/** @type {{
    count?: number
  }} */);
</script>

<div class="space-y-3">
  <Skeleton class="h-5 w-28 mb-4" />
  
  {#each Array(count) as _, i}
    <div class="flex items-center gap-2">
      <Skeleton class="h-4 w-4 rounded-full" />
      <Skeleton class="h-4 w-full" />
    </div>
  {/each}
</div>
```

### 4. Sample Myths Skeleton

```svelte
<!-- src/lib/components/skeletons/SampleMythsSkeleton.svelte -->
<script>
  import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
  import { Skeleton } from "@/lib/components/ui/skeleton";
  
  const { count = 3 } = $props(/** @type {{
    count?: number
  }} */);
</script>

<Card>
  <CardHeader class="pb-2">
    <Skeleton class="h-6 w-48" />
    <Skeleton class="h-4 w-64 mt-1" />
  </CardHeader>
  
  <CardContent class="space-y-4">
    {#each Array(count) as _, i}
      <div class="rounded-lg border p-3">
        <Skeleton class="h-5 w-3/4 mb-2" />
        <Skeleton class="h-4 w-full" />
        
        <div class="flex gap-2 mt-3">
          <Skeleton class="h-5 w-16 rounded-full" />
          <Skeleton class="h-5 w-24 rounded-full" />
        </div>
      </div>
    {/each}
  </CardContent>
</Card>
```

### 5. Search History Skeleton

```svelte
<!-- src/lib/components/skeletons/SearchHistorySkeleton.svelte -->
<script>
  import { Skeleton } from "@/lib/components/ui/skeleton";
  
  const { count = 4 } = $props(/** @type {{
    count?: number
  }} */);
</script>

<div class="space-y-3">
  <Skeleton class="h-5 w-32 mb-2" />
  
  {#each Array(count) as _, i}
    <div class="flex items-center justify-between py-2 border-b">
      <div class="flex-1">
        <Skeleton class="h-4 w-[85%]" />
        <Skeleton class="h-3 w-24 mt-1" />
      </div>
      <Skeleton class="h-8 w-8 rounded-full" />
    </div>
  {/each}
</div>
```

## Animated Skeleton Loader Implementation

To add more visual interest to skeletons, we can implement a wave animation effect:

```css
/* src/app.css (or your global CSS file) */

/* Base skeleton styles */
.skeleton {
  @apply bg-muted relative overflow-hidden rounded;
}

/* Wave animation effect */
.skeleton::after {
  content: "";
  @apply absolute inset-0;
  transform: translateX(-100%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.12),
    transparent
  );
  animation: skeleton-wave 1.5s infinite;
}

@keyframes skeleton-wave {
  0% {
    transform: translateX(-100%);
  }
  60% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* For users who prefer reduced motion */
@media (prefers-reduced-motion) {
  .skeleton::after {
    animation: none;
    opacity: 0;
  }
}
```

## Integration with API Loading States

### 1. Verification Form with Integrated Loader

```svelte
<!-- src/lib/components/VerificationForm.svelte -->
<script>
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Button } from '@/lib/components/ui/button';
  import { Textarea } from '@/lib/components/ui/textarea';
  import { Skeleton } from '@/lib/components/ui/skeleton';
  import { Loader2 } from 'lucide-svelte';
  
  // Props definition
  const { 
    isSubmitting = false,
    disabled = false
  } = $props(/** @type {{
    isSubmitting?: boolean,
    disabled?: boolean
  }} */);
  
  // Local state
  let statement = $state('');
  
  // Computed state
  let canSubmit = $derived(statement.trim().length > 0 && !isSubmitting && !disabled);
  
  // Handle form submission
  function handleSubmit() {
    if (!canSubmit) return;
    
    // Dispatch submit event
    const event = new CustomEvent('submit', { detail: statement });
    dispatch('submit', statement);
  }
  
  function dispatch(name, detail) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Verify a Statement</CardTitle>
  </CardHeader>
  
  <CardContent>
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <Textarea
        placeholder="Enter a statement to verify (e.g., 'Cracking knuckles causes arthritis')"
        bind:value={statement}
        disabled={isSubmitting || disabled}
        class="min-h-20"
      />
      
      <Button 
        type="submit" 
        class="w-full"
        disabled={!canSubmit}
      >
        {#if isSubmitting}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        {:else}
          Verify Statement
        {/if}
      </Button>
    </form>
  </CardContent>
</Card>
```

### 2. Verdict Display with Skeleton States

```svelte
<!-- src/lib/components/VerdictDisplay.svelte -->
<script>
  import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Check, X, HelpCircle } from 'lucide-svelte';
  import { VerdictSkeleton } from '@/lib/components/skeletons/VerdictSkeleton.svelte';
  import { CitationsSkeleton } from '@/lib/components/skeletons/CitationsSkeleton.svelte';
  import { Badge } from '@/lib/components/ui/badge';
  
  // Props definition
  const {
    verdict = null,
    explanation = '',
    citations = [],
    isLoading = false,
    cached = false
  } = $props(/** @type {{
    verdict?: 'true' | 'false' | 'inconclusive' | null,
    explanation?: string,
    citations?: Array<{title: string, url: string}>,
    isLoading?: boolean,
    cached?: boolean
  }} */);
  
  // Computed properties
  const verdictTitle = $derived(() => {
    switch (verdict) {
      case 'true': return 'Verified True';
      case 'false': return 'Debunked: False';
      case 'inconclusive': return 'Inconclusive Evidence';
      default: return '';
    }
  });
  
  const verdictIcon = $derived(() => {
    switch (verdict) {
      case 'true': return Check;
      case 'false': return X;
      case 'inconclusive': return HelpCircle;
      default: return null;
    }
  });
  
  const verdictColor = $derived(() => {
    switch (verdict) {
      case 'true': return 'text-green-500';
      case 'false': return 'text-red-500';
      case 'inconclusive': return 'text-purple-500';
      default: return '';
    }
  });
  
  const verdictAnimation = $derived(() => {
    switch (verdict) {
      case 'true': return 'animate-scale';
      case 'false': return 'animate-shake';
      case 'inconclusive': return 'animate-pulse';
      default: return '';
    }
  });
</script>

{#if isLoading}
  <!-- Loading State -->
  <VerdictSkeleton />
{:else if verdict}
  <!-- Result State -->
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center gap-3">
        <!-- Icon with animation -->
        <div class={`${verdictColor} ${verdictAnimation}`}>
          <svelte:component this={verdictIcon} class="h-8 w-8" />
        </div>
        
        <!-- Verdict title -->
        <div class="flex items-center gap-2">
          <CardTitle>{verdictTitle}</CardTitle>
          
          {#if cached}
            <Badge variant="outline" class="text-xs">Cached</Badge>
          {/if}
        </div>
      </div>
    </CardHeader>
    
    <CardContent class="space-y-4">
      <p class="text-base">{explanation}</p>
      
      {#if citations.length > 0}
        <div class="mt-4">
          <h3 class="text-sm font-semibold mb-2">Sources:</h3>
          <ul class="space-y-2">
            {#each citations as citation}
              <li>
                <a 
                  href={citation.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-primary hover:underline flex items-center"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                  {citation.title}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </CardContent>
  </Card>
{/if}
```

## Skeleton Screens for Different App States

### 1. Initial Application Load

```svelte
<!-- src/lib/components/skeletons/AppLoadingSkeleton.svelte -->
<script>
  import { Skeleton } from "@/lib/components/ui/skeleton";
</script>

<div class="container mx-auto px-4 py-8 max-w-3xl space-y-8">
  <!-- Header skeleton -->
  <div class="flex flex-col items-center justify-center">
    <Skeleton class="h-10 w-48 mb-2" />
    <Skeleton class="h-4 w-64" />
  </div>
  
  <!-- Form skeleton -->
  <div class="border rounded-lg p-6 space-y-4">
    <Skeleton class="h-6 w-48" />
    <Skeleton class="h-24 w-full" />
    <Skeleton class="h-10 w-full" />
  </div>
  
  <!-- Sample myths skeleton -->
  <div class="border rounded-lg p-6 space-y-4">
    <Skeleton class="h-6 w-64 mb-2" />
    <Skeleton class="h-4 w-full" />
    
    <div class="space-y-3 mt-4">
      {#each Array(3) as _}
        <div class="border rounded-lg p-3">
          <Skeleton class="h-5 w-3/4 mb-2" />
          <Skeleton class="h-4 w-full" />
          
          <div class="flex gap-2 mt-3">
            <Skeleton class="h-5 w-16 rounded-full" />
            <Skeleton class="h-5 w-24 rounded-full" />
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
```

### 2. Content Loading States for Different Data Fetching Scenarios

```svelte
<!-- src/lib/components/LoadingStates.svelte -->
<script>
  import { VerdictSkeleton } from '@/lib/components/skeletons/VerdictSkeleton.svelte';
  import { SampleMythsSkeleton } from '@/lib/components/skeletons/SampleMythsSkeleton.svelte';
  import { CitationsSkeleton } from '@/lib/components/skeletons/CitationsSkeleton.svelte';
  
  const { 
    type = 'verdict',
    count = 1
  } = $props(/** @type {{
    type?: 'verdict' | 'myths' | 'citations',
    count?: number
  }} */);
</script>

<div aria-live="polite" aria-busy="true">
  <!-- Dynamic skeleton based on content type -->
  {#if type === 'verdict'}
    <VerdictSkeleton />
  {:else if type === 'myths'}
    <SampleMythsSkeleton count={count} />
  {:else if type === 'citations'}
    <CitationsSkeleton count={count} />
  {/if}
  
  <!-- Screen reader text -->
  <div class="sr-only">Loading {type} content...</div>
</div>
```

## Progressive Loading Strategy

For a better user experience, we can implement a progressive loading strategy that prioritizes critical content:

```svelte
<!-- src/routes/+page.svelte (partial) -->
<script>
  import { onMount } from 'svelte';
  import VerificationForm from '$lib/components/VerificationForm.svelte';
  import VerdictDisplay from '$lib/components/VerdictDisplay.svelte';
  import SampleMyths from '$lib/components/SampleMyths.svelte';
  import AppLoadingSkeleton from '$lib/components/skeletons/AppLoadingSkeleton.svelte';
  import { SampleMythsSkeleton } from '$lib/components/skeletons/SampleMythsSkeleton.svelte';
  
  // Application loading states
  let isAppLoading = $state(true);
  let isFormLoaded = $state(false);
  let areMythsLoading = $state(true);
  
  // Progressive loading simulation
  onMount(() => {
    // First, load the core app structure
    setTimeout(() => {
      isAppLoading = false;
      isFormLoaded = true;
      
      // Then, load sample myths data
      setTimeout(() => {
        areMythsLoading = false;
      }, 800);
    }, 400);
  });
</script>

{#if isAppLoading}
  <!-- Initial app skeleton -->
  <AppLoadingSkeleton />
{:else}
  <main class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-3xl font-bold mb-6 text-center">Myth Buster</h1>
    
    <div class="grid gap-8">
      <!-- Verification form - prioritized to load first -->
      {#if isFormLoaded}
        <VerificationForm />
      {:else}
        <div class="border rounded-lg p-6">
          <Skeleton class="h-6 w-48 mb-4" />
          <Skeleton class="h-24 w-full mb-4" />
          <Skeleton class="h-10 w-full" />
        </div>
      {/if}
      
      <!-- Sample myths - can load after the form -->
      {#if areMythsLoading}
        <SampleMythsSkeleton count={3} />
      {:else}
        <SampleMyths />
      {/if}
    </div>
  </main>
{/if}
```

## Skeleton States for Error Recovery

When an error occurs during data fetching, we can show a skeleton to indicate a retry attempt:

```svelte
<!-- src/lib/components/ErrorRetry.svelte -->
<script>
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Button } from '@/lib/components/ui/button';
  import { AlertTriangle, RefreshCw } from 'lucide-svelte';
  import { VerdictSkeleton } from '@/lib/components/skeletons/VerdictSkeleton.svelte';
  
  const { 
    error, 
    isRetrying = false,
    onRetry
  } = $props(/** @type {{
    error: any,
    isRetrying?: boolean,
    onRetry: () => void
  }} */);
</script>

{#if isRetrying}
  <VerdictSkeleton />
{:else}
  <Card class="border-destructive/20">
    <CardHeader>
      <div class="flex items-center gap-2">
        <AlertTriangle class="h-5 w-5 text-destructive" />
        <CardTitle>Error Loading Results</CardTitle>
      </div>
    </CardHeader>
    
    <CardContent>
      <p class="text-muted-foreground">{error.message || 'An error occurred while fetching the data.'}</p>
    </CardContent>
    
    <CardFooter>
      <Button variant="outline" on:click={onRetry}>
        <RefreshCw class="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </CardFooter>
  </Card>
{/if}
```

## Adaptive Loading Based on Network Speed

We can show different skeleton states based on network speed:

```svelte
<!-- src/lib/components/AdaptiveLoader.svelte -->
<script>
  import { onMount } from 'svelte';
  import { VerdictSkeleton } from '@/lib/components/skeletons/VerdictSkeleton.svelte';
  
  // Props definition
  const { 
    isLoading = false,
    contentType = 'verdict'
  } = $props(/** @type {{
    isLoading?: boolean,
    contentType?: string
  }} */);
  
  // Network connection quality
  let connectionSpeed = $state('unknown');
  
  // Detect connection speed
  onMount(() => {
    if (navigator.connection) {
      // Use Network Information API if available
      connectionSpeed = navigator.connection.effectiveType || 'unknown';
      
      // Listen for changes
      navigator.connection.addEventListener('change', () => {
        connectionSpeed = navigator.connection.effectiveType || 'unknown';
      });
    } else {
      // Fallback method
      const startTime = Date.now();
      
      // Try to load a small test image
      const img = new Image();
      img.onload = () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        if (duration < 100) {
          connectionSpeed = '4g';
        } else if (duration < 300) {
          connectionSpeed = '3g';
        } else {
          connectionSpeed = '2g';
        }
      };
      
      img.onerror = () => {
        connectionSpeed = 'unknown';
      };
      
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  });
  
  // Determine if we should show optimized loader for slow connections
  const showOptimizedLoader = $derived(
    isLoading && (connectionSpeed === '2g' || connectionSpeed === 'slow-2g')
  );
</script>

{#if isLoading}
  {#if showOptimizedLoader}
    <!-- Simplified skeleton for slow connections -->
    <div class="border rounded-lg p-4 space-y-2">
      <div class="h-6 bg-muted rounded w-3/4"></div>
      <div class="h-4 bg-muted rounded w-full"></div>
      <div class="h-4 bg-muted rounded w-5/6"></div>
    </div>
  {:else}
    <!-- Full skeleton for faster connections -->
    <VerdictSkeleton />
  {/if}
  
  <!-- Invisible text for screen readers -->
  <div class="sr-only" aria-live="polite">
    Loading content on {connectionSpeed} connection...
  </div>
{/if}
```

## Accessibility Considerations

The skeleton loader implementation includes these accessibility features:

1. **ARIA Live Regions**: Announce loading states to screen readers
2. **Status Messaging**: Include screen reader text that describes loading content
3. **Reduced Motion**: Honor user preferences for reduced motion
4. **Focus Management**: Maintain focus when content loads to avoid focus jumps
5. **Contrast Ratios**: Ensure skeleton UI elements have sufficient contrast against backgrounds

## Transition Effects

To smoothly transition between skeleton and loaded content:

```css
/* src/app.css (or your global CSS file) */

/* Fade-in transition for loaded content */
.content-transition-enter {
  opacity: 0;
}
.content-transition-enter-active {
  opacity: 1;
  transition: opacity 300ms ease-out;
}
.content-transition-exit {
  opacity: 1;
}
.content-transition-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-in;
}

/* Skeleton to content transition */
.skeleton-to-content {
  animation: skeleton-fade 300ms ease-out forwards;
}

@keyframes skeleton-fade {
  0% {
    opacity: 0.8;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

## Integration in Main Application Flow

To use skeleton loaders consistently throughout the application:

```svelte
<!-- src/lib/hooks/useSkeletonLoader.js -->
<script context="module">
  // Loading state management for different content types
  export let loadingStates = $state({
    app: true,
    verification: false,
    myths: false,
    settings: false
  });
  
  // Set loading state for specific content
  export function setLoading(contentType, isLoading) {
    loadingStates[contentType] = isLoading;
  }
  
  // Check if any content is currently loading
  export const isAnyLoading = $derived(
    Object.values(loadingStates).some(state => state === true)
  );
  
  // Initialize application loading state
  export function initAppLoading() {
    setLoading('app', true);
    
    // Simulate app initialization loading
    setTimeout(() => {
      setLoading('app', false);
    }, 800);
  }
</script>
```

## Conclusion

This comprehensive skeleton loader implementation ensures that users receive visual feedback during all API-dependent operations in the Myth Buster app. By carefully designing skeleton screens that match the actual content structure and applying appropriate animations, we create a smoother, more engaging loading experience that improves perceived performance and user satisfaction.