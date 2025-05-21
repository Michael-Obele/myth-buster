# Svelte 5 Implementation Guide for Myth Buster

## Svelte 5 Runes Overview

Svelte 5 introduces "runes" - a new reactivity primitive that replaces the older reactive statements. This guide provides concrete examples of how to implement key features of our Myth Buster app using Svelte 5's rune-based reactivity system.

### Key Runes for Myth Buster Implementation

- **$state**: For component-local reactive state
- **$derived**: For computed values
- **$effect**: For side effects when reactive values change
- **$props**: For component props with type safety

## Core State Management Examples

### Verification State Management

```svelte
<script>
  // Define main application state
  let statement = $state('');
  let verificationResult = $state(/** @type {null | 'loading' | 'true' | 'false' | 'inconclusive' | 'error'} */ null);
  let explanation = $state('');
  let citations = $state([]);
  let isAudioEnabled = $state(true);
  
  // Derived state for UI rendering decisions
  let isVerifying = $derived(verificationResult === 'loading');
  let canVerify = $derived(statement.trim().length > 0 && !isVerifying);
  let showResult = $derived(verificationResult !== null && verificationResult !== 'loading');
  
  // Effect to play audio when result arrives
  $effect(() => {
    if (!isAudioEnabled) return;
    
    if (verificationResult === 'true') {
      playAudio('true-sound.mp3');
    } else if (verificationResult === 'false') {
      playAudio('false-sound.mp3');
    } else if (verificationResult === 'inconclusive') {
      playAudio('inconclusive-sound.mp3');
    }
  });
  
  // Verification function
  async function verifyStatement() {
    if (!canVerify) return;
    
    verificationResult = 'loading';
    explanation = '';
    citations = [];
    
    try {
      const result = await fetchVerificationFromAPI(statement);
      verificationResult = result.verdict;
      explanation = result.explanation;
      citations = result.citations;
    } catch (error) {
      console.error('Verification error:', error);
      verificationResult = 'error';
      explanation = 'We encountered an error while verifying your statement. Please try again.';
    }
  }
  
  // Helper functions
  function playAudio(soundFile) {
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.play().catch(err => console.error('Audio playback error:', err));
  }
  
  async function fetchVerificationFromAPI(statement) {
    // Implementation in API integration section
  }
</script>
```

### Theme Toggle Implementation

```svelte
<script>
  // Theme state management with local storage persistence
  let theme = $state(localStorage.getItem('theme') || 'light');
  
  // Effect to update DOM and localStorage when theme changes
  $effect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  });
  
  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }
</script>

<Button on:click={toggleTheme} variant="ghost" size="icon">
  {#if theme === 'dark'}
    <Sun class="h-5 w-5" />
  {:else}
    <Moon class="h-5 w-5" />
  {/if}
</Button>
```

## Component Property Definitions

### Verdict Display Component

