# Microinteractions for Enhanced User Feedback

Microinteractions are subtle animations and visual feedback mechanisms that improve user experience by providing immediate response to user actions. This document outlines how to implement engaging microinteractions throughout the Myth Buster app while ensuring accessibility and performance.

## Core Microinteraction Principles

1. **Subtlety**: Animations should be gentle and not distracting from the core content
2. **Purpose**: Each microinteraction should serve a clear purpose, not just decoration
3. **Consistency**: Similar actions should have similar feedback patterns
4. **Performance**: Animations should be optimized to prevent jank or frame drops
5. **Accessibility**: All animations should respect user preferences for reduced motion
6. **Timing**: Durations should be appropriate - too fast feels abrupt, too slow feels laggy

## Verdict Reveal Animations

The verdict reveal is a key moment in the user experience. These animations help emphasize the result while creating a memorable moment.

### 1. True Verdict Animation

```svelte
<!-- src/lib/components/animations/TrueAnimation.svelte -->
<script>
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  
  // Reference to the container element
  let container;
  
  // Animation properties
  const INITIAL_SCALE = 0.5;
  const FINAL_SCALE = 1;
  const DURATION = 600; // ms
  
  // Animation implementation
  function animateIn() {
    if (!container) return;
    
    // Initial state
    container.style.opacity = '0';
    container.style.transform = `scale(${INITIAL_SCALE})`;
    
    // Force a reflow to ensure initial state is applied
    void container.offsetWidth;
    
    // Animate to final state
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const easedProgress = cubicOut(progress);
      
      const currentScale = INITIAL_SCALE + (FINAL_SCALE - INITIAL_SCALE) * easedProgress;
      const currentOpacity = progress;
      
      container.style.opacity = String(currentOpacity);
      container.style.transform = `scale(${currentScale})`;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }
  
  onMount(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Just show without animation if user prefers reduced motion
      container.style.opacity = '1';
      container.style.transform = 'scale(1)';
    } else {
      animateIn();
    }
  });
</script>

<div 
  bind:this={container}
  class="flex items-center justify-center text-green-500 transition-transform"
>
  <slot />
</div>
```

### 2. False Verdict Animation

```svelte
<!-- src/lib/components/animations/FalseAnimation.svelte -->
<script>
  import { onMount } from 'svelte';
  
  // Reference to the container element
  let container;
  
  // Animation properties
  const DURATION = 500; // ms
  const SHAKE_DISTANCE = 6; // px
  
  // Animation implementation
  function animateIn() {
    if (!container) return;
    
    // Initial state
    container.style.opacity = '0';
    
    // Force a reflow to ensure initial state is applied
    void container.offsetWidth;
    
    // Fade in
    container.style.opacity = '1';
    
    // Shake effect after fade in
    setTimeout(() => {
      // Check if element still exists
      if (!container) return;
      
      // Define keyframes for shake effect
      const keyframes = [
        { transform: 'translateX(0)' },
        { transform: `translateX(${SHAKE_DISTANCE}px)` },
        { transform: `translateX(-${SHAKE_DISTANCE}px)` },
        { transform: `translateX(${SHAKE_DISTANCE / 2}px)` },
        { transform: `translateX(-${SHAKE_DISTANCE / 2}px)` },
        { transform: 'translateX(0)' }
      ];
      
      const timing = {
        duration: DURATION,
        easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        iterations: 1
      };
      
      container.animate(keyframes, timing);
    }, 100);
  }
  
  onMount(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Just show without animation if user prefers reduced motion
      container.style.opacity = '1';
    } else {
      animateIn();
    }
  });
</script>

<div 
  bind:this={container}
  class="flex items-center justify-center text-red-500"
>
  <slot />
</div>
```

### 3. Inconclusive Verdict Animation

