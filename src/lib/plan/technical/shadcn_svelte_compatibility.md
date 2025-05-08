# shadcn-svelte and Svelte 5 Integration Guide

## Compatibility Overview

shadcn-svelte is a collection of reusable UI components built on top of Bits UI that follows the design of shadcn/ui. While it's a powerful UI system, integrating it with Svelte 5 (especially the runes API) requires careful consideration due to the significant changes in Svelte's reactivity model.

This guide provides specific strategies and code snippets to ensure smooth integration between shadcn-svelte and Svelte 5 for the Myth Buster app.

## Current Compatibility Status

As of the hackathon timeline, shadcn-svelte was designed primarily for Svelte 4 and SvelteKit 1.x. Svelte 5's significant changes to the reactivity system (introducing runes and depreciating reactive statements) may cause compatibility issues. Here's how to handle these challenges:

## Installation and Setup

```bash
# Initialize a new SvelteKit project with Svelte 5
npm create svelte@latest myth-buster
cd myth-buster

# Use a recent version of shadcn-svelte that has better compatibility with Svelte 5
npm install shadcn-svelte@latest

# Initialize shadcn-svelte
npx shadcn-svelte@latest init

# Select the following options:
# - Use Bits UI components: Yes
# - Style: Default (or your preference)
# - Use custom import aliases: Yes (@/lib/* or your preference)
# - Type checking with TypeScript: Yes
# - Add components to: src/lib/components

# Install necessary dependencies
npm install lucide-svelte
```

## Component Registration Strategies

### Option 1: Direct Import with Reactivity Bridges

Create a reactivity bridge to handle potential compatibility issues between shadcn-svelte components and Svelte 5 runes:

```typescript
// src/lib/utils/reactivity-bridge.ts
import type { SvelteComponent } from 'svelte';
import { tick } from 'svelte';

/**
 * Ensures reactive props flow properly from Svelte 5 runes to shadcn components
 * @param props - The props object from a runes component
 * @returns A processed props object safe for shadcn components
 */
export function bridgeProps<T extends Record<string, any>>(props: T): T {
  // Clone the props to ensure any runes proxies are unwrapped
  const processedProps = { ...props };
  
  // Process specific known problematic properties if needed
  
  return processedProps;
}

/**
 * Safely binds a value from a Svelte 5 component to a shadcn component
 * @param getter - Function that gets the current value
 * @param setter - Function that sets the new value
 * @returns An object with value and onChange properties
 */
export function bridgeBinding<T>(
  getter: () => T,
  setter: (value: T) => void
): { value: T; onChange: (value: T) => void } {
  return {
    value: getter(),
    onChange: (newValue: T) => {
      // Schedule the update to avoid reactivity conflicts
      setTimeout(() => {
        setter(newValue);
        tick();
      }, 0);
    }
  };
}
```

Then use this bridge when working with shadcn components:

```svelte
<script>
  import { Button } from '@/lib/components/ui/button';
  import { Input } from '@/lib/components/ui/input';
  import { bridgeProps, bridgeBinding } from '@/lib/utils/reactivity-bridge';
  
  // Svelte 5 runes state
  let inputValue = $state('');
  
  function handleSubmit() {
    console.log('Submitted:', inputValue);
  }
</script>

<!-- Using the bridge for simple props -->
<Button {...bridgeProps({ variant: 'default', size: 'default' })} on:click={handleSubmit}>
  Submit
</Button>

<!-- Using the bridge for bound values -->
<Input
  {...bridgeBinding(
    () => inputValue,
    (value) => inputValue = value
  )}
  placeholder="Enter a statement"
/>
```

### Option 2: Component Wrappers

Create wrapper components that mediate between Svelte 5 runes and shadcn components:

```svelte
<!-- src/lib/components/wrapped/Button.svelte -->
<script>
  import { Button as ShadcnButton } from '@/lib/components/ui/button';
  
  // Define props with $props rune
  const { 
    variant = 'default', 
    size = 'default',
    ...restProps 
  } = $props();
</script>

<ShadcnButton {variant} {size} {...restProps}>
  <slot />
</ShadcnButton>
```

Then use these wrappers in your Svelte 5 components:

```svelte
<script>
  import { Button } from '@/lib/components/wrapped/Button.svelte';
  
  function handleClick() {
    console.log('Button clicked');
  }
</script>

<Button variant="default" size="default" on:click={handleClick}>
  Click Me
</Button>
```

## Specific Component Integration Examples

### 1. Button Component

```svelte
<!-- src/lib/components/MythVerifyButton.svelte -->
<script>
  import { Button } from '@/lib/components/ui/button';
  import { Loader2 } from 'lucide-svelte';
  
  // Props using Svelte 5 rune syntax
  const { 
    isVerifying = false, 
    disabled = false 
  } = $props(/** @type {{
    isVerifying?: boolean,
    disabled?: boolean
  }} */);
  
  // Computed class based on state
  const buttonClass = $derived(
    isVerifying ? 'opacity-80' : ''
  );
</script>

<Button 
  type="submit" 
  class={buttonClass} 
  disabled={disabled || isVerifying}
>
  {#if isVerifying}
    <Loader2 class="mr-2 h-4 w-4 animate-spin" />
    Verifying...
  {:else}
    Verify Statement
  {/if}
</Button>
```

### 2. Input/Textarea Integration

```svelte
<!-- src/lib/components/StatementInput.svelte -->
<script>
  import { Textarea } from '@/lib/components/ui/textarea';
  import { Label } from '@/lib/components/ui/label';
  
  // Using Svelte 5 runes for state and props
  const { 
    disabled = false,
    placeholder = 'Enter a statement to verify...'
  } = $props(/** @type {{
    disabled?: boolean,
    placeholder?: string
  }} */);
  
  let value = $state('');
  
  // Create a custom event dispatcher for the input changes
  function dispatchChange() {
    const event = new CustomEvent('change', { detail: value });
    dispatch('change', value);
  }
</script>

<div class="grid w-full gap-1.5">
  <Label for="statement">Statement</Label>
  <Textarea
    id="statement"
    bind:value
    {disabled}
    {placeholder}
    on:change={dispatchChange}
  />
</div>
```

Usage in a parent component:

```svelte
<script>
  import StatementInput from '@/lib/components/StatementInput.svelte';
  
  let statement = $state('');
  
  function handleStatementChange(event) {
    statement = event.detail;
  }
</script>

<StatementInput on:change={handleStatementChange} />
```

### 3. Card Component for Results

```svelte
<!-- src/lib/components/VerdictCard.svelte -->
<script>
  import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter, 
    CardHeader, 
    CardTitle 
  } from '@/lib/components/ui/card';
  import { Check, X, HelpCircle } from 'lucide-svelte';
  
  // Props using Svelte 5 rune syntax
  const { 
    verdict = 'inconclusive',
    explanation = '',
    sources = []
  } = $props(/** @type {{
    verdict: 'true' | 'false' | 'inconclusive',
    explanation: string,
    sources: Array<{title: string, url: string}>
  }} */);
  
  // Derived values using Svelte 5 rune syntax
  const icon = $derived(() => {
    switch (verdict) {
      case 'true': return Check;
      case 'false': return X;
      case 'inconclusive': return HelpCircle;
      default: return HelpCircle;
    }
  });
  
  const verdictTitle = $derived(() => {
    switch (verdict) {
      case 'true': return 'Verdict: True';
      case 'false': return 'Verdict: False';
      case 'inconclusive': return 'Verdict: Inconclusive';
      default: return 'Unknown Verdict';
    }
  });
  
  const cardClass = $derived(() => {
    switch (verdict) {
      case 'true': return 'border-green-500';
      case 'false': return 'border-red-500';
      case 'inconclusive': return 'border-purple-500';
      default: return '';
    }
  });
</script>

<Card class={`w-full ${cardClass}`}>
  <CardHeader>
    <div class="flex items-center gap-2">
      <svelte:component 
        this={icon} 
        class={verdict === 'true' 
          ? 'text-green-500' 
          : verdict === 'false' 
            ? 'text-red-500' 
            : 'text-purple-500'
        } 
      />
      <CardTitle>{verdictTitle}</CardTitle>
    </div>
  </CardHeader>
  
  <CardContent>
    <p>{explanation}</p>
    
    {#if sources.length > 0}
      <div class="mt-4">
        <h4 class="mb-2 font-medium">Sources:</h4>
        <ul class="space-y-1">
          {#each sources as source}
            <li>
              <a 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-blue-600 hover:underline dark:text-blue-400"
              >
                {source.title}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </CardContent>
</Card>
```