```svelte
<!-- VerdictDisplay.svelte -->
<script>
  // Define props with type safety
  const { verdict, explanation, citations } = $props(/** @type {{
    verdict: 'true' | 'false' | 'inconclusive' | 'error',
    explanation: string,
    citations: Array<{title: string, url: string}>
  }} */);
  
  // Derived values based on props
  let iconComponent = $derived(() => {
    switch (verdict) {
      case 'true': return Check;
      case 'false': return X;
      case 'inconclusive': return HelpCircle;
      case 'error': return AlertTriangle;
      default: return null;
    }
  });
  
  let verdictColor = $derived(() => {
    switch (verdict) {
      case 'true': return 'text-codex-emerald';
      case 'false': return 'text-codex-crimson';
      case 'inconclusive': return 'text-codex-amethyst';
      case 'error': return 'text-amber-500';
      default: return '';
    }
  });
  
  let animation = $derived(() => {
    switch (verdict) {
      case 'true': return 'animate-scale-up';
      case 'false': return 'animate-shake';
      case 'inconclusive': return 'animate-pulse';
      case 'error': return 'animate-bounce';
      default: return '';
    }
  });
</script>

<Card class="w-full max-w-3xl mx-auto">
  <CardHeader>
    <div class="flex items-center gap-3">
      <div class={`${verdictColor} ${animation}`}>
        <svelte:component this={iconComponent} class="h-8 w-8" />
      </div>
      <CardTitle>
        {#if verdict === 'true'}
          Verified True
        {:else if verdict === 'false'}
          Debunked: False
        {:else if verdict === 'inconclusive'}
          Inconclusive Evidence
        {:else}
          Verification Error
        {/if}
      </CardTitle>
    </div>
  </CardHeader>
  
  <CardContent>
    <p class="text-base">{explanation}</p>
    
    {#if citations.length > 0}
      <div class="mt-4">
        <h3 class="font-semibold mb-2">Sources:</h3>
        <ScrollArea class="h-48">
          <List>
            {#each citations as citation}
              <ListItem>
                <a href={citation.url} target="_blank" rel="noopener noreferrer" 
                   class="text-blue-600 dark:text-blue-400 hover:underline">
                  {citation.title}
                </a>
              </ListItem>
            {/each}
          </List>
        </ScrollArea>
      </div>
    {/if}
  </CardContent>
</Card>
```

## Svelte 5 and shadcn-svelte Integration

### Component Registration with Types

```typescript
// types.d.ts - Enhancing compatibility between Svelte 5 and shadcn-svelte
import type { SvelteComponent } from 'svelte';

declare global {
  namespace App {
    interface ShadcnComponent extends SvelteComponent {
      // Add any shadcn-svelte specific properties here
    }
  }
}
```

### Importing and Using shadcn-svelte Components

```svelte
<script>
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
  
  // State management with runes
  let inputValue = $state('');
  
  // Using shadcn-svelte components with Svelte 5 reactivity
  function handleSubmit() {
    if (inputValue.trim()) {
      console.log('Submitted:', inputValue);
      // Process form submission
    }
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Verify a Statement</CardTitle>
  </CardHeader>
  <CardContent>
    <div class="grid gap-4">
      <Input 
        bind:value={inputValue} 
        placeholder="Enter a statement to verify..." 
      />
    </div>
  </CardContent>
  <CardFooter>
    <Button on:click={handleSubmit} disabled={!inputValue.trim()}>
      Verify
    </Button>
  </CardFooter>
</Card>
```

### Known Compatibility Issues and Workarounds

| Issue | Description | Workaround |
|-------|-------------|------------|
| Event Handlers | Some shadcn components might not correctly react to Svelte 5's event binding | Use `on:event={() => handleFunction()}` syntax instead of `on:event={handleFunction}` |
| Reactive Props | Props spreading may behave differently in Svelte 5 | Use explicit prop binding rather than `{...props}` spread syntax |
| Context API | Svelte 5's context API changes may affect shadcn components | Use explicit provider components or revert to Svelte 4's context API within shadcn components |
| TypeScript Issues | Type definitions may clash between Svelte 5 and shadcn | Create separate type declaration files that bridge the gap between the libraries |

```svelte
<!-- Example workaround for event handler issue -->
<script>
  import { Button } from "$lib/components/ui/button";
  
  function handleClick() {
    console.log('Button clicked');
  }
</script>

<!-- Workaround: Use arrow function wrapper -->
<Button on:click={() => handleClick()}>Click Me</Button>
```

## Compatibility Testing Strategy

Before full implementation, verify Svelte 5 and shadcn-svelte compatibility with these steps:

1. Create a minimal test project with Svelte 5 and shadcn-svelte
2. Implement small examples of each component type you plan to use
3. Test reactivity patterns with runes for each component
4. Document any issues encountered and required workarounds
5. Create a compatibility layer if necessary

This upfront testing will save significant development time during the hackathon.