```svelte
<!-- src/lib/components/animations/InconclusiveAnimation.svelte -->
<script>
  import { onMount } from 'svelte';
  
  // Reference to the container element
  let container;
  
  // Animation properties
  const DURATION = 1500; // ms
  const PULSE_SCALE = 1.15;
  
  // Animation implementation
  function animateIn() {
    if (!container) return;
    
    // Initial state
    container.style.opacity = '0';
    
    // Force a reflow to ensure initial state is applied
    void container.offsetWidth;
    
    // Fade in
    container.style.opacity = '1';
    
    // Pulse effect after fade in
    setTimeout(() => {
      // Check if element still exists
      if (!container) return;
      
      // Define keyframes for pulse effect
      const keyframes = [
        { transform: 'scale(1)', opacity: 0.7 },
        { transform: `scale(${PULSE_SCALE})`, opacity: 1 },
        { transform: 'scale(1)', opacity: 0.7 }
      ];
      
      const timing = {
        duration: DURATION,
        easing: 'ease-in-out',
        iterations: Infinity
      };
      
      container.animate(keyframes, timing);
    }, 100);
  }
  
  onMount(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Just show without animation if user prefers reduced motion
      container.style.opacity = '1';
    } else {
      animateIn();
    }
  });
  
  // Clean up animation on component destroy
  onDestroy(() => {
    if (container && container.getAnimations) {
      container.getAnimations().forEach(animation => animation.cancel());
    }
  });
</script>

<div 
  bind:this={container}
  class="flex items-center justify-center text-purple-500"
>
  <slot />
</div>
```

## Form Interaction Feedback

Form elements should provide immediate feedback to user interactions to create a responsive feel.

### 1. Button Animation

```svelte
<!-- src/lib/components/ui/animated-button.svelte -->
<script>
  import { Button } from '@/lib/components/ui/button';
  
  // Inherit props from Button
  const {
    variant = 'default',
    size = 'default',
    disabled = false,
    class: className = ''
  } = $props();
  
  // Local state for animation
  let isPressed = $state(false);
  
  // Handle mouse events
  function handleMouseDown() {
    isPressed = true;
  }
  
  function handleMouseUp() {
    isPressed = false;
  }
  
  // Handle touch events
  function handleTouchStart() {
    isPressed = true;
  }
  
  function handleTouchEnd() {
    isPressed = false;
  }
  
  // For accessibility - handle keyboard events
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      isPressed = true;
    }
  }
  
  function handleKeyUp(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      isPressed = false;
    }
  }
  
  // Calculate dynamic classes
  const dynamicClasses = $derived(() => {
    const classes = [
      'transition-all duration-200',
      'active:scale-95',
      'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
    ];
    
    if (isPressed && !disabled) {
      classes.push('scale-95');
    }
    
    return classes.join(' ');
  });
</script>

<Button
  {variant}
  {size}
  {disabled}
  class={`${dynamicClasses} ${className}`}
  on:mousedown={handleMouseDown}
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseUp}
  on:touchstart={handleTouchStart}
  on:touchend={handleTouchEnd}
  on:keydown={handleKeyDown}
  on:keyup={handleKeyUp}
  {...$$restProps}
>
  <slot />
</Button>
```

### 2. Input Focus Effects

```svelte
<!-- src/lib/components/ui/animated-input.svelte -->
<script>
  import { Input } from '@/lib/components/ui/input';
  
  const {
    disabled = false,
    class: className = ''
  } = $props();
  
  let isFocused = $state(false);
  
  function handleFocus() {
    isFocused = true;
  }
  
  function handleBlur() {
    isFocused = false;
  }
  
  // Calculate dynamic classes
  const dynamicClasses = $derived(() => {
    const classes = [
      'transition-all duration-200 ease-out',
      'focus-visible:ring-offset-2',
      'border-b-2 border-transparent'
    ];
    
    if (isFocused && !disabled) {
      classes.push('border-b-primary');
    }
    
    return classes.join(' ');
  });
</script>

<div class="relative">
  <Input
    {disabled}
    class={`${dynamicClasses} ${className}`}
    on:focus={handleFocus}
    on:blur={handleBlur}
    {...$$restProps}
  />
  
  {#if isFocused && !disabled}
    <div 
      class="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-expandFromCenter"
      aria-hidden="true"
    ></div>
  {/if}
</div>

<style>
  @keyframes expandFromCenter {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
  
  .animate-expandFromCenter {
    animation: expandFromCenter 0.2s ease-out forwards;
    transform-origin: center;
  }
  
  @media (prefers-reduced-motion) {
    .animate-expandFromCenter {
      animation: none;
      transform: scaleX(1);
    }
  }
</style>
```