## Theme Toggle Implementation

```svelte
<!-- src/lib/components/ThemeToggle.svelte -->
<script>
  import { Button } from '@/lib/components/ui/button';
  import { Sun, Moon } from 'lucide-svelte';
  import { browser } from '$app/environment';
  
  // State using Svelte 5 runes
  let theme = $state(
    browser && localStorage.getItem('theme') || 
    (browser && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  
  // Effect to update the DOM when theme changes
  $effect(() => {
    if (!browser) return;
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  });
  
  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }
</script>

<Button variant="ghost" size="icon" on:click={toggleTheme}>
  {#if theme === 'dark'}
    <Sun class="h-5 w-5" />
    <span class="sr-only">Light mode</span>
  {:else}
    <Moon class="h-5 w-5" />
    <span class="sr-only">Dark mode</span>
  {/if}
</Button>
```

## Form Handling with Svelte 5 and shadcn-svelte

```svelte
<!-- src/lib/components/VerificationForm.svelte -->
<script>
  import { Button } from '@/lib/components/ui/button';
  import { Textarea } from '@/lib/components/ui/textarea';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Loader2 } from 'lucide-svelte';
  
  // State management with runes
  let statement = $state('');
  let isSubmitting = $state(false);
  
  // Computed values
  let isValid = $derived(statement.trim().length > 0);
  let isDisabled = $derived(!isValid || isSubmitting);
  
  // Form submission
  async function handleSubmit() {
    if (isDisabled) return;
    
    isSubmitting = true;
    
    try {
      // Call your verification API
      const result = await verifyStatement(statement);
      
      // Dispatch custom event with result
      const event = new CustomEvent('result', { detail: result });
      dispatch('result', result);
    } catch (error) {
      // Handle error
      console.error('Verification error:', error);
      
      const event = new CustomEvent('error', { detail: error });
      dispatch('error', error);
    } finally {
      isSubmitting = false;
    }
  }
  
  function dispatch(name, detail) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <Card>
    <CardHeader>
      <CardTitle>Verify a Statement</CardTitle>
    </CardHeader>
    
    <CardContent>
      <Textarea
        bind:value={statement}
        placeholder="Enter a statement to verify (e.g., 'Cracking knuckles causes arthritis')"
        disabled={isSubmitting}
        class="min-h-24"
      />
    </CardContent>
    
    <CardFooter>
      <Button type="submit" disabled={isDisabled}>
        {#if isSubmitting}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        {:else}
          Verify Statement
        {/if}
      </Button>
    </CardFooter>
  </Card>
</form>
```

## Known Compatibility Issues and Solutions

| Issue | Description | Solution |
|-------|-------------|----------|
| **Reactive Bindings** | Binding to Svelte 5 rune state may not work as expected | Use explicit `on:change` handlers and updated properties instead of direct bindings |
| **Context API** | Svelte 5's context handling differs from Svelte 4 | Use wrappers that handle context differences or use props-only approach |
| **Event Forwarding** | Event forwarding behavior might change | Use explicit event listeners and custom event dispatching |
| **Default Slots** | Default slot behavior might differ | Be explicit about slot content and avoid complex slot patterns |
| **Transitions** | Animation transitions might need different implementation | Test all transitions carefully and create custom transitions if needed |

