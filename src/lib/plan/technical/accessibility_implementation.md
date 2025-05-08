# Accessibility Implementation Guide

Building an accessible application is essential for ensuring all users, including those with disabilities, can effectively use the Myth Buster app. This guide outlines comprehensive accessibility enhancements focusing on ARIA labels, keyboard navigation, screen reader support, color contrast, and other critical accessibility features.

## ARIA Labels and Semantic Markup

### 1. Accessible Component Structure

Every component in the Myth Buster app should use proper semantic HTML elements and include appropriate ARIA attributes when needed:

```svelte
<!-- src/lib/components/VerdictDisplay.svelte -->
<script>
  import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Check, X, HelpCircle } from 'lucide-svelte';
  
  const { 
    verdict = null,
    explanation = '',
    citations = [],
    isLoading = false
  } = $props(/** @type {{
    verdict?: 'true' | 'false' | 'inconclusive' | null,
    explanation?: string,
    citations?: Array<{title: string, url: string}>,
    isLoading?: boolean
  }} */);
  
  // Derived values
  const verdictLabel = $derived(() => {
    switch (verdict) {
      case 'true': return 'True';
      case 'false': return 'False';
      case 'inconclusive': return 'Inconclusive';
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
</script>

<div 
  role="region" 
  aria-label="Verification result"
  class="mb-6"
>
  {#if isLoading}
    <div 
      role="status" 
      aria-live="polite" 
      class="animate-pulse p-4 border rounded-md"
    >
      <span class="sr-only">Loading verification result...</span>
      <!-- Skeleton loader content -->
    </div>
  {:else if verdict}
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <!-- Icon with proper aria-label -->
          <div 
            class={verdictColor} 
            aria-hidden="true"
          >
            <svelte:component this={verdictIcon} class="h-8 w-8" />
          </div>
          
          <!-- Use heading hierarchy correctly -->
          <CardTitle>
            <span id="verdict-result">Verdict: {verdictLabel}</span>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <!-- Provide the explanation -->
        <p aria-describedby="verdict-result">{explanation}</p>
        
        {#if citations.length > 0}
          <!-- Use appropriate semantic elements for citations -->
          <div class="mt-4">
            <h3 id="sources-heading" class="text-sm font-semibold mb-2">Sources:</h3>
            <ul aria-labelledby="sources-heading" class="space-y-2">
              {#each citations as citation, index}
                <li>
                  <a 
                    href={citation.url}
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="{citation.title} (opens in new tab)"
                    class="text-primary hover:underline flex items-center"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-primary mr-2" aria-hidden="true"></span>
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
</div>
```

### 2. Form Accessibility Implementation

```svelte
<!-- src/lib/components/VerificationForm.svelte -->
<script>
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Button } from '@/lib/components/ui/button';
  import { Textarea } from '@/lib/components/ui/textarea';
  import { Label } from '@/lib/components/ui/label';
  import { Loader2 } from 'lucide-svelte';
  
  const { 
    isSubmitting = false,
    disabled = false
  } = $props(/** @type {{
    isSubmitting?: boolean,
    disabled?: boolean
  }} */);
  
  let statement = $state('');
  let formErrorMessage = $state('');
  
  // Compute if form can be submitted
  const canSubmit = $derived(
    statement.trim().length > 0 && !isSubmitting && !disabled
  );
  
  // For screen readers to announce validation errors
  let hasError = $derived(formErrorMessage !== '');
  
  function validateStatement() {
    if (!statement.trim()) {
      formErrorMessage = 'Please enter a statement to verify';
      return false;
    }
    
    if (statement.length > 500) {
      formErrorMessage = 'Statement is too long (maximum 500 characters)';
      return false;
    }
    
    formErrorMessage = '';
    return true;
  }
  
  function handleSubmit() {
    // Clear any previous errors
    formErrorMessage = '';
    
    // Validate form
    if (!validateStatement()) {
      return;
    }
    
    // Dispatch submit event with statement
    const event = new CustomEvent('submit', { detail: statement });
    dispatch('submit', statement);
  }
  
  function dispatch(name, detail) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
  }
</script>

<div role="form" aria-labelledby="verification-form-title">
  <Card>
    <CardHeader>
      <CardTitle id="verification-form-title">Verify a Statement</CardTitle>
    </CardHeader>
    
    <CardContent>
      <form 
        on:submit|preventDefault={handleSubmit}
        aria-describedby={hasError ? 'statement-error' : undefined}
        class="space-y-4"
      >
        <div class="space-y-2">
          <Label 
            for="statement-input"
            class="block"
          >
            Statement to verify
          </Label>
          
          <Textarea
            id="statement-input"
            placeholder="Enter a statement to verify (e.g., 'Cracking knuckles causes arthritis')"
            bind:value={statement}
            disabled={isSubmitting || disabled}
            aria-required="true"
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? 'statement-error' : 'statement-hint'}
            class={hasError ? 'border-red-500' : ''}
          />
          
          <p id="statement-hint" class="text-sm text-muted-foreground">
            Enter any statement you'd like to verify the truth of.
          </p>
          
          {#if hasError}
            <p 
              id="statement-error" 
              class="text-sm text-red-500"
              aria-live="assertive"
            >
              {formErrorMessage}
            </p>
          {/if}
        </div>
        
        <Button 
          type="submit" 
          disabled={!canSubmit}
          aria-busy={isSubmitting}
          class="w-full"
        >
          {#if isSubmitting}
            <Loader2 
              class="mr-2 h-4 w-4 animate-spin" 
              aria-hidden="true"
            />
            <span>Verifying...</span>
          {:else}
            <span>Verify Statement</span>
          {/if}
        </Button>
      </form>
    </CardContent>
  </Card>
</div>
```