### 3. Custom Checkbox Animation

```svelte
<!-- src/lib/components/ui/animated-checkbox.svelte -->
<script>
  import { Checkbox } from '@/lib/components/ui/checkbox';
  import { cubicOut } from 'svelte/easing';
  
  const {
    checked = false,
    disabled = false,
    onCheckedChange = undefined
  } = $props();
  
  // Local state for animation
  let isAnimating = $state(false);
  let prevChecked = $state(checked);
  
  // Handle change
  function handleChange(value) {
    if (disabled) return;
    
    // Skip animation if no change
    if (prevChecked === value) return;
    
    prevChecked = value;
    isAnimating = true;
    
    // Reset animation flag after animation completes
    setTimeout(() => {
      isAnimating = false;
    }, 400);
    
    // Forward change to parent
    if (onCheckedChange) {
      onCheckedChange(value);
    }
  }
  
  // Calculate dynamic classes
  const animationClass = $derived(() => {
    if (!isAnimating) return '';
    
    return checked ? 'animate-checkbox-check' : 'animate-checkbox-uncheck';
  });
</script>

<div class={isAnimating ? 'pointer-events-none' : ''}>
  <Checkbox
    {checked}
    {disabled}
    onCheckedChange={handleChange}
    class={`transition-all duration-200 ${animationClass}`}
    {...$$restProps}
  />
</div>

<style>
  @keyframes checkbox-check {
    0% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes checkbox-uncheck {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(0.9);
      opacity: 0.6;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-checkbox-check {
    animation: checkbox-check 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }
  
  .animate-checkbox-uncheck {
    animation: checkbox-uncheck 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
  }
  
  @media (prefers-reduced-motion) {
    .animate-checkbox-check, .animate-checkbox-uncheck {
      animation: none;
    }
  }
</style>
```

## Loading State Animations

Loading states should be visually engaging while clearly communicating that the app is working.

### 1. Typing Indicator Animation

```svelte
<!-- src/lib/components/animations/TypingIndicator.svelte -->
<script>
  const { visible = true } = $props(/** @type {{
    visible?: boolean
  }} */);
</script>

{#if visible}
  <div
    class="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/10"
    role="status"
    aria-label="Verifying statement, please wait"
  >
    <div class="dot-animation w-2 h-2 rounded-full bg-primary"></div>
    <div class="dot-animation w-2 h-2 rounded-full bg-primary animation-delay-200"></div>
    <div class="dot-animation w-2 h-2 rounded-full bg-primary animation-delay-400"></div>
  </div>
{/if}

<style>
  @keyframes dotPulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.5;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
  
  .dot-animation {
    animation: dotPulse 1.5s infinite;
  }
  
  .animation-delay-200 {
    animation-delay: 0.2s;
  }
  
  .animation-delay-400 {
    animation-delay: 0.4s;
  }
  
  @media (prefers-reduced-motion) {
    .dot-animation {
      animation: none;
    }
  }
</style>
```

### 2. Results Loading Animation

```svelte
<!-- src/lib/components/animations/ResultsLoader.svelte -->
<script>
  const { 
    text = 'Checking facts...',
    speedMs = 2000
  } = $props(/** @type {{
    text?: string,
    speedMs?: number
  }} */);
  
  // List of different loading messages to cycle through
  const loadingTexts = [
    'Checking facts...',
    'Researching sources...',
    'Analyzing evidence...',
    'Consulting experts...',
    'Reviewing literature...',
    'Verifying claims...'
  ];
  
  // State for current message
  let currentIndex = $state(
    text === 'Checking facts...' ? 0 : loadingTexts.indexOf(text)
  );
  let currentText = $derived(
    loadingTexts[currentIndex >= 0 ? currentIndex : 0]
  );
  
  // Cycle through messages
  let interval;
  
  onMount(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % loadingTexts.length;
      }, speedMs);
    }
  });
  
  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center justify-center p-4">
  <div class="relative w-12 h-12 mb-4">
    <div class="absolute inset-0 border-2 border-primary/30 rounded-full"></div>
    <div class="absolute inset-0 border-2 border-primary rounded-full border-opacity-90 animate-spin-slow" style="border-top-color: transparent;"></div>
  </div>
  
  <div 
    class="text-center animate-fade-in-out"
    aria-live="polite"
    role="status"
  >
    {currentText}
  </div>
</div>

<style>
  @keyframes spin-slow {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes fade-in-out {
    0%, 100% {
      opacity: 0.7;
    }
    50% {
      opacity: 1;
    }
  }
  
  .animate-spin-slow {
    animation: spin-slow 1.5s linear infinite;
  }
  
  .animate-fade-in-out {
    animation: fade-in-out 2s ease-in-out infinite;
  }
  
  @media (prefers-reduced-motion) {
    .animate-spin-slow {
      animation: none;
    }
    
    .animate-fade-in-out {
      opacity: 1;
      animation: none;
    }
  }
</style>
```