## Transition Effects for Verdict Display

Animations are an important part of the Myth Buster app's user experience. Here's how to implement them with compatibility in mind:

```svelte
<!-- src/lib/components/VerdictAnimation.svelte -->
<script>
  import { fly, scale } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  
  const { 
    verdict = 'inconclusive'
  } = $props(/** @type {{
    verdict: 'true' | 'false' | 'inconclusive' | 'error'
  }} */);
  
  // Determine animation based on verdict
  const animation = $derived(() => {
    switch (verdict) {
      case 'true':
        return {
          transition: scale,
          params: { 
            start: 0.8, 
            opacity: 0, 
            duration: 300, 
            easing: elasticOut 
          }
        };
      case 'false':
        return {
          transition: fly,
          params: { 
            y: 20, 
            duration: 400 
          }
        };
      case 'inconclusive':
      default:
        return {
          transition: fly,
          params: { 
            x: -20, 
            duration: 300 
          }
        };
    }
  });
</script>

<div 
  in:animation.transition={animation.params}
  class="w-full"
>
  <slot />
</div>
```

## Custom Hook for shadcn-svelte and Svelte 5 Integration

For more complex compatibility issues, create a custom integration hook:

```typescript
// src/lib/hooks/useShadcnComponent.ts
import { tick } from 'svelte';

type ComponentProps = Record<string, any>;

interface ShadcnHookOptions {
  debounce?: number;
  transformProps?: (props: ComponentProps) => ComponentProps;
}

/**
 * Hook to safely use shadcn-svelte components with Svelte 5 runes
 * @param props Initial props 
 * @param options Configuration options
 * @returns Processed props and utility functions
 */
export function useShadcnComponent(
  props: ComponentProps, 
  options: ShadcnHookOptions = {}
) {
  const { debounce = 0, transformProps } = options;
  
  // Deep clone props to detach from rune reactivity
  const processedProps = structuredClone(props);
  
  // Apply any custom transformations
  const finalProps = transformProps ? transformProps(processedProps) : processedProps;
  
  // Utility to safely update a component's state
  const safeUpdate = async (callback: () => void) => {
    if (debounce > 0) {
      await new Promise(resolve => setTimeout(resolve, debounce));
    }
    
    callback();
    await tick();
  };
  
  return {
    props: finalProps,
    safeUpdate
  };
}
```

Usage example:

```svelte
<script>
  import { useShadcnComponent } from '@/lib/hooks/useShadcnComponent';
  import { Dialog } from '@/lib/components/ui/dialog';
  
  let isOpen = $state(false);
  
  const { props, safeUpdate } = useShadcnComponent({
    open: isOpen,
    onOpenChange: (value) => safeUpdate(() => isOpen = value)
  });
</script>

<Dialog {...props}>
  <!-- Dialog content -->
</Dialog>
```

## Best Practices for the Hackathon

1. **Start with a minimal test**: Before building the full application, create a small test project to verify compatibility of shadcn-svelte with Svelte 5.

2. **Use explicit props**: Avoid spreading props where possible; be explicit about each prop to make debugging easier.

3. **Create simple wrapper components**: For complex components, create simple wrapper components that handle compatibility issues.

4. **Isolate reactivity concerns**: Keep reactivity logic in parent components and pass simple props to shadcn components.

5. **Component inventory**: Create an inventory of which shadcn components you'll need and test each one individually before full integration.

6. **Fallback plan**: Have a fallback plan ready (like using plain Tailwind CSS components) in case of significant compatibility issues.

By following these strategies and guidelines, you can effectively integrate shadcn-svelte with Svelte 5 runes for the Myth Buster app, ensuring a smooth development experience during the hackathon.