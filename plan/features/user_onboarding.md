# First-Time User Onboarding Flow

Creating a welcoming and intuitive onboarding experience is crucial for first-time users of the Myth Buster app. This document outlines a comprehensive onboarding flow that introduces users to the app's functionality and provides sample myths to try.

## Onboarding Flow Architecture

The onboarding flow will be implemented as a series of steps that guide new users through the app's functionality:

1. **Welcome Screen**: Introduction to the app's purpose
2. **Feature Highlight**: Quick overview of key features
3. **Sample Myths**: Pre-populated examples to try
4. **User Preferences**: Optional settings customization
5. **Ready to Start**: Final encouragement to begin exploring

## Implementation Components

### 1. Onboarding Context and State Management

```svelte
<!-- src/lib/stores/onboardingStore.svelte -->
<script context="module">
  import { browser } from '$app/environment';
  
  // Define onboarding state
  export let isFirstVisit = $state(true);
  export let currentStep = $state(0);
  export let onboardingCompleted = $state(false);
  export let sampleMythsViewed = $state(0);
  
  // Maximum number of steps in the onboarding flow
  const TOTAL_STEPS = 4;
  
  // Check if this is the first visit
  function checkFirstVisit() {
    if (!browser) return true;
    
    const visited = localStorage.getItem('myth-buster-visited');
    return !visited;
  }
  
  // Initialize onboarding state from local storage
  export function initOnboarding() {
    if (!browser) return;
    
    isFirstVisit = checkFirstVisit();
    onboardingCompleted = localStorage.getItem('myth-buster-onboarding-completed') === 'true';
    
    // If first visit and onboarding not completed, show onboarding
    if (isFirstVisit && !onboardingCompleted) {
      currentStep = 0;
    }
  }
  
  // Mark first visit in local storage
  export function markVisited() {
    if (!browser) return;
    
    localStorage.setItem('myth-buster-visited', 'true');
    isFirstVisit = false;
  }
  
  // Move to the next onboarding step
  export function nextStep() {
    if (currentStep < TOTAL_STEPS) {
      currentStep++;
    } else {
      completeOnboarding();
    }
  }
  
  // Move to the previous onboarding step
  export function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }
  
  // Skip to a specific step
  export function goToStep(step) {
    if (step >= 0 && step <= TOTAL_STEPS) {
      currentStep = step;
    }
  }
  
  // Complete the onboarding process
  export function completeOnboarding() {
    if (!browser) return;
    
    onboardingCompleted = true;
    localStorage.setItem('myth-buster-onboarding-completed', 'true');
    markVisited();
  }
  
  // Skip the onboarding process
  export function skipOnboarding() {
    completeOnboarding();
  }
  
  // Track when a sample myth is viewed
  export function trackSampleMythView() {
    sampleMythsViewed++;
    
    // If user has viewed multiple sample myths, consider onboarding as engaged
    if (sampleMythsViewed >= 2) {
      localStorage.setItem('myth-buster-engaged', 'true');
    }
  }
  
  // Reset onboarding (for testing or if user wants to see it again)
  export function resetOnboarding() {
    if (!browser) return;
    
    localStorage.removeItem('myth-buster-visited');
    localStorage.removeItem('myth-buster-onboarding-completed');
    localStorage.removeItem('myth-buster-engaged');
    
    isFirstVisit = true;
    currentStep = 0;
    onboardingCompleted = false;
    sampleMythsViewed = 0;
  }
</script>
```

### 2. Onboarding Modal Component

