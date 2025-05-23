# Deep Research UX Design

This document outlines the user experience design principles and implementation details for the deep research features of the Myth Buster application.

## Core UX Principles

Our deep research UX design is guided by these core principles:

1. **Progressive Disclosure:** Complex research capabilities are revealed gradually to avoid overwhelming users.
2. **Research Narrative:** The UI creates a coherent story of the research journey.
3. **Visual Distinction:** Different types of research are visually distinguished to help users understand the information hierarchy.
4. **User Agency:** The design emphasizes user control and choice in the research process.
5. **Meaningful Animation:** Animations serve functional purposes, conveying the depth and progress of research.

## Research Journey Flow

### 1. Entry Point: Myth Verification

- **Initial Experience:**
  - Users begin with the familiar, simple myth input interface.
  - After submission, results appear with a clear verdict, explanation, and citations.
  - A new "Explore Deeper" section appears below the initial results, serving as the gateway to deep research.

- **Visual Design:**
  - The "Explore Deeper" section uses a distinct background color and subtle animation to attract attention.
  - An icon (e.g., magnifying glass with layers) visually communicates the concept of deeper exploration.
  - A brief explanation helps users understand what deep research offers beyond the initial verification.

- **Interaction Design:**
  - Clicking "Explore Deeper" smoothly expands the section, revealing the research options.
  - The transition animation suggests "digging deeper" by having content emerge from below.

### 2. Multi-Angle Investigation

- **Interface Components:**
  - A horizontally scrollable set of "Research Lens" cards with distinct icons and colors for each lens type.
  - Each lens card includes a brief description of the perspective it offers.
  - A prominently featured "Create Custom Lens" card with a "+" icon.

- **Visual Design:**
  - Each lens card uses subtle iconography representing its research perspective (e.g., clock for historical, microscope for scientific).
  - Active/selected lens is visually highlighted.
  - Custom lens has a distinct visual treatment emphasizing user creation.

- **Interaction Design:**
  - Clicking a lens card expands it to show a loading state with research steps.
  - Loading indicators show "Searching sources... Analyzing perspective... Synthesizing findings..." to communicate research depth.
  - When results load, the card smoothly transitions to display the findings.
  - Multiple lenses can be activated, creating a collection of research angles.

- **Custom Lens Input:**
  - Clicking the "Create Custom Lens" card reveals a form with:
    - Text input for the lens name/title
    - Textarea for describing the research angle
    - Helper text suggesting effective custom lens ideas
  - The form includes real-time feedback on input quality.

### 3. Evidence Deconstruction & Source Analysis

- **Interface Components:**
  - Enhanced citation list with interactive elements
  - "Analyze Source" buttons next to each citation
  - Modal dialog for source analysis
  - Analysis type selector and custom query input

- **Visual Design:**
  - Citations include subtle visual indicators of source type (academic, news, etc.)
  - Analysis options presented as categorized chips or buttons
  - Results displayed in a structured format with hierarchical typography

- **Interaction Design:**
  - Hovering over a citation reveals the "Analyze Source" button
  - Clicking opens a modal with pre-populated source details
  - Users can select from analysis types or enter a custom query
  - Loading states visualize the analytical process
  - Results can be saved/pinned for comparison

### 4. Insight Mapping & Connection Weaver

- **Interface Components:**
  - "Synthesize Insights" button that appears after multiple research angles are explored
  - Results display with sections for:
    - Key themes identified
    - Points of agreement across sources/angles
    - Contradictions or tensions
    - Unexpected connections
  - Visual connection map (if implementation time permits)

- **Visual Design:**
  - Themes displayed as distinct cards with visual hierarchy indicating importance
  - Connections between themes shown with lines of varying thickness/style
  - Color coding to indicate the nature of connections (supporting, contradicting, etc.)

- **Interaction Design:**
  - Clicking "Synthesize Insights" triggers an animated transition showing the "weaving" of research threads
  - The loading state visualizes the synthesis process
  - Results appear with a subtle animation suggesting emergence of patterns
  - Users can hover over connections to highlight related themes
  - Themes can be clicked to see supporting evidence from various research angles

