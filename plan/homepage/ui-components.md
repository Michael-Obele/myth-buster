# UI Components Redesign

## Core Components Upgrades

### 1. Main Container

Replace the current Card-based layout with a more dynamic container:

- Use a glass-morphism effect with a gradient backdrop
- Add subtle background patterns or animated elements from svelte-magic-ui
- Implement a responsive container that smoothly adapts to different viewports
- Add depth with subtle shadows and layering

### 2. Input Form

Enhance the myth input experience:

- Implement a spotlight input effect that follows cursor movement
- Add character count and input validation feedback
- Include animated placeholder text with suggestion examples
- Add a trending myths dropdown for inspiration
- Support voice input option for accessibility

### 3. Analysis Results Display

Modernize the results presentation:

- Create an animated transition between input and results views
- Design a dynamic verdict badge with motion effects
- Implement a timeline-style visualization for explanation content
- Add a confidence meter visualization beside the verdict
- Create a visually appealing citation card system with preview capability

### 4. Navigation Elements

Improve navigation within the application:

- Add a breadcrumb navigation component for multi-step analysis
- Implement a collapsible sidebar for history and saved myths
- Create a floating action button for quick access to common functions
- Add gesture support for mobile navigation (swipe between sections)

## Component Library Integration

### ShadCN-Svelte-Next Components

Primary components to use from shadcn-svelte-next:
- Button (with variants for primary, secondary, tertiary actions)
- Tabs (for organizing different sections of analysis)
- Card (for containing discrete information blocks)
- HoverCard (for citation previews, enhanced with animations)
- Accordion (improved styling for citations section)
- Sidebar (for navigation and history)
- Toast (for notifications and feedback)
- Dialog (for confirmations and advanced options)

### Svelte-Magic-UI Components

Animated components to incorporate:
- Spotlight effect on the main card
- 3D card hover effects for citations
- Animated gradient backgrounds
- Text animations for verdict reveals
- Magnetic buttons for primary actions
- Typewriter effect for explanations

## Accessibility Considerations

- Ensure proper contrast ratios for all text elements
- Implement keyboard navigation for all interactive elements
- Add screen reader descriptions for dynamic content
- Support reduced motion preferences
- Implement focus indicators that are visible but aesthetically pleasing

## Technical Implementation

```svelte
<!-- Example of upgraded input component with spotlight effect -->
<script lang="ts">
  import { Spotlight } from 'svelte-magic-ui';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import { MicrophoneIcon, SendIcon } from 'lucide-svelte';
  
  let myth: string = $state('');
  let isRecording: boolean = $state(false);
  let characterCount = $derived(myth.length);
  let maxLength = 500;
</script>

<Spotlight className="w-full max-w-md mx-auto">
  <form class="w-full space-y-4">
    <div class="relative">
      <Textarea
        name="myth"
        bind:value={myth}
        placeholder="Enter a myth or claim to verify..."
        class="min-h-32 border-primary/20 text-base focus-visible:ring-primary"
        maxlength={maxLength}
      />
      <div class="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Characters: {characterCount}/{maxLength}</span>
        <button 
          type="button" 
          class="p-1 rounded-full hover:bg-muted" 
          onclick={() => isRecording = !isRecording}
        >
          <MicrophoneIcon class="h-4 w-4" class:text-destructive={isRecording} />
        </button>
      </div>
    </div>
    <Button 
      type="submit"
      class="w-full bg-gradient-to-r from-primary to-purple-600"
      disabled={!myth.trim()}
    >
      Verify Myth
      <SendIcon class="ml-2 h-4 w-4" />
    </Button>
  </form>
</Spotlight>
```