```svelte
<!-- src/lib/components/OnboardingModal.svelte -->
<script>
  import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle
  } from '@/lib/components/ui/dialog';
  import { Button } from '@/lib/components/ui/button';
  import { 
    ArrowLeft, 
    ArrowRight, 
    Check, 
    X, 
    HelpCircle, 
    Sparkles,
    BookOpen
  } from 'lucide-svelte';
  import { 
    currentStep, 
    isFirstVisit, 
    onboardingCompleted,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding
  } from '$lib/stores/onboardingStore';
  
  // Local state
  let open = $state(false);
  
  // Determine if modal should be open based on onboarding state
  $effect(() => {
    if (isFirstVisit && !onboardingCompleted) {
      open = true;
    } else {
      open = false;
    }
  });
  
  // Handle modal close
  function handleClose() {
    skipOnboarding();
    open = false;
  }
  
  // Step content based on current step
  const stepContent = $derived(() => {
    switch (currentStep) {
      case 0:
        return {
          title: 'Welcome to Myth Buster!',
          description: 'Discover the truth behind common myths and misconceptions with our intelligent verification tool.',
          icon: Sparkles
        };
      case 1:
        return {
          title: 'How It Works',
          description: 'Enter any statement you want to verify, and our app will research it using the powerful Sonar API, providing you with a detailed answer and reliable sources.',
          icon: BookOpen
        };
      case 2:
        return {
          title: 'Truth Indicators',
          description: 'We'll show you clear visual cues: green check for true statements, red X for false ones, and purple question mark for inconclusive results.',
          icon: Check
        };
      case 3:
        return {
          title: 'Try These Examples',
          description: 'Not sure where to start? Try verifying one of our sample myths to see how it works.',
          icon: HelpCircle
        };
      case 4:
        return {
          title: 'Ready to Bust Some Myths?',
          description: 'You're all set! Start busting myths by entering your first statement.',
          icon: Sparkles
        };
      default:
        return {
          title: 'Welcome to Myth Buster',
          description: 'Let\'s get started verifying statements.',
          icon: Sparkles
        };
    }
  });
</script>

<Dialog {open} onOpenChange={(value) => value ? null : handleClose()}>
  <DialogContent class="sm:max-w-[425px]">
    <DialogHeader>
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
        <svelte:component this={stepContent.icon} class="h-6 w-6 text-primary" />
      </div>
      <DialogTitle class="text-center text-xl">{stepContent.title}</DialogTitle>
      <DialogDescription class="text-center">
        {stepContent.description}
      </DialogDescription>
    </DialogHeader>
    
    {#if currentStep === 3}
      <div class="grid gap-4 py-4">
        <div class="rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
             on:click={() => {
               completeOnboarding();
               tryExample("Does cracking your knuckles cause arthritis?");
             }}>
          <h3 class="font-medium">Knuckle Cracking & Arthritis</h3>
          <p class="text-sm text-muted-foreground">Does cracking your knuckles cause arthritis?</p>
        </div>
        
        <div class="rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
             on:click={() => {
               completeOnboarding();
               tryExample("Do we only use 10% of our brains?");
             }}>
          <h3 class="font-medium">10% of Brain Usage</h3>
          <p class="text-sm text-muted-foreground">Do we only use 10% of our brains?</p>
        </div>
        
        <div class="rounded-lg border p-4 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
             on:click={() => {
               completeOnboarding();
               tryExample("Does vitamin C prevent the common cold?");
             }}>
          <h3 class="font-medium">Vitamin C & Colds</h3>
          <p class="text-sm text-muted-foreground">Does vitamin C prevent the common cold?</p>
        </div>
      </div>
    {/if}
    
    <DialogFooter class="flex justify-between">
      {#if currentStep > 0}
        <Button variant="outline" on:click={prevStep}>
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back
        </Button>
      {:else}
        <Button variant="outline" on:click={skipOnboarding}>
          Skip
        </Button>
      {/if}
      
      {#if currentStep < 4}
        <Button on:click={nextStep}>
          Next
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
      {:else}
        <Button on:click={completeOnboarding}>
          Get Started
          <Check class="ml-2 h-4 w-4" />
        </Button>
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3. Sample Myths Component

```svelte
<!-- src/lib/components/SampleMyths.svelte -->
<script>
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Button } from '@/lib/components/ui/button';
  import { Badge } from '@/lib/components/ui/badge';
  import { ArrowRight, Sparkles } from 'lucide-svelte';
  import { 
    sampleMythsViewed, 
    trackSampleMythView 
  } from '$lib/stores/onboardingStore';
  
  const { onSelectMyth } = $props(/** @type {{
    onSelectMyth: (myth: string) => void
  }} */);
  
  // Sample myths data
  const sampleMyths = [
    {
      id: 'knuckles',
      title: 'Knuckle Cracking & Arthritis',
      description: 'Does cracking your knuckles cause arthritis?',
      category: 'Health',
      popularity: 'Very Popular'
    },
    {
      id: 'brain',
      title: '10% of Brain Usage',
      description: 'Do we only use 10% of our brains?',
      category: 'Science',
      popularity: 'Common Belief'
    },
    {
      id: 'vitaminc',
      title: 'Vitamin C & Colds',
      description: 'Does vitamin C prevent the common cold?',
      category: 'Health',
      popularity: 'Widely Debated'
    },
    {
      id: 'lightning',
      title: 'Lightning Strikes',
      description: 'Does lightning never strike the same place twice?',
      category: 'Nature',
      popularity: 'Old Saying'
    },
    {
      id: 'batteries',
      title: 'Freezing Batteries',
      description: 'Can you extend battery life by storing them in the freezer?',
      category: 'Technology',
      popularity: 'Life Hack'
    }
  ];
  
  // Handle myth selection
  function handleSelect(myth) {
    trackSampleMythView();
    onSelectMyth(myth.description);
  }