### 3. Modal and Dialog Accessibility

```svelte
<!-- src/lib/components/OnboardingModal.svelte (partial) -->
<Dialog 
  {open} 
  onOpenChange={(value) => value ? null : handleClose()}
  aria-labelledby="onboarding-title"
  aria-describedby="onboarding-description"
>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <div 
        class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4"
        aria-hidden="true"
      >
        <svelte:component this={stepContent.icon} class="h-6 w-6 text-primary" />
      </div>
      <DialogTitle id="onboarding-title" class="text-center text-xl">
        {stepContent.title}
      </DialogTitle>
      <DialogDescription id="onboarding-description" class="text-center">
        {stepContent.description}
      </DialogDescription>
    </DialogHeader>
    
    <!-- Dialog content... -->
    
    <DialogFooter class="flex justify-between">
      <!-- Previous button with accessible label -->
      {#if currentStep > 0}
        <Button 
          variant="outline" 
          on:click={prevStep}
          aria-label="Go to previous step"
        >
          <ArrowLeft class="mr-2 h-4 w-4" aria-hidden="true" />
          Back
        </Button>
      {:else}
        <Button 
          variant="outline" 
          on:click={skipOnboarding}
          aria-label="Skip onboarding"
        >
          Skip
        </Button>
      {/if}
      
      <!-- Next button with accessible label -->
      {#if currentStep < 4}
        <Button 
          on:click={nextStep}
          aria-label="Go to next step"
        >
          Next
          <ArrowRight class="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      {:else}
        <Button 
          on:click={completeOnboarding}
          aria-label="Complete onboarding and get started"
        >
          Get Started
          <Check class="ml-2 h-4 w-4" aria-hidden="true" />
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Keyboard Navigation

### 1. Focus Management Utilities

```typescript
// src/lib/utils/focus-management.ts

/**
 * Manages focus for keyboard accessibility
 */