## Success and Error Feedback

Providing clear feedback for success and error states helps users understand the outcome of their actions.

### 1. Success Feedback Animation

```svelte
<!-- src/lib/components/animations/SuccessFeedback.svelte -->
<script>
  import { onMount } from 'svelte';
  import { Check } from 'lucide-svelte';
  
  const { 
    message = 'Success!',
    duration = 2000,
    onComplete = () => {}
  } = $props(/** @type {{
    message?: string,
    duration?: number,
    onComplete?: () => void
  }} */);
  
  let isVisible = $state(false);
  
  onMount(() => {
    // Start the animation sequence
    setTimeout(() => {
      isVisible = true;
      
      // Auto-hide after duration
      setTimeout(() => {
        isVisible = false;
        
        // Wait for hide animation to complete
        setTimeout(onComplete, 300);
      }, duration);
    }, 50);
  });
</script>

<div 
  class={`fixed top-4 right-4 flex items-center gap-3 px-4 py-3 bg-green-100 border border-green-300 rounded-lg shadow-lg transition-all duration-300 z-50 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-[-20px]'}`}
  role="status"
  aria-live="polite"
>
  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-success">
    <Check class="text-white h-5 w-5" />
  </div>
  
  <p class="text-green-800">{message}</p>
</div>

<style>
  @keyframes success-bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
  
  .animate-success {
    animation: success-bounce 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  @media (prefers-reduced-motion) {
    .animate-success {
      animation: none;
    }
  }
</style>
```

### 2. Error Feedback Animation

```svelte
<!-- src/lib/components/animations/ErrorFeedback.svelte -->
<script>
  import { onMount } from 'svelte';
  import { AlertTriangle } from 'lucide-svelte';
  
  const { 
    message = 'An error occurred',
    duration = 4000,
    onComplete = () => {}
  } = $props(/** @type {{
    message?: string,
    duration?: number,
    onComplete?: () => void
  }} */);
  
  let isVisible = $state(false);
  let container;
  
  onMount(() => {
    // Start the animation sequence
    setTimeout(() => {
      isVisible = true;
      
      // Apply shake animation
      if (container) {
        const keyframes = [
          { transform: 'translateX(0)' },
          { transform: 'translateX(-5px)' },
          { transform: 'translateX(5px)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' }
        ];
        
        const timing = {
          duration: 500,
          easing: 'ease-in-out'
        };
        
        container.animate(keyframes, timing);
      }
      
      // Auto-hide after duration
      setTimeout(() => {
        isVisible = false;
        
        // Wait for hide animation to complete
        setTimeout(onComplete, 300);
      }, duration);
    }, 50);
  });
</script>

<div 
  bind:this={container}
  class={`fixed top-4 right-4 flex items-center gap-3 px-4 py-3 bg-red-100 border border-red-300 rounded-lg shadow-lg transition-all duration-300 z-50 ${isVisible ? 'opacity-100 transform-none' : 'opacity-0 translate-y-[-20px]'}`}
  role="alert"
  aria-live="assertive"
>
  <div class="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
    <AlertTriangle class="text-white h-5 w-5" />
  </div>
  
  <p class="text-red-800">{message}</p>
</div>
```

## Interactive Elements Feedback

Interactive elements should provide immediate feedback when hovered or focused to improve usability.

### 1. Ripple Effect for Clickable Items

```svelte
<!-- src/lib/components/animations/RippleEffect.svelte -->
<script>
  import { onMount } from 'svelte';
  
  let element;
  
  // Create ripple effect on element
  function createRipple(event) {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    const rect = element.getBoundingClientRect();
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const diameter = Math.max(rect.width, rect.height) * 2;
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.left = `${x - diameter / 2}px`;
    ripple.style.top = `${y - diameter / 2}px`;
    ripple.style.backgroundColor = 'currentColor';
    ripple.style.borderRadius = '50%';
    ripple.style.opacity = '0.2';
    ripple.style.transform = 'scale(0)';
    ripple.style.transition = 'transform 0.6s, opacity 0.6s';
    ripple.style.pointerEvents = 'none';
    
    // Add to element
    element.appendChild(ripple);
    
    // Force a reflow
    void ripple.offsetWidth;
    
    // Start animation
    ripple.style.transform = 'scale(1)';
    
    // Remove after animation
    setTimeout(() => {
      ripple.style.opacity = '0';
      
      setTimeout(() => {
        if (element.contains(ripple)) {
          element.removeChild(ripple);
        }
      }, 600);
    }, 600);
  }
  
  function handleClick(event) {
    createRipple(event);
  }
  
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      // Get element center for keyboard users
      const rect = element.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
      
      createRipple({ clientX: rect.left + x, clientY: rect.top + y });
    }
  }
  
  onMount(() => {
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
  });