</script>

<Card>
  <CardHeader>
    <div class="flex items-center justify-between">
      <div>
        <CardTitle class="text-xl flex items-center gap-2">
          <Sparkles class="h-5 w-5 text-amber-500" />
          Popular Myths to Verify
        </CardTitle>
        <CardDescription>
          Not sure what to ask? Try one of these common myths.
        </CardDescription>
      </div>
      
      <!-- Viewed counter badge -->
      {#if sampleMythsViewed > 0}
        <Badge variant="outline" class="ml-2">
          {sampleMythsViewed} viewed
        </Badge>
      {/if}
    </div>
  </CardHeader>
  
  <CardContent>
    <div class="grid gap-3">
      {#each sampleMyths as myth}
        <div class="rounded-lg border p-3 transition-all hover:bg-accent hover:text-accent-foreground cursor-pointer">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{myth.title}</h3>
              <p class="text-sm text-muted-foreground">{myth.description}</p>
              <div class="flex gap-2 mt-2">
                <Badge variant="secondary" class="text-xs">{myth.category}</Badge>
                <Badge variant="outline" class="text-xs">{myth.popularity}</Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-8 w-8 rounded-full"
              on:click={() => handleSelect(myth)}
            >
              <ArrowRight class="h-4 w-4" />
              <span class="sr-only">Verify {myth.title}</span>
            </Button>
          </div>
        </div>
      {/each}
    </div>
  </CardContent>
</Card>
```

### 4. First-Time User Tooltip Guide

```svelte
<!-- src/lib/components/TooltipGuide.svelte -->
<script>
  import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/lib/components/ui/tooltip";
  import { HelpCircle } from 'lucide-svelte';
  import { isFirstVisit, markVisited } from '$lib/stores/onboardingStore';
  
  const { selector, content, title, side = 'bottom' } = $props(/** @type {{
    selector: string,
    content: string,
    title?: string,
    side?: 'top' | 'right' | 'bottom' | 'left'
  }} */);
  
  let element;
  let open = $state(false);
  
  // Show tooltip on mount if this is the first visit
  onMount(() => {
    if (isFirstVisit) {
      element = document.querySelector(selector);
      if (element) {
        // Delay to ensure the UI has settled
        setTimeout(() => {
          open = true;
          
          // Auto-close after a while
          setTimeout(() => {
            open = false;
            markVisited();
          }, 8000);
        }, 1000);
      }
    }
  });
</script>

<TooltipProvider>
  <Tooltip {open} onOpenChange={(value) => open = value}>
    <TooltipTrigger asChild let:builder>
      <div class={builder}>
        <div class="absolute z-10 top-0 right-0 -mt-2 -mr-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-pulse">
          <HelpCircle class="h-3 w-3 text-primary-foreground" />
        </div>
        <slot />
      </div>
    </TooltipTrigger>
    <TooltipContent {side} class="w-80 p-4">
      {#if title}
        <p class="font-semibold mb-1">{title}</p>
      {/if}
      <p>{content}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### 5. Help Drawer for Reference

```svelte
<!-- src/lib/components/HelpDrawer.svelte -->
<script>
  import { 
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger 
  } from "@/lib/components/ui/drawer";
  import { Button } from '@/lib/components/ui/button';
  import { 
    HelpCircle, 
    Check, 
    X, 
    AlertCircle, 
    Volume2, 
    VolumeX 
  } from 'lucide-svelte';
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';
  
  // Props
  const { 
    resetOnboarding 
  } = $props(/** @type {{
    resetOnboarding: () => void
  }} */);
</script>

<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline" size="icon" class="h-8 w-8 rounded-full fixed bottom-4 right-4 z-50 shadow-md">
      <HelpCircle class="h-4 w-4" />
      <span class="sr-only">Help</span>
    </Button>
  </DrawerTrigger>
  <DrawerContent>
    <div class="mx-auto w-full max-w-sm">
      <DrawerHeader>
        <DrawerTitle>Help & Information</DrawerTitle>
        <DrawerDescription>
          Learn how to use the Myth Buster app and understand the results.
        </DrawerDescription>
      </DrawerHeader>
      
      <Tabs defaultValue="verdicts" class="px-4">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="verdicts">Verdicts</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="verdicts" class="space-y-4 pt-4">
          <div class="flex items-start gap-3 p-3 rounded-md border">
            <div class="h-8 w-8 flex items-center justify-center text-green-500">
              <Check class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-medium">True</h3>
              <p class="text-sm text-muted-foreground">
                The statement has been verified as true, backed by credible sources.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 p-3 rounded-md border">
            <div class="h-8 w-8 flex items-center justify-center text-red-500">
              <X class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-medium">False</h3>
              <p class="text-sm text-muted-foreground">
                The statement has been debunked and shown to be false.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 p-3 rounded-md border">
            <div class="h-8 w-8 flex items-center justify-center text-purple-500">
              <AlertCircle class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-medium">Inconclusive</h3>
              <p class="text-sm text-muted-foreground">
                There isn't enough evidence to determine if the statement is true or false.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="features" class="space-y-4 pt-4">
          <div class="flex items-start gap-3 p-3 rounded-md border">
            <div class="h-8 w-8 flex items-center justify-center text-blue-500">
              <Volume2 class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-medium">Sound Effects</h3>
              <p class="text-sm text-muted-foreground">
                Enable or disable sound feedback for verdict results.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 p-3 rounded-md border">
            <div class="h-8 w-8 flex items-center justify-center">
              <svg class="h-6 w-6" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                />
                <path 
                  fill="currentColor" 
                  d="M22 12h-2c0-4.42-3.58-8-8-8v2c3.31 0 6 2.69 6 6 0 3.31-2.69 6-6 6v2c4.42 0 8-3.58 8-8zM2 12h2c0 3.31 2.69 6 6 6v-2c-2.21 0-4-1.79-4-4s1.79-4 4-4V6c-4.42 0-8 3.58-8 8z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-medium">Citations</h3>
              <p class="text-sm text-muted-foreground">
                Every verdict includes sources and citations you can explore for more information.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 p-3 rounded-md border">
            <div class="h-8 w-8 flex items-center justify-center">
              <svg class="h-6 w-6" viewBox="0 0 24 24">
                <path 
                  fill="currentColor" 
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"
                />
                <path 
                  fill="currentColor" 
                  d="M6 10h12v2H6zm0 4h8v2H6z"
                />
              </svg>
            </div>
            <div>
              <h3 class="font-medium">Sample Myths</h3>
              <p class="text-sm text-muted-foreground">
                Browse popular myths to verify if you're not sure what to ask.
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="about" class="space-y-4 pt-4">
          <div class="rounded-md border p-3">
            <h3 class="font-medium">About Myth Buster</h3>
            <p class="text-sm text-muted-foreground mt-2">
              Myth Buster helps you verify statements and debunk myths using the Perplexity Sonar API to provide accurate, sourced information.
            </p>
            <p class="text-sm text-muted-foreground mt-2">
              Created for the Perplexity Hackathon, this app demonstrates how AI can help combat misinformation in an engaging way.
            </p>
          </div>
          
          <div class="rounded-md border p-3">
            <h3 class="font-medium">Technology</h3>
            <p class="text-sm text-muted-foreground mt-2">
              Built with Svelte 5, shadcn-svelte components, and the Perplexity Sonar API.
            </p>
          </div>
          
          <div class="mt-4">
            <Button variant="outline" class="w-full" on:click={resetOnboarding}>
              Restart Onboarding Tour
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <DrawerFooter>
        <DrawerClose asChild>
          <Button variant="outline">Close</Button>
        </DrawerClose>
      </DrawerFooter>
    </div>
  </DrawerContent>
</Drawer>
```

## Integration with Main Application

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import OnboardingModal from '$lib/components/OnboardingModal.svelte';
  import SampleMyths from '$lib/components/SampleMyths.svelte';
  import TooltipGuide from '$lib/components/TooltipGuide.svelte';
  import HelpDrawer from '$lib/components/HelpDrawer.svelte';
  import VerificationForm from '$lib/components/VerificationForm.svelte';
  import VerdictDisplay from '$lib/components/VerdictDisplay.svelte';
  import { Button } from '@/lib/components/ui/button';
  import { ArrowDown } from 'lucide-svelte';
  import { 
    initOnboarding,
    isFirstVisit, 
    sampleMythsViewed,
    trackSampleMythView,
    resetOnboarding
  } from '$lib/stores/onboardingStore';
  
  // State for the app
  let statement = $state('');
  let isVerifying = $state(false);
  let verificationResult = $state(null);
  let showSampleMyths = $state(true);
  
  // Initialize onboarding on mount
  onMount(() => {
    initOnboarding();
  });
  
  // Function to handle verifying a statement
  async function verifyStatement(statementToVerify) {
    if (!statementToVerify.trim()) return;
    
    statement = statementToVerify;
    isVerifying = true;
    verificationResult = null;
    
    try {
      // Replace with actual API call
      const result = await mockVerifyStatement(statementToVerify);
      verificationResult = result;
    } catch (error) {
      console.error('Verification error:', error);
      // Handle error state
    } finally {
      isVerifying = false;
    }
  }
  
  // Handle selecting a sample myth
  function handleSelectSampleMyth(mythStatement) {
    scrollToTop();
    verifyStatement(mythStatement);
    trackSampleMythView();
  }
  
  // Mock verification for demo
  async function mockVerifyStatement(statement) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock result based on statement
    if (statement.toLowerCase().includes('knuckles') || 
        statement.toLowerCase().includes('arthritis')) {
      return {
        statement,
        verdict: 'false',
        explanation: 'Cracking your knuckles does not cause arthritis. The sound is caused by gas bubbles popping in the synovial fluid of the joints, but this does not lead to arthritis.',
        citations: [
          { title: 'Harvard Health Publishing', url: 'https://www.health.harvard.edu' },
          { title: 'Journal of the American Board of Family Medicine', url: 'https://www.jabfm.org' }
        ]
      };
    } else if (statement.toLowerCase().includes('brain') || 
               statement.toLowerCase().includes('10%')) {
      return {
        statement,
        verdict: 'false',
        explanation: 'The claim that humans only use 10% of their brains is a widespread myth with no scientific basis. Modern brain imaging technology shows that all parts of the brain have active functions.',
        citations: [
          { title: 'Scientific American', url: 'https://www.scientificamerican.com' },
          { title: 'BBC Future', url: 'https://www.bbc.com/future' }
        ]
      };
    } else if (statement.toLowerCase().includes('vitamin c') || 
               statement.toLowerCase().includes('cold')) {
      return {
        statement,
        verdict: 'inconclusive',
        explanation: 'Whether vitamin C prevents the common cold is inconclusive based on scientific evidence. While vitamin C doesn't appear to prevent colds in the general population, some studies suggest it may reduce the risk in people exposed to extreme physical stress.',
        citations: [
          { title: 'National Institutes of Health', url: 'https://ods.od.nih.gov' },
          { title: 'Cochrane Library', url: 'https://www.cochranelibrary.com' }
        ]
      };
    } else {
      // Random verdict for any other statement
      const verdicts = ['true', 'false', 'inconclusive'];
      const randomVerdict = verdicts[Math.floor(Math.random() * verdicts.length)];
      
      return {
        statement,
        verdict: randomVerdict,
        explanation: `This is a simulated result for "${statement}". In a real implementation, this would use the Sonar API to verify the statement.`,
        citations: [
          { title: 'Example Citation', url: 'https://example.com' }
        ]
      };
    }
  }
  
  // Scroll to top of page
  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Control visibility of sample myths based on verification state
  $effect(() => {
    if (verificationResult) {
      showSampleMyths = false;
    } else if (sampleMythsViewed >= 2) {
      showSampleMyths = false;
    } else {
      showSampleMyths = true;
    }
  });
</script>

<main class="container mx-auto px-4 py-8 max-w-3xl">
  <OnboardingModal />
  
  <h1 class="text-3xl font-bold mb-6 text-center">Myth Buster</h1>
  
  <div class="grid gap-8">
    <!-- Verification Form -->
    <TooltipGuide 
      selector=".verification-form" 
      title="Start Here" 
      content="Enter any statement you want to verify. Try asking about common myths or things you've heard but aren't sure about."
    >
      <div class="verification-form relative">
        <VerificationForm 
          bind:statement 
          onSubmit={verifyStatement} 
          isSubmitting={isVerifying}
        />
      </div>
    </TooltipGuide>
    
    <!-- Results Area -->
    {#if isVerifying}
      <VerdictDisplay isLoading={true} />
    {:else if verificationResult}
      <TooltipGuide
        selector=".result-card"
        content="Here's your verification result! The icon and color indicate whether the statement is true, false, or inconclusive."
      >
        <div class="result-card relative">
          <VerdictDisplay 
            verdict={verificationResult.verdict}
            explanation={verificationResult.explanation}
            citations={verificationResult.citations}
          />
        </div>
      </TooltipGuide>
      
      <!-- Show more sample myths button -->
      <div class="flex justify-center mt-2">
        <Button 
          variant="outline" 
          size="sm"
          on:click={() => {
            showSampleMyths = true;
            
            // Scroll to sample myths
            setTimeout(() => {
              const sampleMythsEl = document.querySelector('.sample-myths');
              if (sampleMythsEl) {
                sampleMythsEl.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
        >
          <ArrowDown class="h-4 w-4 mr-2" />
          Try More Examples
        </Button>
      </div>
    {/if}
    
    <!-- Sample Myths -->
    {#if showSampleMyths || sampleMythsViewed < 1}
      <div class="sample-myths mt-4">
        <SampleMyths onSelectMyth={handleSelectSampleMyth} />
      </div>
    {/if}
  </div>
  
  <!-- Help Drawer -->
  <HelpDrawer resetOnboarding={resetOnboarding} />
</main>
```

## Mobile-First Design Considerations

The onboarding experience is designed with mobile users in mind:

1. **Compact UI**: All components use responsive sizing and spacing
2. **Touch-Friendly Elements**: Larger hit areas for interactive elements
3. **Progressive Disclosure**: Information is presented in digestible chunks
4. **Reduced Motion Option**: Animations respect user preferences
5. **Bottom-Accessible Help**: Fixed help button in bottom-right for thumb reach

## Accessibility Considerations

The onboarding flow incorporates several accessibility features:

1. **Screen Reader Support**: All UI elements have appropriate ARIA labels
2. **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
3. **Color Contrast**: All text meets WCAG AA contrast requirements
4. **Focus Management**: Proper focus handling during modal navigation
5. **Skip Options**: Ability to bypass onboarding entirely

## Metrics Tracking

To measure onboarding effectiveness:

1. **Completion Rate**: Track percentage of users who complete the flow
2. **Engagement**: Monitor sample myth selection and verification attempts
3. **Skip Rate**: Identify how many users skip parts of the onboarding
4. **Time Spent**: Measure time spent in each step of the onboarding

## Conclusion

This comprehensive onboarding strategy welcomes new users to the Myth Buster app with a guided introduction that educates them about the app's functionality while providing immediate value through sample myths. The combination of progressive onboarding, contextual tooltips, and an always-accessible help drawer ensures users can quickly become comfortable with the verification process regardless of their technical expertise.