## Micro-interactions & Animation

### Research Progress Indicators

- **Purpose:** Communicate that deep, multi-step research is being performed
- **Implementation:**
  - Replace generic loading spinners with a sequence of research steps
  - Each step appears with a typing animation:
    1. "Searching relevant sources..."
    2. "Analyzing [X] perspective..."
    3. "Evaluating evidence quality..."
    4. "Synthesizing findings..."
  - Steps complete with checkmarks
  - Progress bar subtly advances through steps

### Transition Animations

- **Between Research Levels:**
  - Initial results to deep research: Subtle "zoom in" effect
  - Between research lenses: Horizontal slide transition
  - From individual analyses to synthesis: "Gathering" animation

- **Research Completion:**
  - Results appear with a subtle fade-in
  - Key insights highlighted with brief glow effect
  - Citation linking with animated connecting lines

### Interaction Feedback

- **Lens Selection:**
  - Selected lens raises slightly and gains a shadow
  - Unselected lenses dim slightly
  - Brief pulse animation when new lens results arrive

- **Source Analysis:**
  - Citation being analyzed is highlighted
  - Modal emerges with smooth motion
  - Analysis type selection provides immediate visual feedback

## Mobile Adaptation

### Responsive Design Strategies

- **Research Lens Navigation:**
  - Horizontal lens cards become a vertically scrolling accordion on mobile
  - Active lens expands, others collapse to headers only

- **Information Density Management:**
  - Use progressive disclosure even more aggressively
  - Collapsible sections for different parts of research findings
  - "Read more" expansions for longer analyses

- **Touch Optimization:**
  - Larger touch targets for interactive elements
  - Swipe gestures to navigate between research lenses
  - Pull-to-refresh to update research findings

## Accessibility Considerations

### Navigation & Controls

- All interactive elements fully keyboard navigable
- Clear focus states for all interactive components
- Logical tab order following the research journey

### Content Perception

- Color is never the sole indicator of meaning
- All visualizations include text alternatives
- Sufficient contrast for all text and interactive elements

### Assistive Technology Support

- ARIA labels for complex research components
- Screen reader announcements for research progress
- Alternative text for all visualizations and graphics

## Visual Language

### Color System

- **Base Research Palette:**
  - Neutral background for primary content
  - Accent color for interactive elements
  - Success/warning/error states for research confidence

- **Lens-Specific Colors:**
  - Historical: Warm amber/sepia tones
  - Scientific: Cool blue tones
  - Cultural: Rich purple tones
  - Psychological: Green tones
  - Custom: Distinct teal or coral

### Typography Hierarchy

- **Research Headers:** Large, prominent for lens titles
- **Analysis Subheadings:** Medium, distinguishes sections within a lens
- **Insight Text:** Comfortable reading size for findings
- **Supporting Details:** Smaller size for citations and metadata
- **Interactive Elements:** Bold or emphasized for clear affordance

### Iconography

- **Research Process Icons:**
  - Magnifying glass with layers: Deep research
  - Clock/timeline: Historical lens
  - Microscope/atom: Scientific lens
  - People/globe: Cultural lens
  - Brain/thought bubble: Psychological lens
  - Connect/network: Insight mapping

- **Interaction Icons:**
  - Plus: Add custom lens
  - Document with magnifier: Analyze source
  - Web: Show connections
  - Bookmark: Save research

## Implementation Guidelines

### Component Structure

- Build atomic components for research elements
- Create consistent patterns for research cards, headers, and result displays
- Implement responsive containers for all research views

### State Management

- Use clear visual indicators for all research states:
  - Inactive/available
  - Selected/in progress
  - Completed
  - Error state
  - Saved/bookmarked

### Performance Considerations

- Lazy load research components
- Implement virtual scrolling for long research results
- Optimize animations for devices with limited resources

This UX design transforms Myth Buster from a simple verification tool into an engaging deep research platform that guides users through sophisticated analysis while maintaining clarity and usability.