</script>

<div 
  bind:this={element}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  class="relative overflow-hidden"
>
  <slot />
</div>
```

### 2. Hover Cards with Animation

```svelte
<!-- src/lib/components/animations/AnimatedHoverCard.svelte -->
<script>
  import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
  } from "@/lib/components/ui/hover-card";
  
  const { 
    side = 'right'
  } = $props(/** @type {{
    side?: 'top' | 'right' | 'bottom' | 'left'
  }} */);
  
  // Track when card is open
  let isOpen = $state(false);
  
  // Calculate animation class based on side
  const animationClass = $derived(() => {
    if (!isOpen) return '';
    
    switch (side) {
      case 'top': return 'animate-slide-down-fade';
      case 'right': return 'animate-slide-left-fade';
      case 'bottom': return 'animate-slide-up-fade';
      case 'left': return 'animate-slide-right-fade';
      default: return 'animate-fade-in';
    }
  });
</script>

<HoverCard 
  openDelay={100} 
  closeDelay={200}
  onOpenChange={(open) => isOpen = open}
>
  <HoverCardTrigger>
    <slot name="trigger" />
  </HoverCardTrigger>
  
  <HoverCardContent 
    {side} 
    class={animationClass}
    sideOffset={5}
  >
    <slot />
  </HoverCardContent>