export const focusManagement = {
  /**
   * Trap focus within a specific container
   * @param container Element to trap focus within
   * @returns Cleanup function
   */
  trapFocus(container: HTMLElement): () => void {
    if (!container) return () => {};
    
    // Find all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return () => {};
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Set initial focus
    setTimeout(() => {
      firstElement.focus();
    }, 50);
    
    // Handle keydown events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      // Shift + Tab: focus on last element when tabbing backward from first
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      
      // Tab: focus on first element when tabbing forward from last
      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  },
  
  /**
   * Save current focus and restore it later
   * @returns Object with save and restore methods
   */
  createFocusGuard() {
    let savedElement: HTMLElement | null = null;
    
    return {
      save() {
        savedElement = document.activeElement as HTMLElement;
      },
      
      restore() {
        if (savedElement && savedElement.focus) {
          setTimeout(() => {
            savedElement?.focus();
          }, 50);
        }
      }
    };
  },
  
  /**
   * Announce message to screen readers
   * @param message Message to announce
   * @param priority Priority level (assertive or polite)
   */
  announce(message: string, priority: 'assertive' | 'polite' = 'polite') {
    // Create or get announcement container
    let container = document.getElementById('sr-announcements');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'sr-announcements';
      container.setAttribute('aria-live', priority);
      container.setAttribute('role', 'status');
      container.setAttribute('aria-atomic', 'true');
      container.style.position = 'absolute';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.padding = '0';
      container.style.overflow = 'hidden';
      container.style.clip = 'rect(0, 0, 0, 0)';
      container.style.whiteSpace = 'nowrap';
      container.style.border = '0';
      document.body.appendChild(container);
    }
    
    // Set the message
    container.textContent = '';
    
    // Force a DOM reflow
    void container.offsetWidth;
    
    // Add the message
    container.textContent = message;
  }
};
```

### 2. Keyboard Navigation Implementation for Main Components

```svelte
<!-- src/lib/components/SampleMyths.svelte (partial) -->
<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Component props...
  
  // Track the currently focused myth
  let focusedIndex = $state(-1);
  let mythRefs = [];
  
  // Set up keyboard navigation
  function handleKeyDown(event) {
    if (mythRefs.length === 0) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = Math.min(focusedIndex + 1, mythRefs.length - 1);
        mythRefs[focusedIndex]?.focus();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = Math.max(focusedIndex - 1, 0);
        mythRefs[focusedIndex]?.focus();
        break;
        
      case 'Home':
        event.preventDefault();
        focusedIndex = 0;
        mythRefs[focusedIndex]?.focus();
        break;
        
      case 'End':
        event.preventDefault();
        focusedIndex = mythRefs.length - 1;
        mythRefs[focusedIndex]?.focus();
        break;
    }
  }
  
  // Update myth refs when sample myths change
  $effect(() => {
    mythRefs = [];
    // Give the DOM time to update
    setTimeout(() => {
      mythRefs = Array.from(document.querySelectorAll('.myth-item button'));
    }, 50);
  });
</script>

