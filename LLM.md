```Markdown src/lib/plan/README.md
# Myth Buster Plan Documentation

This directory contains all planning documents for the Myth Buster application. The documents are organized into the following categories:

## Directory Structure

- **core/** - Core application features and scope
- **development/** - Development approach, timeline, and dependencies
- **features/** - Detailed feature specifications
- **technical/** - Technical implementation details
- **testing/** - Testing strategies and test cases

## Quick Links

- [Feature Matrix](./core/myth_buster_feature_matrix.md) - Overview of all features with prioritization
- [Scope Refinement](./core/myth_buster_scope_refinement.md) - Project scope definition
- [Development Timeline](./development/development_phases_timeline.md) - Project timeline
- [API Integration](./technical/sonar_api_integration.md) - Details on Sonar API integration
- [Testing Strategy](./testing/comprehensive_testing_strategy.md) - Overall testing approach
```


```Markdown src/lib/plan/app/new-features.md
# New Features Plan

## Enhanced User Experience Features

### 1. Myth History & Bookmarks

Allow users to track their previous queries and save interesting myths:

- **History Timeline**: Chronological view of all myths a user has verified
- **Bookmark System**: Allow users to save myths for future reference
- **Sync Capability**: Optional account creation to sync history across devices
- **Export Function**: Ability to export myth verification results as PDF/image

### 2. Social Sharing

Enable users to share verified myths with others:

- **Share Cards**: Visually appealing, shareable cards with the myth verdict
- **Direct Links**: Generate unique URLs for each verified myth
- **Social Media Integration**: One-click sharing to popular platforms
- **Embed Options**: Allow embedding results on other websites

### 3. Advanced Analysis Options

Provide more depth in myth analysis:

- **Confidence Level**: Display AI confidence percentage for the verdict
- **Alternative Perspectives**: Show different viewpoints on controversial myths
- **Citation Ranking**: Rank citations by credibility and relevance
- **Myth Variations**: Show common variations of the same myth

### 4. Interactive Elements

Add interactive components to engage users:

- **Before/After Beliefs**: Allow users to mark what they believed before and after
- **Community Voting**: Let users vote on whether they agree with the verdict
- **Related Myths**: Suggest related myths that users might be interested in
- **Quiz Mode**: Challenge users with a quiz about common myths

### 5. Educational Features

Enhance the educational aspect of myth-busting:

- **Learning Paths**: Themed collections of related myths
- **Myth Categories**: Organize myths by category (health, science, history, etc.)
- **Fact Check Resources**: Links to fact-checking methodology and resources
- **Cognitive Bias Information**: Explain why people might believe certain myths

## Technical Implementation Examples

### History System Implementation

```typescript
// Types for history system
type MythHistoryItem = {
  id: string;
  myth: string;
  verdict: 'true' | 'false' | 'inconclusive';
  timestamp: Date;
  isBookmarked: boolean;
};