</HoverCard>

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slide-up-fade {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-down-fade {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-left-fade {
    from { opacity: 0; transform: translateX(4px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-right-fade {
    from { opacity: 0; transform: translateX(-4px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
  
  .animate-slide-up-fade {
    animation: slide-up-fade 0.2s ease-out;
  }
  
  .animate-slide-down-fade {
    animation: slide-down-fade 0.2s ease-out;
  }
  
  .animate-slide-left-fade {
    animation: slide-left-fade 0.2s ease-out;
  }
  
  .animate-slide-right-fade {
    animation: slide-right-fade 0.2s ease-out;
  }
  
  @media (prefers-reduced-motion) {
    .animate-fade-in,
    .animate-slide-up-fade,
    .animate-slide-down-fade,
    .animate-slide-left-fade,
    .animate-slide-right-fade {
      animation: none;
    }
  }
</style>
```

## Page Transitions

Smooth transitions between app states can greatly enhance the perceived performance and user experience.

### 1. Content Transition Component

```svelte
<!-- src/lib/components/animations/ContentTransition.svelte -->
<script>
  import { onMount } from 'svelte';
  
  const {
    type = 'fade',
    duration = 300,
    disabled = false
  } = $props(/** @type {{
    type?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'zoom',
    duration?: number,
    disabled?: boolean
  }} */);
  
  // Transition container reference
  let container;
  
  // Track if mounted to avoid initial animation
  let isMounted = $state(false);
  
  // Handle changes to slot content
  let previousContent = '';
  let currentContent = '';
  
  onMount(() => {
    // Save initial content
    if (container) {
      currentContent = container.innerHTML;
    }
    isMounted = true;
  });
  
  // Watch for content changes
  $effect(() => {
    if (!container || !isMounted || disabled) return;
    
    // Check for content changes
    const newContent = container.innerHTML;
    if (newContent === currentContent) return;
    
    // Content has changed, animate transition
    previousContent = currentContent;
    currentContent = newContent;
    
    // Apply animation based on type
    animateTransition();
  });
  
  function animateTransition() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    
    let keyframes;
    
    switch (type) {
      case 'fade':
        keyframes = [
          { opacity: 0 },
          { opacity: 1 }
        ];
        break;
        
      case 'slide-up':
        keyframes = [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ];
        break;
        
      case 'slide-down':
        keyframes = [
          { opacity: 0, transform: 'translateY(-20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ];
        break;
        
      case 'slide-left':
        keyframes = [
          { opacity: 0, transform: 'translateX(20px)' },
          { opacity: 1, transform: 'translateX(0)' }
        ];
        break;
        
      case 'slide-right':
        keyframes = [
          { opacity: 0, transform: 'translateX(-20px)' },
          { opacity: 1, transform: 'translateX(0)' }
        ];
        break;
        
      case 'zoom':
        keyframes = [
          { opacity: 0, transform: 'scale(0.95)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
        break;
        
      default:
        keyframes = [
          { opacity: 0 },
          { opacity: 1 }
        ];
    }
    
    const options = {
      duration: duration,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'forwards'
    };
    
    container.animate(keyframes, options);
  }
</script>

<div bind:this={container} class="w-full">
  <slot />
</div>
```

### 2. TabsSwitchTransition

```svelte
<!-- src/lib/components/animations/TabSwitchTransition.svelte -->
<script>
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/components/ui/tabs";
  
  const {
    value = '',
    items = [],
    containerClass = ''
  } = $props(/** @type {{
    value: string,
    items: Array<{id: string, label: string}>,
    containerClass?: string
  }} */);
  
  // Track previous and current tab for animation direction
  let previousTab = $state(value);
  let currentTab = $state(value);
  
  // Determine animation direction when tab changes
  $effect(() => {
    if (value !== currentTab) {
      previousTab = currentTab;
      currentTab = value;
    }
  });
  
  // Determine if we should animate right or left
  const animationDirection = $derived(() => {
    if (!items.length) return 'right';
    
    const prevIndex = items.findIndex(item => item.id === previousTab);
    const currIndex = items.findIndex(item => item.id === currentTab);
    
    if (prevIndex === -1 || currIndex === -1) return 'right';
    
    return prevIndex < currIndex ? 'right' : 'left';
  });
  
  // Get animation class based on direction
  const getAnimationClass = (tabId) => {
    if (tabId !== currentTab && tabId !== previousTab) return '';
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return '';
    
    if (tabId === currentTab) {
      return animationDirection === 'right' 
        ? 'animate-slide-in-right' 
        : 'animate-slide-in-left';
    } else {
      return animationDirection === 'right' 
        ? 'animate-slide-out-left' 
        : 'animate-slide-out-right';
    }
  };
</script>

<Tabs value={currentTab} class={containerClass}>
  <TabsList>
    {#each items as item}
      <TabsTrigger value={item.id}>{item.label}</TabsTrigger>
    {/each}
  </TabsList>
  
  {#each items as item}
    <TabsContent 
      value={item.id}
      class={getAnimationClass(item.id)}
    >
      <slot name={item.id} />
    </TabsContent>
  {/each}
</Tabs>

<style>
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(10%); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-10%); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-out-right {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(10%); }
  }
  
  @keyframes slide-out-left {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-10%); }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out forwards;
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 0.3s ease-out forwards;
  }
  
  .animate-slide-out-right {
    animation: slide-out-right 0.3s ease-out forwards;
  }
  
  .animate-slide-out-left {
    animation: slide-out-left 0.3s ease-out forwards;
  }
  
  @media (prefers-reduced-motion) {
    .animate-slide-in-right,
    .animate-slide-in-left,
    .animate-slide-out-right,
    .animate-slide-out-left {
      animation: none;
    }
  }
</style>
```

## Sound Effects (Optional)

Sound effects can add another dimension to microinteractions, but must be used sparingly and respectfully.

```svelte
<!-- src/lib/components/SoundEffects.svelte -->
<script>
  import { onMount } from 'svelte';
  
  const {
    enabled = true
  } = $props(/** @type {{
    enabled?: boolean
  }} */);
  
  // Create a class to manage sounds
  class SoundEffects {
    constructor(enabled = true) {
      this.enabled = enabled;
      this.sounds = {};
      this.audioContext = null;
    }
    
    initialize() {
      // Create audio context on first interaction
      if (!this.audioContext && typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext();
      }
      
      // Preload common sounds
      this.preloadSound('true', '/sounds/true.mp3');
      this.preloadSound('false', '/sounds/false.mp3');
      this.preloadSound('inconclusive', '/sounds/inconclusive.mp3');
      this.preloadSound('click', '/sounds/click.mp3');
    }
    
    preloadSound(id, url) {
      if (!this.audioContext) return;
      
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          this.sounds[id] = audioBuffer;
        })
        .catch(error => {
          console.error('Error loading sound:', error);
        });
    }
    
    playSound(id, volume = 0.5) {
      if (!this.enabled || !this.audioContext || !this.sounds[id]) return;
      
      // Resume audio context if it's suspended (browser policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[id];
      
      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume;
      
      // Connect nodes and play
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
    }
    
    setEnabled(enabled) {
      this.enabled = enabled;
    }
  }
  
  // Create instance
  let soundEffects;
  
  onMount(() => {
    soundEffects = new SoundEffects(enabled);
    
    // Initialize on first user interaction
    const handleInteraction = () => {
      soundEffects.initialize();
      document.removeEventListener('click', handleInteraction);
    };
    
    document.addEventListener('click', handleInteraction);
    
    return () => {
      document.removeEventListener('click', handleInteraction);
    };
  });
  
  // Update enabled state when prop changes
  $effect(() => {
    if (soundEffects) {
      soundEffects.setEnabled(enabled);
    }
  });
  
  // Expose sound player to parent components
  export function playSound(id, volume = 0.5) {
    if (soundEffects) {
      soundEffects.playSound(id, volume);
    }
  }
</script>
```

## Integrating Animations with the Verification Flow

Here's how to tie these microinteractions together in the main verification flow:

```svelte
<!-- src/lib/components/VerificationCard.svelte -->
<script>
  import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { AnimatedButton } from '@/lib/components/ui/animated-button.svelte';
  import { ContentTransition } from '@/lib/components/animations/ContentTransition.svelte';
  import { ResultsLoader } from '@/lib/components/animations/ResultsLoader.svelte';
  import { TrueAnimation } from '@/lib/components/animations/TrueAnimation.svelte';
  import { FalseAnimation } from '@/lib/components/animations/FalseAnimation.svelte';
  import { InconclusiveAnimation } from '@/lib/components/animations/InconclusiveAnimation.svelte';
  import { Check, X, HelpCircle } from 'lucide-svelte';
  import { SoundEffects } from '@/lib/components/SoundEffects.svelte';
  
  const {
    isLoading = false,
    verdict = null,
    explanation = '',
    citations = [],
    soundEnabled = true
  } = $props(/** @type {{
    isLoading?: boolean,
    verdict?: 'true' | 'false' | 'inconclusive' | null,
    explanation?: string,
    citations?: Array<{title: string, url: string}>,
    soundEnabled?: boolean
  }} */);
  
  // Reference to sound effects
  let soundEffects;
  
  // Play sound when verdict arrives
  $effect(() => {
    if (verdict && soundEffects && soundEnabled) {
      switch (verdict) {
        case 'true':
          soundEffects.playSound('true', 0.4);
          break;
        case 'false':
          soundEffects.playSound('false', 0.4);
          break;
        case 'inconclusive':
          soundEffects.playSound('inconclusive', 0.3);
          break;
      }
    }
  });
  
  // Get appropriate animation component based on verdict
  const getVerdictAnimation = () => {
    switch (verdict) {
      case 'true': return TrueAnimation;
      case 'false': return FalseAnimation;
      case 'inconclusive': return InconclusiveAnimation;
      default: return null;
    }
  };
  
  // Get appropriate icon component based on verdict
  const getVerdictIcon = () => {
    switch (verdict) {
      case 'true': return Check;
      case 'false': return X;
      case 'inconclusive': return HelpCircle;
      default: return null;
    }
  };
  
  // Get title based on verdict
  const getVerdictTitle = () => {
    switch (verdict) {
      case 'true': return 'Verified True';
      case 'false': return 'Debunked: False';
      case 'inconclusive': return 'Inconclusive Evidence';
      default: return '';
    }
  };
</script>

<SoundEffects 
  enabled={soundEnabled} 
  bind:this={soundEffects} 
/>

<Card>
  <CardHeader>
    <ContentTransition type="fade" duration={300}>
      {#if isLoading}
        <div class="flex justify-center items-center h-12">
          <ResultsLoader />
        </div>
      {:else if verdict}
        <div class="flex items-center gap-3">
          <svelte:component this={getVerdictAnimation()}>
            <svelte:component this={getVerdictIcon()} class="h-8 w-8" />
          </svelte:component>
          
          <CardTitle>{getVerdictTitle()}</CardTitle>
        </div>
      {/if}
    </ContentTransition>
  </CardHeader>
  
  <CardContent>
    <ContentTransition type="slide-up" duration={400}>
      {#if isLoading}
        <div class="animate-pulse space-y-2">
          <div class="h-4 bg-muted rounded w-full"></div>
          <div class="h-4 bg-muted rounded w-full"></div>
          <div class="h-4 bg-muted rounded w-5/6"></div>
        </div>
      {:else if verdict}
        <div class="space-y-4">
          <p class="text-base">{explanation}</p>
          
          {#if citations.length > 0}
            <div class="mt-4">
              <h3 class="text-sm font-semibold mb-2">Sources:</h3>
              <ul class="space-y-2">
                {#each citations as citation, index}
                  <li style="animation-delay: {index * 100}ms" class="animate-fade-in">
                    <a 
                      href={citation.url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="text-primary hover:underline flex items-center"
                      on:click={() => soundEffects?.playSound('click', 0.2)}
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                      {citation.title}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      {/if}
    </ContentTransition>
  </CardContent>
</Card>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
    opacity: 0;
  }
  
  @media (prefers-reduced-motion) {
    .animate-fade-in {
      animation: none;
      opacity: 1;
    }
  }
</style>
```

## Performance Optimization

To ensure animations remain smooth, especially on lower-end devices:

1. **Use CSS transforms and opacity**: These properties are GPU-accelerated and perform better than animating dimensions or positions.

2. **Avoid layout thrashing**: Batch DOM reads and writes to prevent forcing reflows.

3. **Use requestAnimationFrame**: For JavaScript animations, always use requestAnimationFrame for optimal performance.

4. **Implement throttling for frequent events**: For events like scroll or resize, use throttling to limit how often animations are triggered.

5. **Lazy-load animation components**: Only load animation components when needed to reduce initial page load.

## Conclusion

These microinteractions provide subtle, meaningful feedback throughout the Myth Buster app, creating a more engaging and responsive experience for users. Each animation has been designed to serve a specific purpose while maintaining accessibility and performance.

Key points to remember:

1. **Purpose-driven**: Every animation communicates something meaningful to the user
2. **Subtle**: Animations are gentle enough not to distract from content
3. **Consistent**: Similar actions have similar animations across the app
4. **Accessibility-focused**: All animations respect reduced motion preferences
5. **Progressive enhancement**: The app works without animations, which are added as an enhancement
6. **Performance-optimized**: Animations are implemented with performance in mind

By implementing these microinteractions, the Myth Buster app will feel more polished, responsive, and enjoyable to use.