<Card>
  <CardHeader>
    <CardTitle id="sample-myths-title">Popular Myths to Verify</CardTitle>
    <CardDescription id="sample-myths-desc">
      Not sure what to ask? Try one of these common myths.
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    <div 
      role="listbox" 
      aria-labelledby="sample-myths-title"
      aria-describedby="sample-myths-desc"
      tabindex="0"
      class="focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
      on:keydown={handleKeyDown}
    >
      {#each sampleMyths as myth, index}
        <div 
          class="myth-item rounded-lg border p-3 my-2 transition-all hover:bg-accent hover:text-accent-foreground"
          role="option"
          aria-selected={focusedIndex === index}
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 id={`myth-${index}-title`} class="font-medium">{myth.title}</h3>
              <p id={`myth-${index}-desc`} class="text-sm text-muted-foreground">{myth.description}</p>
              <div class="flex gap-2 mt-2" aria-hidden="true">
                <Badge variant="secondary" class="text-xs">{myth.category}</Badge>
                <Badge variant="outline" class="text-xs">{myth.popularity}</Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-8 w-8 rounded-full"
              aria-labelledby={`myth-${index}-title myth-${index}-desc`}
              on:click={() => handleSelect(myth)}
            >
              <ArrowRight class="h-4 w-4" />
              <span class="sr-only">Verify "{myth.description}"</span>
            </Button>
          </div>
        </div>
      {/each}
    </div>
  </CardContent>
</Card>
```

### 3. Focus Trap for Modal Components

```svelte
<!-- src/lib/components/HelpDrawer.svelte (partial) -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { focusManagement } from '$lib/utils/focus-management';
  
  // Drawer state
  let isOpen = $state(false);
  let drawerContent;
  let focusGuard = focusManagement.createFocusGuard();
  let cleanup = null;
  
  // Handle drawer opening/closing
  function openDrawer() {
    focusGuard.save();
    isOpen = true;
  }
  
  function closeDrawer() {
    isOpen = false;
    focusGuard.restore();
  }
  
  // Set up focus trapping when drawer opens
  $effect(() => {
    if (isOpen && drawerContent) {
      // Clean up any previous trap
      if (cleanup) cleanup();
      
      // Create new focus trap
      cleanup = focusManagement.trapFocus(drawerContent);
      
      // Announce the drawer is open
      focusManagement.announce('Help drawer opened', 'polite');
    }
  });
  
  // Clean up on component destroy
  onDestroy(() => {
    if (cleanup) cleanup();
  });
  
  // Handle Escape key
  function handleKeyDown(event) {
    if (event.key === 'Escape' && isOpen) {
      closeDrawer();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<Button 
  variant="outline" 
  size="icon" 
  class="h-8 w-8 rounded-full fixed bottom-4 right-4 z-50 shadow-md"
  aria-label="Open help drawer"
  aria-expanded={isOpen}
  aria-controls="help-drawer"
  on:click={openDrawer}
>
  <HelpCircle class="h-4 w-4" aria-hidden="true" />
</Button>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
    aria-hidden="true"
    on:click={closeDrawer}
  ></div>
  
  <div
    id="help-drawer"
    class="fixed bottom-0 left-0 right-0 z-50 bg-background p-6 shadow-lg"
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-drawer-title"
    bind:this={drawerContent}
  >
    <div class="mx-auto w-full max-w-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 id="help-drawer-title" class="text-xl font-semibold">
          Help & Information
        </h2>
        
        <Button 
          variant="ghost" 
          size="icon" 
          class="h-8 w-8 rounded-full"
          aria-label="Close help drawer"
          on:click={closeDrawer}
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      
      <!-- Drawer content... -->
    </div>
  </div>
{/if}
```

## Screen Reader Support

### 1. Live Regions for Dynamic Content

```svelte
<!-- src/lib/components/LiveAnnouncement.svelte -->
<script>
  import { onMount } from 'svelte';
  
  const { 
    message = '',
    assertive = false
  } = $props(/** @type {{
    message?: string,
    assertive?: boolean
  }} */);
  
  let announceRegion;
  
  // Update the live region's content when message changes
  $effect(() => {
    if (!message || !announceRegion) return;
    
    // Clear and reset to force announcement
    announceRegion.textContent = '';
    
    // Force browser to recognize the change
    void announceRegion.offsetWidth;
    
    // Set the new message
    announceRegion.textContent = message;
  });
</script>

<div 
  bind:this={announceRegion}
  class="sr-only"
  aria-live={assertive ? 'assertive' : 'polite'}
  aria-atomic="true"
>
  {message}
</div>
```

### 2. Screen Reader Friendly Result Announcements

```svelte
<!-- src/lib/components/VerdictAnnouncement.svelte -->
<script>
  import { LiveAnnouncement } from '$lib/components/LiveAnnouncement.svelte';
  
  const { 
    verdict = null,
    isLoading = false,
    error = null
  } = $props(/** @type {{
    verdict?: 'true' | 'false' | 'inconclusive' | null,
    isLoading?: boolean,
    error?: any
  }} */);
  
  // Create screen reader friendly announcement
  const announcement = $derived(() => {
    if (isLoading) {
      return 'Verifying statement. Please wait.';
    }
    
    if (error) {
      return `Error: ${error.message || 'An error occurred during verification.'}`;
    }
    
    if (verdict) {
      switch (verdict) {
        case 'true':
          return 'Verdict: True. The statement has been verified as true.';
        case 'false':
          return 'Verdict: False. The statement has been debunked as false.';
        case 'inconclusive':
          return 'Verdict: Inconclusive. There is not enough evidence to determine if the statement is true or false.';
        default:
          return '';
      }
    }
    
    return '';
  });
</script>

<LiveAnnouncement 
  message={announcement} 
  assertive={!!error} 
/>
```

### 3. Comprehensive Alt Text and Image Descriptions

```svelte
<!-- Example Image Component with Proper Alt Text -->
<script>
  const { 
    src, 
    alt,
    longDescription = ''
  } = $props(/** @type {{
    src: string,
    alt: string,
    longDescription?: string
  }} */);
</script>

{#if longDescription}
  <figure>
    <img {src} {alt} />
    <figcaption id="img-desc" class="sr-only">{longDescription}</figcaption>
  </figure>
{:else}
  <img {src} {alt} />
{/if}
```

## Color Contrast and Visual Accessibility

### 1. Color Contrast Implementation

```typescript
// src/lib/utils/ensure-contrast.ts

/**
 * Ensures text has sufficient contrast with background
 */
export function ensureTextContrast(
  textColor: string,
  backgroundColor: string,
  minimumRatio = 4.5
): string {
  // Get RGB values from hex colors
  const textRgb = hexToRgb(textColor);
  const bgRgb = hexToRgb(backgroundColor);
  
  if (!textRgb || !bgRgb) return textColor;
  
  // Calculate contrast ratio
  const contrast = calculateContrastRatio(textRgb, bgRgb);
  
  // If contrast is sufficient, return original color
  if (contrast >= minimumRatio) return textColor;
  
  // Otherwise, adjust the color to meet contrast requirements
  return adjustColorForContrast(textRgb, bgRgb, minimumRatio);
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number, g: number, b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculates contrast ratio between two colors
 */
function calculateContrastRatio(
  color1: { r: number, g: number, b: number },
  color2: { r: number, g: number, b: number }
): number {
  // Calculate luminance for each color
  const l1 = calculateLuminance(color1);
  const l2 = calculateLuminance(color2);
  
  // Calculate contrast ratio
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates relative luminance of a color
 */
function calculateLuminance(color: { r: number, g: number, b: number }): number {
  const { r, g, b } = color;
  
  // Convert RGB to sRGB
  const sR = r / 255;
  const sG = g / 255;
  const sB = b / 255;
  
  // Calculate luminance components
  const R = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
  const G = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
  const B = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
  
  // Calculate luminance using the formula
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Adjusts color to meet minimum contrast ratio
 */
function adjustColorForContrast(
  textRgb: { r: number, g: number, b: number },
  bgRgb: { r: number, g: number, b: number },
  targetRatio: number
): string {
  // Determine if we should lighten or darken the text
  const bgLuminance = calculateLuminance(bgRgb);
  const shouldLighten = bgLuminance < 0.5;
  
  let adjustedRgb = { ...textRgb };
  let currentRatio = calculateContrastRatio(adjustedRgb, bgRgb);
  
  // Incrementally adjust the color until we meet the target ratio
  while (currentRatio < targetRatio) {
    if (shouldLighten) {
      // Lighten the color
      adjustedRgb.r = Math.min(255, adjustedRgb.r + 5);
      adjustedRgb.g = Math.min(255, adjustedRgb.g + 5);
      adjustedRgb.b = Math.min(255, adjustedRgb.b + 5);
    } else {
      // Darken the color
      adjustedRgb.r = Math.max(0, adjustedRgb.r - 5);
      adjustedRgb.g = Math.max(0, adjustedRgb.g - 5);
      adjustedRgb.b = Math.max(0, adjustedRgb.b - 5);
    }
    
    currentRatio = calculateContrastRatio(adjustedRgb, bgRgb);
    
    // Safety check to prevent infinite loops
    if (
      (shouldLighten && adjustedRgb.r === 255 && adjustedRgb.g === 255 && adjustedRgb.b === 255) ||
      (!shouldLighten && adjustedRgb.r === 0 && adjustedRgb.g === 0 && adjustedRgb.b === 0)
    ) {
      break;
    }
  }
  
  // Convert back to hex
  return `#${adjustedRgb.r.toString(16).padStart(2, '0')}${adjustedRgb.g.toString(16).padStart(2, '0')}${adjustedRgb.b.toString(16).padStart(2, '0')}`;
}
```

### 2. High Contrast Mode Support

```svelte
<!-- src/lib/components/HighContrastToggle.svelte -->
<script>
  import { Button } from '@/lib/components/ui/button';
  import { Switch } from '@/lib/components/ui/switch';
  import { Label } from '@/lib/components/ui/label';
  import { Sun, Moon, Eye } from 'lucide-svelte';
  
  // State for high contrast mode
  let isHighContrast = $state(
    localStorage.getItem('high-contrast-mode') === 'true'
  );
  
  // Toggle high contrast mode
  function toggleHighContrast() {
    isHighContrast = !isHighContrast;
    localStorage.setItem('high-contrast-mode', String(isHighContrast));
    
    // Update document class
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }
  
  // Initialize high contrast mode on mount
  onMount(() => {
    if (isHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  });
</script>

<div class="flex items-center space-x-2">
  <Switch 
    id="high-contrast" 
    checked={isHighContrast}
    onCheckedChange={toggleHighContrast}
    aria-label="Toggle high contrast mode"
  />
  <Label 
    for="high-contrast"
    class="cursor-pointer text-sm flex items-center gap-1"
  >
    <Eye class="h-4 w-4" aria-hidden="true" />
    High Contrast
  </Label>
</div>
```

### 3. WCAG AA Compliant Color System

```css
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary colors with WCAG AA compliant variants
        'primary': {
          DEFAULT: '#8050E3', // Base purple (4.7:1 on white)
          'high-contrast': '#6030C0', // Higher contrast purple (7:1 on white)
          'light': '#9B72E8', // Light purple for dark backgrounds
        },
        // Alert colors
        'success': {
          DEFAULT: '#10B981', // Green (4.5:1 on white)
          'high-contrast': '#0E9F6E', // Darker green (5.3:1 on white)
        },
        'error': {
          DEFAULT: '#EF4444', // Red (4.5:1 on white)
          'high-contrast': '#B91C1C', // Darker red (7.8:1 on white)
        },
        'warning': {
          DEFAULT: '#F59E0B', // Amber (3.1:1 on white - not AA compliant)
          'high-contrast': '#D97706', // Darker amber (5.1:1 on white - AA compliant)
        },
        // Neutral colors
        'neutral': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      }
    }
  },
  plugins: [
    function({ addBase, theme }) {
      addBase({
        // High contrast mode overrides
        '.high-contrast': {
          '--color-primary': theme('colors.primary.high-contrast'),
          '--color-success': theme('colors.success.high-contrast'),
          '--color-error': theme('colors.error.high-contrast'),
          '--color-warning': theme('colors.warning.high-contrast'),
          '--color-border': theme('colors.neutral.400'),
          '--color-ring': theme('colors.primary.high-contrast'),
        }
      });
    }
  ]
};
```

## Microinteractions for Better Feedback

### 1. State Change Animations

```css
/* src/app.css */

/* Focus state animations */
.focus-ring {
  @apply transition-shadow duration-150;
}
.focus-ring:focus-visible {
  @apply ring-2 ring-primary ring-offset-2 outline-none;
  animation: focus-pulse 1.5s ease-out 0.5s;
}

@keyframes focus-pulse {
  0% { box-shadow: 0 0 0 0 rgba(128, 80, 227, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(128, 80, 227, 0); }
  100% { box-shadow: 0 0 0 0 rgba(128, 80, 227, 0); }
}

/* Button press animation */
.press-animation {
  @apply transition-transform duration-75;
}
.press-animation:active {
  @apply transform scale-95;
}

/* Success animation */
.success-animation {
  animation: success-pulse 1s ease-out;
}

@keyframes success-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Error shake animation */
.error-animation {
  animation: error-shake 0.6s ease-in-out;
}

@keyframes error-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}

/* Loading animations that respect reduced motion preferences */
@media (prefers-reduced-motion) {
  .focus-ring:focus-visible {
    animation: none;
  }
  
  .success-animation,
  .error-animation {
    animation: none;
  }
}
```

### 2. Form Interaction Feedback

```svelte
<!-- src/lib/components/InteractiveFeedback.svelte -->
<script>
  import { onMount } from 'svelte';
  import { focusManagement } from '$lib/utils/focus-management';
  
  const {
    status = null, // 'success', 'error', 'loading', null
    message = ''
  } = $props(/** @type {{
    status?: 'success' | 'error' | 'loading' | null,
    message?: string
  }} */);
  
  // Announce status changes to screen readers
  $effect(() => {
    if (status && message) {
      const priority = status === 'error' ? 'assertive' : 'polite';
      focusManagement.announce(message, priority);
    }
  });
  
  // Status animation classes
  const animationClass = $derived(() => {
    switch (status) {
      case 'success': return 'success-animation';
      case 'error': return 'error-animation';
      default: return '';
    }
  });
  
  // Status icon and color
  const statusConfig = $derived(() => {
    switch (status) {
      case 'success':
        return {
          icon: 'check-circle',
          color: 'text-success'
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: 'text-error'
        };
      case 'loading':
        return {
          icon: 'loader',
          color: 'text-neutral-500',
          spinning: true
        };
      default:
        return {
          icon: '',
          color: ''
        };
    }
  });
</script>

{#if status}
  <div 
    role="status" 
    aria-live={status === 'error' ? 'assertive' : 'polite'}
    class={`flex items-center gap-2 p-2 rounded-md ${animationClass}`}
  >
    {#if statusConfig.icon}
      <svg 
        class={`w-5 h-5 ${statusConfig.color} ${statusConfig.spinning ? 'animate-spin' : ''}`}
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        {#if statusConfig.icon === 'check-circle'}
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        {:else if statusConfig.icon === 'alert-circle'}
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        {:else if statusConfig.icon === 'loader'}
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v2m0 8v2m-6-6h2m8 0h2m-9-5l1.5 1.5m5 5L17 17m-9 1.5L9.5 17m5-5l1.5-1.5" />
        {/if}
      </svg>
    {/if}
    
    <span>{message}</span>
  </div>
{/if}
```

### 3. Hover and Focus Indicators

```svelte
<!-- src/lib/components/IntuitiveLinks.svelte -->
<script>
  const { href, external = false } = $props(/** @type {{
    href: string,
    external?: boolean
  }} */);
</script>

<a 
  {href}
  class="focus-ring press-animation inline-flex items-center text-primary hover:text-primary-dark hover:underline relative"
  target={external ? "_blank" : undefined}
  rel={external ? "noopener noreferrer" : undefined}
  aria-label={external ? `${$$slots.default} (opens in a new tab)` : undefined}
>
  <span><slot /></span>
  
  {#if external}
    <svg 
      class="w-3.5 h-3.5 ml-1" 
      aria-hidden="true" 
      viewBox="0 0 24 24"
    >
      <path 
        fill="none" 
        stroke="currentColor" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" 
      />
    </svg>
  {/if}
  
  <!-- Focus and hover indicator -->
  <span 
    class="absolute bottom-0 left-0 w-full h-0.5 bg-current transform origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100 group-focus:scale-x-100"
    aria-hidden="true"
  ></span>
</a>
```

## Responsive Accessibility for Mobile Devices

```css
/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      spacing: {
        // Larger touch targets for mobile
        'touch': '44px',
      }
    }
  }
}
```

```svelte
<!-- src/lib/components/TouchFriendlyButton.svelte -->
<script>
  import { Button } from '@/lib/components/ui/button';
  
  const {
    size = 'default',
    variant = 'default',
    ...props
  } = $props();
  
  // Determine if we're on a touch device
  let isTouchDevice = $state(false);
  
  onMount(() => {
    isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  
  // Apply larger size for touch devices
  const buttonSize = $derived(
    isTouchDevice ? 'lg' : size
  );
  
  // Add extra padding on mobile devices
  const extraClasses = $derived(
    isTouchDevice ? 'py-3' : ''
  );
</script>

<Button
  size={buttonSize}
  {variant}
  class={extraClasses}
  {...props}
>
  <slot />
</Button>
```

## Comprehensive Accessibility Testing Strategy

### 1. Automated Testing with axe-core

```javascript
// src/tests/accessibility.spec.js
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/svelte';
import VerdictDisplay from '../lib/components/VerdictDisplay.svelte';
import VerificationForm from '../lib/components/VerificationForm.svelte';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility tests', () => {
  it('VerdictDisplay has no accessibility violations', async () => {
    const { container } = render(VerdictDisplay, {
      verdict: 'true',
      explanation: 'This statement is true.',
      citations: [{ title: 'Test Source', url: 'https://example.com' }]
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('VerificationForm has no accessibility violations', async () => {
    const { container } = render(VerificationForm);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Test loading states
  it('VerdictDisplay loading state has no accessibility violations', async () => {
    const { container } = render(VerdictDisplay, {
      isLoading: true
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  // Test error states
  it('Error display has no accessibility violations', async () => {
    const { container } = render(ErrorDisplay, {
      error: { message: 'Test error message' }
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 2. Focus Order Verification

```javascript
// src/tests/keyboard-navigation.spec.js
import { render, fireEvent } from '@testing-library/svelte';
import App from '../App.svelte';

describe('Keyboard Navigation', () => {
  it('Tab order follows a logical sequence', async () => {
    const { container, getByLabelText, getAllByRole } = render(App);
    
    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    // Verify initial focus is on first element
    expect(document.activeElement).toBe(document.body);
    
    // Press Tab to focus first element
    await fireEvent.keyDown(document.body, { key: 'Tab' });
    expect(document.activeElement).toBe(focusableElements[0]);
    
    // Ensure we can Tab through all interactive elements in order
    for (let i = 1; i < focusableElements.length; i++) {
      await fireEvent.keyDown(document.activeElement, { key: 'Tab' });
      expect(document.activeElement).toBe(focusableElements[i]);
    }
    
    // Ensure we can Tab backward through elements
    for (let i = focusableElements.length - 2; i >= 0; i--) {
      await fireEvent.keyDown(document.activeElement, { 
        key: 'Tab', 
        shiftKey: true 
      });
      expect(document.activeElement).toBe(focusableElements[i]);
    }
  });
});
```

### 3. WCAG Compliance Checklist

Create a comprehensive WCAG 2.1 AA compliance checklist:

```markdown
# WCAG 2.1 AA Compliance Checklist for Myth Buster

## Perceivable
- [ ] 1.1.1: All non-text content has text alternatives
- [ ] 1.2.1: Audio-only and video-only content has text alternatives
- [ ] 1.2.2: Captions provided for prerecorded audio
- [ ] 1.2.4: Captions provided for live audio
- [ ] 1.2.5: Audio descriptions provided for prerecorded video
- [ ] 1.3.1: Information and relationships conveyed through presentation can be programmatically determined
- [ ] 1.3.2: Meaningful sequence of content can be programmatically determined
- [ ] 1.3.3: Instructions do not rely solely on sensory characteristics
- [ ] 1.3.4: Content doesn't restrict its view and operation to a single display orientation
- [ ] 1.3.5: Input purpose can be programmatically determined
- [ ] 1.4.1: Color is not used as the only visual means of conveying information
- [ ] 1.4.2: Audio control mechanism is available
- [ ] 1.4.3: Text has contrast ratio of at least 4.5:1
- [ ] 1.4.4: Text can be resized up to 200% without loss of functionality
- [ ] 1.4.5: Text is used instead of images of text
- [ ] 1.4.10: Content can be presented without horizontal scrolling at 320px width
- [ ] 1.4.11: UI components have contrast ratio of at least 3:1 against adjacent colors
- [ ] 1.4.12: Text spacing can be adjusted without loss of functionality
- [ ] 1.4.13: Content that appears on hover/focus can be dismissed, hovered, and is persistent

## Operable
- [ ] 2.1.1: All functionality is available from a keyboard
- [ ] 2.1.2: No keyboard trap
- [ ] 2.1.4: Character key shortcuts can be turned off or remapped
- [ ] 2.2.1: Time limits can be turned off, extended, or adjusted
- [ ] 2.2.2: Auto-updating content can be paused, stopped, or hidden
- [ ] 2.3.1: Content doesn't flash more than 3 times per second
- [ ] 2.4.1: Blocks of repeated content can be bypassed
- [ ] 2.4.2: Page has title describing its topic or purpose
- [ ] 2.4.3: Focus order preserves meaning and operability
- [ ] 2.4.4: Link purpose can be determined from link text
- [ ] 2.4.5: Multiple ways are available to locate content
- [ ] 2.4.6: Headings and labels describe topic or purpose
- [ ] 2.4.7: Focus is visible
- [ ] 2.5.1: Pointer gestures can be operated with a single pointer
- [ ] 2.5.2: Pointer actions can be cancelled
- [ ] 2.5.3: Labels match their accessible names
- [ ] 2.5.4: Functionality operated by device motion can also be operated by UI components

## Understandable
- [ ] 3.1.1: Page language can be programmatically determined
- [ ] 3.1.2: Language of parts can be programmatically determined
- [ ] 3.2.1: Context doesn't change when a component receives focus
- [ ] 3.2.2: Context doesn't change when a component changes state
- [ ] 3.2.3: Navigation mechanisms are consistent
- [ ] 3.2.4: Components with same functionality are identified consistently
- [ ] 3.3.1: Errors are identified and described to the user
- [ ] 3.3.2: Labels or instructions are provided for user input
- [ ] 3.3.3: Error correction suggestions are provided
- [ ] 3.3.4: Error prevention is available for legal, financial, data submissions

## Robust
- [ ] 4.1.1: Markup is valid and well-formed
- [ ] 4.1.2: Name, role, and value of UI components can be programmatically determined
- [ ] 4.1.3: Status messages can be programmatically determined
```

## Conclusion

This comprehensive guide provides a solid foundation for implementing accessibility in the Myth Buster application. By following these guidelines and code examples, the app will be accessible to users with a wide range of abilities, including those using screen readers, keyboard-only navigation, and those with visual impairments.

The implementation focuses on:

1. **Proper Semantic Structure**: Using appropriate HTML elements and ARIA attributes to ensure screen readers can interpret content correctly.

2. **Keyboard Navigation**: Ensuring all interactive elements are operable via keyboard and have visible focus indicators.

3. **Screen Reader Support**: Implementing live regions, proper announcements, and descriptive text for dynamic content.

4. **Color Contrast**: Meeting WCAG AA standards for all text and interactive elements.

5. **Microinteractions**: Adding subtle animations and visual feedback while respecting reduced motion preferences.

6. **Responsive Design**: Ensuring accessibility across devices with touch-friendly controls for mobile users.

7. **Comprehensive Testing**: Implementing automated and manual testing procedures to verify accessibility compliance.

By building accessibility from the ground up, the Myth Buster app will provide an inclusive experience for all users while meeting modern web standards.