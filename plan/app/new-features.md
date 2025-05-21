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