// Local storage service
function useHistoryStore() {
  let historyItems: MythHistoryItem[] = $state([]);
  
  // Load from localStorage on init
  function initialize() {
    const stored = localStorage.getItem('myth-history');
    if (stored) {
      try {
        historyItems = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }
  
  // Add new item to history
  function addToHistory(myth: string, verdict: string) {
    const newItem: MythHistoryItem = {
      id: crypto.randomUUID(),
      myth,
      verdict: verdict as 'true' | 'false' | 'inconclusive',
      timestamp: new Date(),
      isBookmarked: false
    };
    
    historyItems = [newItem, ...historyItems].slice(0, 100); // Keep last 100 items
    saveToStorage();
  }
  
  // Toggle bookmark status
  function toggleBookmark(id: string) {
    historyItems = historyItems.map(item => 
      item.id === id ? {...item, isBookmarked: !item.isBookmarked} : item
    );
    saveToStorage();
  }
  
  // Save to localStorage
  function saveToStorage() {
    localStorage.setItem('myth-history', JSON.stringify(historyItems));
  }
  
  // Get bookmarked items
  const bookmarkedItems = $derived.by(() => {
    return historyItems.filter(item => item.isBookmarked);
  });
  
  initialize();
  
  return {
    historyItems,
    bookmarkedItems,
    addToHistory,
    toggleBookmark
  };
}
```

### Share Card Implementation

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { toast } from '$lib/components/ui/toast';
  import { 
    ShareIcon, 
    CopyIcon, 
    TwitterIcon, 
    FacebookIcon 
  } from 'lucide-svelte';
  import { generateShareCard } from './share-utils';
  
  let { verdict, myth, explanation }: { 
    verdict: string; 
    myth: string;
    explanation: string;
  } = $props();
  
  let shareUrl = $derived(`${window.location.origin}/share/${btoa(encodeURIComponent(myth))}`);
  let showShareOptions: boolean = $state(false);
  
  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share link copied to clipboard',
      duration: 3000
    });
  }
  
  async function shareToSocial(platform: string) {
    const text = `I just verified this myth: "${myth}" - The result is ${verdict}!`;
    let url = '';
    
    switch(platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'bluesky':
        // Bluesky uses a different approach for sharing
        // The format is bsky.app/intent/compose?text=your_text
        url = `https://bsky.app/intent/compose?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    window.open(url, '_blank');
  }
  
  function generateImage() {
    generateShareCard(myth, verdict, explanation)
      .then(imageBlob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(imageBlob);
        link.download = `myth-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }
</script>

<div>
  <Button 
    variant="outline" 
    class="gap-2" 
    onclick={() => showShareOptions = !showShareOptions}
  >
    <ShareIcon class="h-4 w-4" />
    <span>Share Result</span>
  </Button>
  
  {#if showShareOptions}
    <div class="mt-2 rounded-md border bg-card p-3">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <input 
            type="text" 
            value={shareUrl} 
            readonly 
            class="flex-1 rounded border p-2 text-sm"
          />
          <Button size="sm" variant="ghost" onclick={copyToClipboard}>
            <CopyIcon class="h-4 w-4" />
          </Button>
        </div>
        <div class="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={() => shareToSocial('twitter')}
          >
            <TwitterIcon class="h-4 w-4" /> 
            Twitter
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={() => shareToSocial('bluesky')}
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 15.17L5 13.4v-2.82l7 3.89 7-3.89v2.82l-7 3.77z" />
            </svg>
            Bluesky
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={() => shareToSocial('facebook')}
          >
            <FacebookIcon class="h-4 w-4" /> 
            Facebook
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={generateImage}
          >
            Download Image
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>
```
```


```Markdown src/lib/plan/app/redesign-overview.md
# App Route Redesign Plan

## Current Analysis

The current app route implements a myth-busting tool with the following features:
- Myth input and submission form
- Loading states and analysis progress
- Results display with verdict (True/False/Inconclusive)
- Detailed explanation with citation linking
- Citation viewing through hover cards
- Accordion for displaying all citations
- Origin of myth information (when available)
- Cache indicator and cache clearing functionality
- Reset functionality to verify another myth

While functional, the current design is relatively simple and could benefit from enhanced visual appeal, animations, and improved user experience.

## Redesign Goals

1. **Enhanced Visual Design**: Create a more visually appealing interface while maintaining functionality
2. **Improved User Experience**: Streamline the user journey and add micro-interactions
3. **Mobile Optimization**: Ensure better responsiveness and usability on mobile devices
4. **Performance Improvements**: Optimize rendering and state management with Svelte 5
5. **Accessibility Enhancements**: Improve accessibility for all users
6. **New Features**: Add valuable features that enhance the myth-busting experience

## Technology Stack

- **Svelte 5**: Utilize the latest Svelte features including `$state` and `$derived`, avoiding `$effect` when possible
- **ShadCN-Svelte-Next**: Leverage advanced UI components for consistent design
- **Svelte-Magic-UI**: Incorporate animated components for visual flair
- **Svelte-Motion**: Use for smooth transitions and animations
- **Lucide-Svelte**: For iconography throughout the interface

## Implementation Approach

The redesign will be implemented in phases:
1. Core UI component upgrades
2. Layout and structure improvements
3. Animation and interaction enhancements
4. New feature additions
5. Testing and refinement

Each section of this plan provides detailed specifications for the different aspects of the redesign.
```


```Markdown src/lib/plan/app/ui-components.md
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
      <div class="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>Characters: {characterCount}/{maxLength}</span>
        <button 
          type="button" 
          class="rounded-full p-1 hover:bg-muted" 
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
```


```Markdown src/lib/plan/core/myth_buster_scope_refinement.md
# Myth Buster Web App - Refined Scope

## Feature Prioritization

### Must Have (Core Functionality)
1. **Myth Verification Interface**
   - Clean, intuitive input field for statement entry
   - Clear verdict display (True/False/Inconclusive)
   - Comprehensive explanation with debunking details
   - Citation links from Sonar API
   - Optimized API integration with proper error handling

2. **Visual Verdict Cues**
   - Distinctive icons for each verdict type (check, X, question mark)
   - Color-coded responses (green, red, purple)
   - Smooth animations for verdict reveal
   - Loading states during API processing

3. **Responsive Design**
   - Mobile-first approach ensuring usability on all devices
   - Accessible interface meeting WCAG AA standards
   - Properly scaled elements for different screen sizes

### Should Have (Important Enhancements)
1. **Audio Cues**
   - Simple, non-intrusive sounds for different verdicts
   - Volume control and mute toggle
   - Preloaded audio files to prevent delays

2. **Theme Toggle**
   - Dark/light mode switch with consistent visual language
   - Local storage persistence
   - Proper color contrast in both modes

3. **Basic Error Handling**
   - Friendly error messages for API failures
   - Retry options for failed requests
   - Offline indication when connection is lost

### Nice to Have (If Time Permits)
1. **Myth Busting Game**
   - Interactive game where AI generates random facts/myths
   - True/False selection with confidence slider
   - Score tracking and streak counting
   - Educational feedback with explanations
   - Visual and audio feedback for correct/incorrect answers
1. **Confidence Meter**
   - User prediction interface before seeing verdict
   - Comparison between user confidence and actual result
   - Visual feedback on accuracy

2. **Myth-Busting Streaks**
   - Simple counter for consecutive verifications
   - Small visual reward for milestones
   - Local storage for persistence

### Future Expansion (Post-Hackathon)
1. **Myth Origin Stories**
   - Historical context and origins of common myths
   - Rich media integration (images, timelines)
   - Additional API integration for deeper research

2. **Seasonal/Themed Myths**
   - Curated collections based on holidays or events
   - Seasonal visual themes and decorations
   - Community-contributed myths

3. **Advanced Analytics**
   - Tracking of most common myth categories
   - User behavior analysis for interface optimization
   - Performance metrics for API integration

## Rationale for Scope Refinement

1. **Focus on Core Value Proposition**
   The primary purpose of the app is to verify statements and debunk myths with evidence. By prioritizing the verification interface, visual cues, and responsive design, we ensure the core functionality is polished and reliable.

2. **Technical Feasibility**
   Hackathons have tight timeframes, and Svelte 5 is still new with potential compatibility challenges. Focusing on fewer, well-implemented features minimizes technical risk and ensures a stable submission.

3. **User Experience Quality**
   A smaller feature set allows more attention to detail on animations, transitions, and micro-interactions that create a delightful user experience. This aligns perfectly with the "Most Fun / Creative Project" category.

4. **Demo Impact**
   For judging purposes, a focused app with polished core features will create a stronger impression than a broader but less refined implementation. The 3-minute demo can showcase the verification flow in depth rather than rushing through multiple features.

5. **Resource Allocation**
   The refined scope allows more time for:
   - Testing across devices and browsers
   - Optimizing API integration
   - Creating engaging animations
   - Polishing the visual design
   - Preparing a compelling demo

By adopting this prioritized approach, the Myth Buster app can deliver a high-quality, focused experience that stands out in the hackathon while maintaining a realistic development timeline.```


```Markdown src/lib/plan/core/scope_justification.md
# Justification for Myth Buster Scope Refinement

## Why Feature Prioritization Matters for Hackathons

Hackathons present unique challenges due to their compressed timeframes and competitive nature. A carefully prioritized scope offers several advantages:

### 1. Completion Risk Mitigation

The original plan included 8 distinct feature areas, several with complex implementations. With a refined scope focusing on 3 "Must Have" and 3 "Should Have" features, the project has:
- 50% reduced risk of incomplete functionality
- Higher likelihood of a polished, working demo
- Clearer development path with defined milestones

### 2. Technical Debt Reduction

Rushing implementation to include all features would likely result in:
- Brittle code that's difficult to demo
- Undocumented workarounds and hacks
- Performance issues from unoptimized implementation

The refined scope allows proper architectural decisions and clean code practices, resulting in a more stable application.

### 3. Demo Impact Maximization

Judges typically have limited time to evaluate each submission. A focused demo of well-implemented features creates a stronger impression than a rushed overview of many partially-working features. The refined scope enables:
- More time to highlight the quality of each implementation
- Clearer communication of the project's value proposition
- Demonstration of technical excellence in core functionality

### 4. User Experience Quality

For the "Most Fun / Creative Project" category, the quality of interactions and visual design significantly impacts evaluation. The streamlined feature set allows:
- More attention to animation details and transitions
- Refined visual design with consistent styling
- Thoughtful error states and edge case handling
- Smoother overall performance

## Specific Features: Cut vs. Keep Rationale

### Features Prioritized ("Must Have" and "Should Have")

1. **Verification Interface**: The core value proposition - without this, the app has no purpose
2. **Visual Cues**: Essential for making the app engaging and aligned with the "fun/creative" category
3. **Sonar API Integration**: Powers the factual verification that makes the app useful
4. **Responsive Design**: Ensures the app is usable across devices during judging
5. **Audio Cues**: Relatively simple to implement and adds significant creative value
6. **Theme Toggle**: Standard UX feature that improves accessibility with minimal implementation effort

### Features Deprioritized ("Nice to Have" or "Future")

1. **Confidence Meter**: While interesting, adds complexity without being essential to core functionality
2. **Myth-Busting Streaks**: Gamification is valuable but secondary to the primary verification purpose
3. **Myth Origin Stories**: Requires additional complex API integration and UI components
4. **Seasonal Myths**: Content curation takes time away from technical implementation
5. **Advanced Analytics**: Adds substantial complexity with minimal demo-time value

## Expandable Foundation Approach

The refined scope isn't about permanently removing features, but rather creating a solid foundation that can be expanded upon:

1. **Post-Hackathon Continuation**: The clean implementation of core features provides a strong foundation for adding the deprioritized features after the hackathon.

2. **Modular Architecture**: By focusing on fewer features, more attention can be given to creating a modular architecture that makes future additions easier.

3. **Progressive Enhancement**: The approach allows starting with a minimal viable product and progressively enhancing it as time permits, rather than attempting everything at once and risking incomplete implementation.

This strategic approach to scope management maximizes the chances of a successful hackathon submission while creating a sustainable path for project evolution beyond the competition.```


```Markdown src/lib/plan/development/development_phase_dependencies.md
# Development Phase Dependencies

This document maps out the detailed dependencies between components and features in the Myth Buster app, helping identify the critical path and potential blockers during development.

## Component Dependency Graph

The following dependency graph shows the relationships between key components and features, highlighting which elements depend on others for implementation.

```
                                   ┌───────────────────┐
                                   │  Project Setup    │
                                   └─────────┬─────────┘
                    ┌──────────────────────┬─┴───────────────────────┐
                    │                      │                         │
            ┌───────▼───────┐      ┌───────▼───────┐         ┌───────▼───────┐
            │  Tailwind &   │      │   SvelteKit   │         │  Environment  │
            │  shadcn Setup │      │   Structure   │         │  Configuration │
            └───────┬───────┘      └───────┬───────┘         └───────┬───────┘
                    │                      │                         │
            ┌───────▼───────┐      ┌───────▼───────┐         ┌───────▼───────┐
            │ UI Components │      │    Routing    │         │  Sonar API    │
            │    Library    │      │               │         │    Client     │
            └───────┬───────┘      └───────────────┘         └───────┬───────┘
            ┌───────┴───────┐                                ┌───────▼───────┐
            │  Basic Layout │                                │  Mock API     │
            │  Structure    │                                │  Service      │
            └───────┬───────┘                                └───────┬───────┘
                    │                                                │
┌───────────────────┼────────────────────┐                           │
│                   │                    │                           │
│           ┌───────▼───────┐    ┌───────▼───────┐           ┌───────▼───────┐
│           │ Verification  │    │  Error State  │◄──────────┤  Error        │
│           │    Form       │    │  Management   │           │  Handling     │
│           └───────┬───────┘    └───────────────┘           └───────────────┘
│                   │                                                │
│           ┌───────▼───────┐                                        │
│           │ Input         │                                        │
│           │ Validation    │                                        │
│           └───────┬───────┘                                        │
│                   │                                                │
│           ┌───────▼───────┐                                        │
├──────────►│ Verification  │◄───────────────────────────────────────┘
│           │ State Manager │◄─────────┐
│           └───────┬───────┘         │
│                   │                 │
│           ┌───────▼───────┐  ┌──────▼────────┐
└──────────►│ Verdict       │  │ Local Storage │
            │ Display       │  │ Cache Service │
            └───────┬───────┘  └───────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
┌───────▼───┐ ┌─────▼─────┐ ┌───▼───────┐
│ Citations │ │ Visual    │ │ Skeleton  │
│ Component │ │ Cues      │ │ Loaders   │
└───────────┘ └─────┬─────┘ └───────────┘
                    │
                    │
        ┌───────────┼───────────┐
        │           │           │
┌───────▼───┐ ┌─────▼─────┐ ┌───▼───────┐
│ Animation │ │ Audio     │ │ Theme     │
│ System    │ │ Feedback  │ │ Toggle    │
└───────────┘ └───────────┘ └───────────┘
```

## Feature Dependency Matrix

This matrix shows which features depend on others for implementation. A "●" indicates that the feature in the row depends on the feature in the column.

| Feature                  | Project Setup | UI Library | API Client | Mock API | Basic Layout | Error Handling | Verification Form | Validation | State Management | Verdict Display | Citations | Visual Cues | Skeleton Loaders | Animations | Audio | Theme Toggle |
|--------------------------|---------------|------------|------------|----------|--------------|----------------|-------------------|------------|------------------|-----------------|-----------|-------------|------------------|------------|-------|--------------|
| **Project Setup**        | -             |            |            |          |              |                |                   |            |                  |                 |           |             |                  |            |       |              |
| **UI Library**           | ●             | -          |            |          |              |                |                   |            |                  |                 |           |             |                  |            |       |              |
| **API Client**           | ●             |            | -          |          |              |                |                   |            |                  |                 |           |             |                  |            |       |              |
| **Mock API**             | ●             |            | ●          | -        |              |                |                   |            |                  |                 |           |             |                  |            |       |              |
| **Basic Layout**         | ●             | ●          |            |          | -            |                |                   |            |                  |                 |           |             |                  |            |       |              |
| **Error Handling**       | ●             | ●          | ●          |          |              | -              |                   |            |                  |                 |           |             |                  |            |       |              |
| **Verification Form**    | ●             | ●          |            |          | ●            |                | -                 |            |                  |                 |           |             |                  |            |       |              |
| **Validation**           | ●             |            |            |          |              |                | ●                 | -          |                  |                 |           |             |                  |            |       |              |
| **State Management**     | ●             |            | ●          | ●        |              | ●              | ●                 | ●          | -                |                 |           |             |                  |            |       |              |
| **Verdict Display**      | ●             | ●          |            |          |              |                |                   |            | ●                | -               |           |             |                  |            |       |              |
| **Citations**            | ●             | ●          |            |          |              |                |                   |            | ●                | ●               | -         |             |                  |            |       |              |
| **Visual Cues**          | ●             | ●          |            |          |              |                |                   |            |                  | ●               |           | -           |                  |            |       |              |
| **Skeleton Loaders**     | ●             | ●          |            |          |              |                |                   |            | ●                |                 |           |             | -                |            |       |              |
| **Animations**           | ●             | ●          |            |          |              |                |                   |            |                  | ●               | ●         | ●           |                  | -          |       |              |
| **Audio Feedback**       | ●             |            |            |          |              |                |                   |            | ●                | ●               |           |             |                  |            | -     |              |
| **Theme Toggle**         | ●             | ●          |            |          |              |                |                   |            |                  |                 |           |             |                  |            |       | -            |
| **User Onboarding**      | ●             | ●          |            | ●        | ●            |                | ●                 |            | ●                | ●               |           |             |                  |            |       |              |
| **Accessibility**        | ●             | ●          |            |          |              |                | ●                 |            |                  | ●               | ●         |             |                  |            | ●     | ●            |
| **Performance Opt.**     | ●             |            | ●          |          |              |                |                   |            | ●                | ●               | ●         | ●           |                  | ●          | ●     |              |

## Critical Path Analysis

The critical path represents the sequence of dependent tasks that determine the minimum time needed to complete the project. Delays in any of these tasks will delay the entire project.

### Primary Critical Path

1. **Project Setup** → 
2. **UI Library Setup** → 
3. **Basic Layout** → 
4. **Verification Form** → 
5. **Input Validation** → 
6. **Verification State Management** → 
7. **Verdict Display** → 
8. **Visual Cues** → 
9. **Animations** → 
10. **Accessibility** → 
11. **Testing & Documentation**

### Secondary Critical Paths

**API Integration Path:**
1. **Project Setup** → 
2. **API Client** → 
3. **Mock API** → 
4. **Error Handling** → 
5. **Verification State Management**

**Enhancement Path:**
1. **Verdict Display** → 
2. **Visual Cues** → 
3. **Audio Feedback** → 
4. **Theme Toggle** → 
5. **User Onboarding**

## Component Implementation Dependencies

### 1. Foundation Components

#### Project Setup
- **Dependencies**: None
- **Required for**: All other components
- **Implementation order**: First task

#### UI Library (shadcn-svelte & Tailwind)
- **Dependencies**: Project Setup
- **Required for**: All UI components
- **Implementation order**: Early in Phase 1

#### API Client
- **Dependencies**: Project Setup
- **Required for**: Verification State Management, Error Handling
- **Implementation order**: Early in Phase 1, parallel to UI Library

#### Mock API
- **Dependencies**: API Client
- **Required for**: Offline development, Testing
- **Implementation order**: After API Client in Phase 1

#### Basic Layout
- **Dependencies**: UI Library
- **Required for**: All visual components
- **Implementation order**: After UI Library in Phase 1

#### Error Handling
- **Dependencies**: API Client, UI Library
- **Required for**: Robust user experience
- **Implementation order**: After API Client in Phase 1

### 2. Core Feature Components

#### Verification Form
- **Dependencies**: Basic Layout, UI Library
- **Required for**: User input collection
- **Implementation order**: First component in Phase 2

#### Input Validation
- **Dependencies**: Verification Form
- **Required for**: Data quality, User feedback
- **Implementation order**: Immediately after Verification Form in Phase 2

#### Verification State Management
- **Dependencies**: API Client, Verification Form, Input Validation
- **Required for**: Application state coordination
- **Implementation order**: After Input Validation in Phase 2

#### Verdict Display
- **Dependencies**: Verification State Management, UI Library
- **Required for**: Result presentation
- **Implementation order**: After State Management in Phase 2

#### Citations Component
- **Dependencies**: Verdict Display
- **Required for**: Source attribution
- **Implementation order**: After Verdict Display in Phase 2

### 3. Enhancement Components

#### Visual Cues
- **Dependencies**: Verdict Display
- **Required for**: Intuitive result interpretation
- **Implementation order**: Early in Phase 3

#### Skeleton Loaders
- **Dependencies**: Verdict Display, State Management
- **Required for**: Loading state feedback
- **Implementation order**: Early in Phase 3

#### Theme Toggle
- **Dependencies**: UI Library
- **Required for**: User preference support
- **Implementation order**: Middle of Phase 3

#### Audio Feedback
- **Dependencies**: Verdict Display, State Management
- **Required for**: Multi-sensory feedback
- **Implementation order**: Middle of Phase 3

#### User Onboarding
- **Dependencies**: Basic Layout, Verification Form, Verdict Display
- **Required for**: New user guidance
- **Implementation order**: Late in Phase 3

### 4. Polish Components

#### Animations
- **Dependencies**: Visual Cues
- **Required for**: Enhanced user experience
- **Implementation order**: Early in Phase 4

#### Accessibility Improvements
- **Dependencies**: All UI components
- **Required for**: Inclusive user experience
- **Implementation order**: Mid Phase 4

#### Performance Optimization
- **Dependencies**: All functional components
- **Required for**: Responsive user experience
- **Implementation order**: Late in Phase 4

## Dependency-Based Parallelization

Based on the dependency analysis, these tasks can be worked on in parallel to optimize development time:

### Parallel Track 1: UI Development
- UI Library Setup
- Basic Layout
- Verification Form
- Verdict Display Components

### Parallel Track 2: API Integration
- API Client Implementation
- Mock API Service
- Error Handling

### Parallel Track 3: Enhancement Features
- Theme Toggle
- User Onboarding
- Audio Feedback

## Dependency-Informed Implementation Strategy

1. **Start with Foundation**: Prioritize Project Setup, UI Library, and API Client as they block multiple downstream components.

2. **Early Prototype Strategy**: Create a minimal working prototype with:
   - Basic Verification Form
   - Simple API Integration
   - Basic Verdict Display
   
   This provides a functional core that can be incrementally enhanced.

3. **Component-First Approach**: Build UI components in isolation before integration to allow parallel work:
   - Create Verdict Display with mock data
   - Develop Citations component with sample citations
   - Build Theme Toggle independent of other components

4. **Progressive Enhancement**: Layer features onto the working prototype:
   - Add Input Validation to Verification Form
   - Enhance Verdict Display with Visual Cues
   - Implement Audio Feedback on working verdict display

5. **Polish in Parallel**: Once core features are working, polish can happen in parallel:
   - One developer can work on animations
   - Another can focus on accessibility
   - A third can handle performance optimization

## Inter-Phase Dependencies

### Foundation → Core Features
- **Core Dependencies**: 
  - Basic Layout must be completed for Verification Form
  - API Client must be functional for Verification State Management
  - Error Handling must be in place for robust API interaction

- **Minimum Requirements**:
  - Layout structure that accommodates form and results
  - Functional API client that can make requests
  - Basic error catching and display

### Core Features → Enhancement
- **Core Dependencies**:
  - Verdict Display must be completed for Visual Cues
  - State Management must be working for Audio Feedback
  - Form and Results must exist for User Onboarding

- **Minimum Requirements**:
  - Working verification flow from input to results
  - Properly structured verdict and citation displays
  - State transitions for different verification states

### Enhancement → Polish
- **Core Dependencies**:
  - Visual Cues must be implemented for Animations
  - All UI components must exist for Accessibility improvements
  - Core features must be functional for Performance optimization

- **Minimum Requirements**:
  - Complete user journey with visual feedback
  - All interactive elements in place
  - Stable feature set ready for refinement

## Testing Dependencies

Each testing checkpoint depends on specific component implementations:

### Checkpoint 1 (Foundation)
- **Dependencies**: Project Setup, API Client, Mock API, Basic Layout
- **Testing Focus**: API connectivity, mock data handling, responsive layout

### Checkpoint 2 (Core Features)
- **Dependencies**: Verification Form, State Management, Verdict Display, Citations
- **Testing Focus**: End-to-end verification flow, state transitions, result display

### Checkpoint 3 (Enhancement)
- **Dependencies**: Visual Cues, Theme Toggle, Audio Feedback, User Onboarding
- **Testing Focus**: Feature toggling, user guidance, multi-sensory feedback

### Checkpoint 4 (Polish)
- **Dependencies**: Animations, Accessibility Improvements, Performance Optimization
- **Testing Focus**: User experience quality, inclusive design, performance metrics

## Risk Assessment Based on Dependencies

1. **High-Risk Dependencies**:
   - **Svelte 5 + shadcn-svelte integration**: Affects all UI components
   - **Sonar API integration**: Critical for core functionality
   - **State Management implementation**: Impacts multiple downstream features

2. **Mitigation Strategies**:
   - Develop fallback approaches for high-risk dependencies
   - Create isolation layers between core systems to minimize dependency impact
   - Implement feature flags to disable problematic enhancements without affecting core functionality

## Conclusion

This dependency analysis provides a clear understanding of the relationships between components and features in the Myth Buster app. By identifying the critical path and potential parallel development tracks, we can optimize the implementation timeline while ensuring robust integration between components.

The phased approach outlined in the main development plan aligns with these dependencies, with each phase building on a stable foundation established by the previous phase. This structured approach minimizes risks associated with complex dependencies while allowing for efficient development within the hackathon timeframe.```


```Markdown src/lib/plan/features/myth_busting_game.md
# Myth Busting Game Feature

## Overview
The Myth Busting Game is an interactive feature that challenges users to determine whether AI-generated statements are true or false. This gamified approach to myth-busting enhances user engagement while educating them about common misconceptions.

## Core Functionality

### Statement Generation
- The AI will generate random facts or myths using the Sonar API
- Statements will vary in difficulty and topic areas
- Each statement will have a definitive true/false answer with supporting evidence

### User Interface
- Clean, game-like interface with statement display
- True/False buttons for user response
- Confidence slider (1-100%) for users to indicate certainty
- Visual feedback for correct/incorrect answers
- Score tracking and streaks

### Response Handling
- Immediate feedback on user answers
- Detailed explanation of why the statement is true or false
- Citations and sources from Sonar API
- Educational content to expand on the topic

## Technical Implementation

### Server Actions Implementation
```typescript
// src/routes/game/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { SONAR_API_KEY } from '$env/static/private';

export const actions: Actions = {
  // Action to generate a new statement
  generate: async ({ request }) => {
    const formData = await request.formData();
    const difficulty = formData.get('difficulty')?.toString() || 'medium';
    const category = formData.get('category')?.toString() || 'general';
    
    try {
      // Generate a random fact or myth using Sonar API
      const response = await fetch('https://api.perplexity.ai/sonar/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SONAR_API_KEY}`
        },
        body: JSON.stringify({
          query: `Generate a random ${difficulty} ${category} fact or myth that can be definitively proven true or false. Return the response in JSON format with the following fields: statement (the fact or myth), isTrue (boolean), explanation (why it's true or false), citations (array of sources).`,
          options: {
            include_answer: true,
            include_citations: true
          }
        })
      });
      
      if (!response.ok) {
        return fail(500, { error: 'Failed to fetch from Sonar API' });
      }
      
      const data = await response.json();
      let parsedData;
      
      try {
        // Try to extract JSON from the response text if needed
        const jsonMatch = data.text.match(/\{.*\}/s);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, create a structured response
          parsedData = {
            statement: data.text,
            isTrue: Math.random() > 0.5, // Fallback if not provided
            explanation: data.answer || 'No explanation provided',
            citations: data.citations || []
          };
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        parsedData = {
          statement: data.text || 'Failed to generate a statement',
          isTrue: Math.random() > 0.5,
          explanation: data.answer || 'No explanation provided',
          citations: data.citations || []
        };
      }
      
      return {
        success: true,
        statement: parsedData.statement,
        isTrue: parsedData.isTrue,
        explanation: parsedData.explanation,
        citations: parsedData.citations
      };
    } catch (error) {
      console.error('Error generating statement:', error);
      return fail(500, { error: 'Failed to generate statement' });
    }
  },
  
  // Action to check the user's answer
  checkAnswer: async ({ request }) => {
    const formData = await request.formData();
    const userAnswer = formData.get('answer') === 'true';
    const isTrue = formData.get('isTrue') === 'true';
    const confidence = parseInt(formData.get('confidence')?.toString() || '50');
    const statement = formData.get('statement')?.toString() || '';
    const explanation = formData.get('explanation')?.toString() || '';
    const citations = JSON.parse(formData.get('citations')?.toString() || '[]');
    
    const isCorrect = userAnswer === isTrue;
    let points = 0;
    
    if (isCorrect) {
      // Award points based on confidence level
      points = Math.round(confidence);
    }
    
    return {
      success: true,
      result: isCorrect ? 'correct' : 'incorrect',
      statement,
      userAnswer,
      isTrue,
      explanation,
      citations,
      points
    };
  }
};
```

### Component Structure
```svelte
<!-- src/routes/game/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import * as Form from "$lib/components/ui/form";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Slider } from "$lib/components/ui/slider";
  import { Check, X, HelpCircle, RefreshCw } from "lucide-svelte";
  import { Alert } from "$lib/components/ui/alert";
  import { Progress } from "$lib/components/ui/progress";
  
  let { form } = $props();
  
  let confidence: number = $state(50);
  let score: number = $state(0);
  let streak: number = $state(0);
  let isGenerating: boolean = $state(false);
  let isAnswering: boolean = $state(false);
  
  // Local storage for persisting score and streak
  $effect(() => {
    if (typeof window !== 'undefined') {
      const savedScore = localStorage.getItem('mythBusterScore');
      const savedStreak = localStorage.getItem('mythBusterStreak');
      
      if (savedScore) score = parseInt(savedScore);
      if (savedStreak) streak = parseInt(savedStreak);
    }
  });
  
  $effect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mythBusterScore', score.toString());
      localStorage.setItem('mythBusterStreak', streak.toString());
    }
  });
  
  // Update score and streak when form result comes back
  $effect(() => {
    if (form?.points) {
      score += form.points;
      
      if (form.result === 'correct') {
        streak++;
      } else {
        streak = 0;
      }
    }
  });
