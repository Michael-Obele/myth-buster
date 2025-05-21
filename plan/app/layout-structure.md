# Layout and Structure Plan

## Responsive Layout Design

### Desktop Layout (≥ 1024px)

- **Two-Column Layout** for results view:
  - Left column (60%): Main myth analysis and verdict
  - Right column (40%): Citations, related myths, and additional context
- **Single-Column Layout** for input form with centered alignment
- **Maximum width container** (1200px) with auto margins for centered content
- **Sticky navigation elements** at the top for easy access to common actions

### Tablet Layout (768px - 1023px)

- **Flexible Single-Column Layout** with optimized spacing
- **Modal/Dialog approach** for secondary information (citations, etc.)
- **Collapsible sections** for longer content
- **Side drawer navigation** triggered by hamburger menu

### Mobile Layout (< 768px)

- **Stacked Layout** with prioritized content
- **Bottom sheet interactions** for auxiliary features
- **Reduced animations** for performance
- **Touch-optimized hit areas** for all interactive elements
- **Fixed action buttons** at the bottom of the screen

## Component Structure Organization

### Page Structure

```
App Container
├── Navigation Bar
│   ├── Brand/Logo
│   ├── Theme Toggle
│   ├── History Button
│   └── Settings Menu
├── Main Content Area
│   ├── Input Form View
│   │   ├── Myth Input
│   │   └── Submit Button
│   └── Results View
│       ├── Verdict Section
│       │   ├── Verdict Badge
│       │   ├── Confidence Meter
│       │   └── Share Options
│       ├── Explanation Section
│       │   ├── Explanation Text
│       │   └── Interactive Citations
│       └── Additional Context
│           ├── Myth Origin
│           └── Related Information
└── Footer
    ├── Action Buttons
    └── Attribution
```

### Modular Component Breakdown

1. **`MythInput.svelte`**
   - Text input with validation
   - Voice input option
   - Submit button
   - Trending suggestions

2. **`VerdictDisplay.svelte`**
   - Verdict badge (True/False/Inconclusive)
   - Animated verdict icon
   - Confidence meter visualization
   - Timestamp

3. **`ExplanationDisplay.svelte`**
   - Formatted explanation text
   - Interactive citation links
   - Text highlighting
   - Copy functionality

4. **`CitationList.svelte`**
   - Citation cards with preview
   - Source credibility indicators
   - External link handling
   - Sorting options

5. **`RelatedMyths.svelte`**
   - Similar myths suggestions
   - Category grouping
   - Quick verification links

6. **`ShareOptions.svelte`**
   - Social sharing buttons
   - Link generation
   - Embed code option
   - Download as image/PDF

7. **`HistoryTimeline.svelte`**
   - Chronological list of past verifications
   - Filtering options
   - Bookmark functionality
   - Clear history option

## Layout Implementation Example

```svelte
<script lang="ts">
  import { Sidebar } from '$lib/components/ui/sidebar';
  import { Sheet } from '$lib/components/ui/sheet';
  import { Tabs } from '$lib/components/ui/tabs';
  import MythInput from './MythInput.svelte';
  import VerdictDisplay from './VerdictDisplay.svelte';
  import ExplanationDisplay from './ExplanationDisplay.svelte';
  import CitationList from './CitationList.svelte';
  import RelatedMyths from './RelatedMyths.svelte';
  import { HistoryIcon, MenuIcon } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import type { PageProps } from './$types';
  
  let { form }: PageProps = $props();
  let showMobileMenu: boolean = $state(false);
  let activeTab: string = $state('explanation');
  
  // Responsive state
  let isMobile: boolean = $state(false);
  
  // Check viewport size on mount and resize
  function updateViewportState() {
    isMobile = window.innerWidth < 768;
  }
</script>

<svelte:window on:resize={updateViewportState} />

<div class="min-h-screen bg-gradient-to-br from-background to-background/50">
  <!-- Desktop Sidebar (hidden on mobile) -->
  {#if !isMobile}
    <Sidebar.Root class="fixed left-0 top-0 hidden h-screen w-64 border-r lg:flex">
      <Sidebar.Header class="border-b p-4">
        <h1 class="flex items-center gap-2 text-2xl font-bold">
          <span class="text-primary">Myth</span>Buster
        </h1>
      </Sidebar.Header>
      <Sidebar.Content>
        <!-- Sidebar content here -->
      </Sidebar.Content>
    </Sidebar.Root>
  {/if}
  
  <!-- Mobile Header -->
  <header class="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-background/80 p-4 backdrop-blur-sm lg:hidden">
    <h1 class="flex items-center gap-2 text-xl font-bold">
      <span class="text-primary">Myth</span>Buster
    </h1>
    <div class="flex items-center gap-2">
      <Button variant="ghost" size="icon" onclick={() => showMobileMenu = true}>
        <MenuIcon class="h-5 w-5" />
      </Button>
    </div>
  </header>
  
  <!-- Mobile Sheet/Drawer -->
  <Sheet open={showMobileMenu} onOpenChange={(open) => showMobileMenu = open}>
    <Sheet.Content side="left" class="w-[250px]">
      <Sheet.Header class="border-b p-4">
        <Sheet.Title>Menu</Sheet.Title>
        <Sheet.Description>Navigation and options</Sheet.Description>
      </Sheet.Header>
      <!-- Mobile menu content -->
    </Sheet.Content>
  </Sheet>
  
  <!-- Main Content -->
  <main class="container mx-auto max-w-7xl p-4 md:p-6 lg:ml-64">
    {#if !form?.data?.verdict}
      <!-- Input Form View -->
      <div class="mx-auto max-w-2xl">
        <MythInput />
      </div>
    {:else}
      <!-- Results View -->
      <div class="gap-6 lg:grid lg:grid-cols-5">
        <!-- Main Analysis Column -->
        <div class="space-y-6 lg:col-span-3">
          <VerdictDisplay 
            verdict={form.data.verdict} 
            myth={form.myth} 
            cached={form.cached} 
          />
          <ExplanationDisplay 
            explanation={form.data.explanation}
            citations={form.data.citations} 
          />
        </div>
        
        <!-- Secondary Information Column -->
        <div class="mt-6 lg:col-span-2 lg:mt-0">
          {#if isMobile}
            <Tabs.Root value={activeTab} onValueChange={(v) => activeTab = v}>
              <Tabs.List class="grid grid-cols-2">
                <Tabs.Trigger value="citations">Citations</Tabs.Trigger>
                <Tabs.Trigger value="related">Related</Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value="citations">
                <CitationList citations={form.data.citations || []} />
              </Tabs.Content>
              <Tabs.Content value="related">
                <RelatedMyths mythText={form.myth} />
              </Tabs.Content>
            </Tabs.Root>
          {:else}
            <div class="space-y-6">
              <CitationList citations={form.data.citations || []} />
              <RelatedMyths mythText={form.myth} />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>
```