</script>

<div class="container mx-auto py-8">
  <h1 class="mb-6 text-3xl font-bold">Myth Buster Challenge</h1>
  
  <Card.Root class="mb-6 p-6">
    <Card.Header>
      <Card.Title>Test Your Knowledge</Card.Title>
      <Card.Description>
        Determine if the statement is true or false and rate your confidence.
      </Card.Description>
    </Card.Header>
    
    <Card.Content>
      {#if form?.error}
        <Alert variant="destructive" class="mb-4">
          <p>{form.error}</p>
        </Alert>
      {/if}
      
      {#if !form?.statement}
        <!-- Generate a new statement -->
        <form method="POST" action="?/generate" use:enhance={() => {
          isGenerating = true;
          
          return ({ result, update }) => {
            isGenerating = false;
            update();
          };
        }}>
          <div class="space-y-4">
            <Form.Field>
              <Form.Label>Difficulty</Form.Label>
              <Form.Control>
                <select name="difficulty" class="w-full rounded border p-2">
                  <option value="easy">Easy</option>
                  <option value="medium" selected>Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Form.Control>
            </Form.Field>
            
            <Form.Field>
              <Form.Label>Category</Form.Label>
              <Form.Control>
                <select name="category" class="w-full rounded border p-2">
                  <option value="general" selected>General Knowledge</option>
                  <option value="science">Science</option>
                  <option value="history">History</option>
                  <option value="health">Health</option>
                  <option value="technology">Technology</option>
                </select>
              </Form.Control>
            </Form.Field>
            
            <Button type="submit" class="w-full" disabled={isGenerating}>
              {#if isGenerating}
                <RefreshCw class="mr-2 h-4 w-4 animate-spin" />
                Generating...
              {:else}
                Generate Statement
              {/if}
            </Button>
          </div>
        </form>
      {:else if !form?.result}
        <!-- Answer the statement -->
        <div class="mb-6">
          <h2 class="mb-4 text-xl font-semibold">{form.statement}</h2>
          
          <form method="POST" action="?/checkAnswer" use:enhance={() => {
            isAnswering = true;
            
            return ({ result, update }) => {
              isAnswering = false;
              update();
            };
          }}>
            <input type="hidden" name="statement" value={form.statement} />
            <input type="hidden" name="isTrue" value={form.isTrue} />
            <input type="hidden" name="explanation" value={form.explanation} />
            <input type="hidden" name="citations" value={JSON.stringify(form.citations || [])} />
            
            <div class="mb-6">
              <Form.Field>
                <Form.Label>How confident are you?</Form.Label>
                <Form.Control>
                  <div class="space-y-2">
                    <Slider bind:value={confidence} min={1} max={100} step={1} />
                    <input type="hidden" name="confidence" value={confidence} />
                    <Progress value={confidence} max={100} class="h-2" />
                    <p class="text-right text-sm text-gray-500">{confidence}% confident</p>
                  </div>
                </Form.Control>
              </Form.Field>
            </div>
            
            <div class="flex gap-4">
              <Button 
                type="submit"
                name="answer"
                value="true"
                variant="outline" 
                class="flex-1 border-emerald-500 hover:bg-emerald-50"
                disabled={isAnswering}
              >
                <Check class="mr-2" />
                True
              </Button>
              
              <Button 
                type="submit"
                name="answer"
                value="false"
                variant="outline" 
                class="flex-1 border-red-500 hover:bg-red-50"
                disabled={isAnswering}
              >
                <X class="mr-2" />
                False
              </Button>
            </div>
          </form>
        </div>
      {:else}
        <!-- Show result -->
        <div class={form.result === 'correct' ? 'bg-emerald-50 p-4 rounded-md' : 'bg-red-50 p-4 rounded-md'}>
          <div class="mb-2 flex items-center">
            {#if form.result === 'correct'}
              <Check class="mr-2 text-emerald-500" />
              <p class="font-semibold text-emerald-700">Correct! +{form.points} points</p>
            {:else}
              <X class="mr-2 text-red-500" />
              <p class="font-semibold text-red-700">Incorrect!</p>
            {/if}
          </div>
          
          <p class="mb-4">The statement is <strong>{form.isTrue ? 'TRUE' : 'FALSE'}</strong>.</p>
          <p class="text-gray-700">{form.explanation}</p>
          
          {#if form.citations && form.citations.length > 0}
            <div class="mt-4">
              <h3 class="mb-2 font-semibold">Sources:</h3>
              <ul class="list-disc space-y-1 pl-5">
                {#each form.citations as citation}
                  <li>
                    <a href={citation.url} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">
                      {citation.title || citation.url}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
          
          <form method="POST" action="?/generate" class="mt-4">
            <input type="hidden" name="difficulty" value="medium" />
            <input type="hidden" name="category" value="general" />
            <Button type="submit" class="w-full">
              Next Statement
            </Button>
          </form>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
  
  <div class="flex items-center justify-between">
    <div>
      <p class="text-lg">Score: <span class="font-bold">{score}</span></p>
    </div>
    <div>
      <p class="text-lg">Streak: <span class="font-bold">{streak}</span></p>
    </div>
  </div>
</div>
```

```typescript
// src/routes/game/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = ({ form }) => {
  return { form };
};
```

## User Experience Flow

1. User navigates to the game section of the app
2. System presents a randomly generated statement
3. User evaluates the statement and adjusts their confidence level
4. User selects True or False
5. System provides immediate feedback:
   - Correct/incorrect indication
   - Explanation of the actual answer
   - Supporting evidence and citations
6. User's score and streak are updated
7. User can proceed to the next statement

## Gamification Elements

- **Points System**: Users earn points based on correct answers and confidence level
- **Streaks**: Consecutive correct answers build a streak multiplier
- **Leaderboard**: Optional future enhancement to show top scores
- **Categories**: Different topic areas for users to test their knowledge in
- **Difficulty Levels**: Easy, medium, and hard statements

## Implementation Priority

| Component | Priority | Complexity | Implementation Time |
|-----------|----------|------------|---------------------|
| Basic Game Loop | High | Medium | 1 day |
| Confidence Slider | Medium | Low | 0.5 day |
| Score Tracking | Medium | Low | 0.5 day |
| Visual Feedback | High | Medium | 0.5 day |
| API Integration | High | Medium | 1 day |
| Categories/Difficulty | Low | Medium | 1 day |

## Integration with Existing Features

The Myth Busting Game complements the existing verification interface by:
- Providing a more interactive, engaging way to learn about myths
- Encouraging users to think critically about statements before seeing the answer
- Creating a fun, competitive element to myth-busting
- Reinforcing the educational aspect of the application

## Future Enhancements

- User accounts to save progress and scores
- Daily challenges with unique statements
- Social sharing of interesting facts/myths
- Themed game rounds (seasonal, historical, scientific)
- Multiplayer mode where users compete in real-time
```


```Markdown src/lib/plan/features/user_onboarding.md
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
      <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <svelte:component this={stepContent.icon} class="h-6 w-6 text-primary" />
      </div>
      <DialogTitle class="text-center text-xl">{stepContent.title}</DialogTitle>
      <DialogDescription class="text-center">
        {stepContent.description}
      </DialogDescription>
    </DialogHeader>
    
    {#if currentStep === 3}
      <div class="grid gap-4 py-4">
        <div class="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
             on:click={() => {
               completeOnboarding();
               tryExample("Does cracking your knuckles cause arthritis?");
             }}>
          <h3 class="font-medium">Knuckle Cracking & Arthritis</h3>
          <p class="text-sm text-muted-foreground">Does cracking your knuckles cause arthritis?</p>
        </div>
        
        <div class="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
             on:click={() => {
               completeOnboarding();
               tryExample("Do we only use 10% of our brains?");
             }}>
          <h3 class="font-medium">10% of Brain Usage</h3>
          <p class="text-sm text-muted-foreground">Do we only use 10% of our brains?</p>
        </div>
        
        <div class="cursor-pointer rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
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
        <CardTitle class="flex items-center gap-2 text-xl">
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
        <div class="cursor-pointer rounded-lg border p-3 transition-all hover:bg-accent hover:text-accent-foreground">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-medium">{myth.title}</h3>
              <p class="text-sm text-muted-foreground">{myth.description}</p>
              <div class="mt-2 flex gap-2">
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
        <div class="absolute right-0 top-0 z-10 -mr-2 -mt-2 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-primary">
          <HelpCircle class="h-3 w-3 text-primary-foreground" />
        </div>
        <slot />
      </div>
    </TooltipTrigger>
    <TooltipContent {side} class="w-80 p-4">
      {#if title}
        <p class="mb-1 font-semibold">{title}</p>
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
    <Button variant="outline" size="icon" class="fixed bottom-4 right-4 z-50 h-8 w-8 rounded-full shadow-md">
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
          <div class="flex items-start gap-3 rounded-md border p-3">
            <div class="flex h-8 w-8 items-center justify-center text-green-500">
              <Check class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-medium">True</h3>
              <p class="text-sm text-muted-foreground">
                The statement has been verified as true, backed by credible sources.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 rounded-md border p-3">
            <div class="flex h-8 w-8 items-center justify-center text-red-500">
              <X class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-medium">False</h3>
              <p class="text-sm text-muted-foreground">
                The statement has been debunked and shown to be false.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 rounded-md border p-3">
            <div class="flex h-8 w-8 items-center justify-center text-purple-500">
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
          <div class="flex items-start gap-3 rounded-md border p-3">
            <div class="flex h-8 w-8 items-center justify-center text-blue-500">
              <Volume2 class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-medium">Sound Effects</h3>
              <p class="text-sm text-muted-foreground">
                Enable or disable sound feedback for verdict results.
              </p>
            </div>
          </div>
          
          <div class="flex items-start gap-3 rounded-md border p-3">
            <div class="flex h-8 w-8 items-center justify-center">
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
          
          <div class="flex items-start gap-3 rounded-md border p-3">
            <div class="flex h-8 w-8 items-center justify-center">
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
            <p class="mt-2 text-sm text-muted-foreground">
              Myth Buster helps you verify statements and debunk myths using the Perplexity Sonar API to provide accurate, sourced information.
            </p>
            <p class="mt-2 text-sm text-muted-foreground">
              Created for the Perplexity Hackathon, this app demonstrates how AI can help combat misinformation in an engaging way.
            </p>
          </div>
          
          <div class="rounded-md border p-3">
            <h3 class="font-medium">Technology</h3>
            <p class="mt-2 text-sm text-muted-foreground">
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

<main class="container mx-auto max-w-3xl px-4 py-8">
  <OnboardingModal />
  
  <h1 class="mb-6 text-center text-3xl font-bold">Myth Buster</h1>
  
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
      <div class="mt-2 flex justify-center">
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
          <ArrowDown class="mr-2 h-4 w-4" />
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

This comprehensive onboarding strategy welcomes new users to the Myth Buster app with a guided introduction that educates them about the app's functionality while providing immediate value through sample myths. The combination of progressive onboarding, contextual tooltips, and an always-accessible help drawer ensures users can quickly become comfortable with the verification process regardless of their technical expertise.```


```Markdown src/lib/plan/homepage/layout-structure.md
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
```


```Markdown src/lib/plan/homepage/new-features.md
# New Features Plan

## Enhanced User Experience Features

### 1. Myth History & Bookmarks

Allow users to track their previous queries and save interesting myths:

- **History Timeline**: Chronological view of all myths a user has verified
- **Bookmark System**: Allow users to save myths for future reference
- **Sync Capability**: Optional account creation to sync history across devices
- **Export Function**: Ability to export myth verification results as PDF/image

### 2. Social Sharing

Enable users to share verified myths with others:

- **Share Cards**: Visually appealing, shareable cards with the myth verdict
- **Direct Links**: Generate unique URLs for each verified myth
- **Social Media Integration**: One-click sharing to popular platforms
- **Embed Options**: Allow embedding results on other websites

### 3. Advanced Analysis Options

Provide more depth in myth analysis:

- **Confidence Level**: Display AI confidence percentage for the verdict
- **Alternative Perspectives**: Show different viewpoints on controversial myths
- **Citation Ranking**: Rank citations by credibility and relevance
- **Myth Variations**: Show common variations of the same myth

### 4. Interactive Elements

Add interactive components to engage users:

- **Before/After Beliefs**: Allow users to mark what they believed before and after
- **Community Voting**: Let users vote on whether they agree with the verdict
- **Related Myths**: Suggest related myths that users might be interested in
- **Quiz Mode**: Challenge users with a quiz about common myths

### 5. Educational Features

Enhance the educational aspect of myth-busting:

- **Learning Paths**: Themed collections of related myths
- **Myth Categories**: Organize myths by category (health, science, history, etc.)
- **Fact Check Resources**: Links to fact-checking methodology and resources
- **Cognitive Bias Information**: Explain why people might believe certain myths

## Technical Implementation Examples

### History System Implementation

```typescript
// Types for history system
type MythHistoryItem = {
  id: string;
  myth: string;
  verdict: 'true' | 'false' | 'inconclusive';
  timestamp: Date;
  isBookmarked: boolean;
};

// Local storage service
function useHistoryStore() {
  let historyItems: MythHistoryItem[] = $state([]);
  
  // Load from localStorage on init
  function initialize() {
    const stored = localStorage.getItem('myth-history');
    if (stored) {
      try {
        historyItems = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }
  
  // Add new item to history
  function addToHistory(myth: string, verdict: string) {
    const newItem: MythHistoryItem = {
      id: crypto.randomUUID(),
      myth,
      verdict: verdict as 'true' | 'false' | 'inconclusive',
      timestamp: new Date(),
      isBookmarked: false
    };
    
    historyItems = [newItem, ...historyItems].slice(0, 100); // Keep last 100 items
    saveToStorage();
  }
  
  // Toggle bookmark status
  function toggleBookmark(id: string) {
    historyItems = historyItems.map(item => 
      item.id === id ? {...item, isBookmarked: !item.isBookmarked} : item
    );
    saveToStorage();
  }
  
  // Save to localStorage
  function saveToStorage() {
    localStorage.setItem('myth-history', JSON.stringify(historyItems));
  }
  
  // Get bookmarked items
  const bookmarkedItems = $derived.by(() => {
    return historyItems.filter(item => item.isBookmarked);
  });
  
  initialize();
  
  return {
    historyItems,
    bookmarkedItems,
    addToHistory,
    toggleBookmark
  };
}
```

### Share Card Implementation

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { toast } from '$lib/components/ui/toast';
  import { 
    ShareIcon, 
    CopyIcon, 
    TwitterIcon, 
    FacebookIcon 
  } from 'lucide-svelte';
  import { generateShareCard } from './share-utils';
  
  let { verdict, myth, explanation }: { 
    verdict: string; 
    myth: string;
    explanation: string;
  } = $props();
  
  let shareUrl = $derived(`${window.location.origin}/share/${btoa(encodeURIComponent(myth))}`);
  let showShareOptions: boolean = $state(false);
  
  async function copyToClipboard() {
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share link copied to clipboard',
      duration: 3000
    });
  }
  
  async function shareToSocial(platform: string) {
    const text = `I just verified this myth: "${myth}" - The result is ${verdict}!`;
    let url = '';
    
    switch(platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'bluesky':
        // Bluesky uses a different approach for sharing
        // The format is bsky.app/intent/compose?text=your_text
        url = `https://bsky.app/intent/compose?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
    }
    
    window.open(url, '_blank');
  }
  
  function generateImage() {
    generateShareCard(myth, verdict, explanation)
      .then(imageBlob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(imageBlob);
        link.download = `myth-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
  }
</script>

<div>
  <Button 
    variant="outline" 
    class="gap-2" 
    onclick={() => showShareOptions = !showShareOptions}
  >
    <ShareIcon class="h-4 w-4" />
    <span>Share Result</span>
  </Button>
  
  {#if showShareOptions}
    <div class="mt-2 rounded-md border bg-card p-3">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <input 
            type="text" 
            value={shareUrl} 
            readonly 
            class="flex-1 rounded border p-2 text-sm"
          />
          <Button size="sm" variant="ghost" onclick={copyToClipboard}>
            <CopyIcon class="h-4 w-4" />
          </Button>
        </div>
        <div class="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={() => shareToSocial('twitter')}
          >
            <TwitterIcon class="h-4 w-4" /> 
            Twitter
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={() => shareToSocial('bluesky')}
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 15.17L5 13.4v-2.82l7 3.89 7-3.89v2.82l-7 3.77z" />
            </svg>
            Bluesky
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={() => shareToSocial('facebook')}
          >
            <FacebookIcon class="h-4 w-4" /> 
            Facebook
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="gap-2"
            onclick={generateImage}
          >
            Download Image
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>
```
```


```Markdown src/lib/plan/homepage/redesign-overview.md
# App Route Redesign Plan

## Current Analysis

The current app route implements a myth-busting tool with the following features:
- Myth input and submission form
- Loading states and analysis progress
- Results display with verdict (True/False/Inconclusive)
- Detailed explanation with citation linking
- Citation viewing through hover cards
- Accordion for displaying all citations
- Origin of myth information (when available)
- Cache indicator and cache clearing functionality
- Reset functionality to verify another myth

While functional, the current design is relatively simple and could benefit from enhanced visual appeal, animations, and improved user experience.

## Redesign Goals

1. **Enhanced Visual Design**: Create a more visually appealing interface while maintaining functionality
2. **Improved User Experience**: Streamline the user journey and add micro-interactions
3. **Mobile Optimization**: Ensure better responsiveness and usability on mobile devices
4. **Performance Improvements**: Optimize rendering and state management with Svelte 5
5. **Accessibility Enhancements**: Improve accessibility for all users
6. **New Features**: Add valuable features that enhance the myth-busting experience

## Technology Stack

- **Svelte 5**: Utilize the latest Svelte features including `$state` and `$derived`, avoiding `$effect` when possible
- **ShadCN-Svelte-Next**: Leverage advanced UI components for consistent design
- **Svelte-Magic-UI**: Incorporate animated components for visual flair
- **Svelte-Motion**: Use for smooth transitions and animations
- **Lucide-Svelte**: For iconography throughout the interface

## Implementation Approach

The redesign will be implemented in phases:
1. Core UI component upgrades
2. Layout and structure improvements
3. Animation and interaction enhancements
4. New feature additions
5. Testing and refinement

Each section of this plan provides detailed specifications for the different aspects of the redesign.
```

