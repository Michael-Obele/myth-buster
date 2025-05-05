# Sonar API Integration Strategy

## API Overview
The Perplexity Sonar API will power the core myth verification functionality, providing authoritative answers with citations. This document outlines the implementation strategy, focusing on practical code examples, error handling, and caching to ensure reliable performance during the hackathon demo.

## Core Implementation

### API Client Module
```javascript
// src/lib/api/sonar.js
import { browser } from '$app/environment';

const SONAR_API_BASE_URL = 'https://api.perplexity.ai';
const CACHE_DURATION_MS = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Verifies a statement using the Sonar API
 * @param {string} statement - The statement to verify
 * @returns {Promise<{
 *   verdict: 'true' | 'false' | 'inconclusive',
 *   explanation: string,
 *   citations: Array<{title: string, url: string}>,
 *   cached: boolean
 * }>}
 */
export async function verifyStatement(statement) {
  // First check the cache
  const cachedResult = getCachedResult(statement);
  if (cachedResult) {
    return { ...cachedResult, cached: true };
  }
  
  // If not in cache, make API request
  try {
    const apiKey = import.meta.env.VITE_SONAR_API_KEY;
    if (!apiKey) {
      throw new Error('API key is not configured. Please check your environment variables.');
    }
    
    const response = await fetch(`${SONAR_API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        query: `Is the following statement true or false? Provide a detailed explanation with citations: "${statement}"`,
        options: {
          sources: true,
          include_generated_query: false,
          max_results: 10,
          show_sources_context: true
        }
      })
    });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const result = processApiResponse(data, statement);
    
    // Cache the result
    cacheResult(statement, result);
    
    return { ...result, cached: false };
  } catch (error) {
    console.error('Sonar API error:', error);
    throw error;
  }
}

/**
 * Process the raw API response into our application format
 * @param {Object} apiResponse - Raw API response
 * @param {string} originalStatement - The statement that was verified
 * @returns {Object} Formatted result
 */
function processApiResponse(apiResponse, originalStatement) {
  try {
    // Extract the main answer text
    const answerText = apiResponse.answer || '';
    
    // Determine verdict from answer text
    let verdict = 'inconclusive';
    const lowerAnswer = answerText.toLowerCase();
    
    if (
      lowerAnswer.includes('statement is true') || 
      lowerAnswer.includes('statement is correct') ||
      lowerAnswer.includes('this is true')
    ) {
      verdict = 'true';
    } else if (
      lowerAnswer.includes('statement is false') || 
      lowerAnswer.includes('statement is incorrect') ||
      lowerAnswer.includes('this is false') ||
      lowerAnswer.includes('this statement is a myth')
    ) {
      verdict = 'false';
    }
    
    // Format citations
    const citations = (apiResponse.sources || []).map(source => ({
      title: source.title || 'Unknown Source',
      url: source.url || '#',
      snippet: source.snippet || ''
    }));
    
    return {
      verdict,
      explanation: answerText,
      citations,
      timestamp: Date.now()
    };
  } catch (err) {
    console.error('Error processing API response:', err);
    return {
      verdict: 'inconclusive',
      explanation: 'We were unable to determine if this statement is true or false based on available information.',
      citations: [],
      timestamp: Date.now()
    };
  }
}

/**
 * Caching implementation using browser localStorage
 */

/**
 * Gets a cached result for a statement if available and not expired
 * @param {string} statement 
 * @returns {Object|null} Cached result or null
 */
function getCachedResult(statement) {
  if (!browser) return null;
  
  try {
    const cacheKey = createCacheKey(statement);
    const cachedItem = localStorage.getItem(`sonar_cache_${cacheKey}`);
    
    if (!cachedItem) return null;
    
    const parsedItem = JSON.parse(cachedItem);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - parsedItem.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(`sonar_cache_${cacheKey}`);
      return null;
    }
    
    return parsedItem;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
}

/**
 * Caches a result for a statement
 * @param {string} statement 
 * @param {Object} result 
 */
function cacheResult(statement, result) {
  if (!browser) return;
  
  try {
    const cacheKey = createCacheKey(statement);
    localStorage.setItem(`sonar_cache_${cacheKey}`, JSON.stringify(result));
    
    // Manage cache size to prevent exceeding localStorage limits
    pruneCache();
  } catch (error) {
    console.error('Cache storage error:', error);
    // If we hit quota issues, clear older entries
    if (error.name === 'QuotaExceededError') {
      pruneCache(true);
    }
  }
}

/**
 * Creates a consistent cache key from a statement
 * @param {string} statement 
 * @returns {string} Cache key
 */
function createCacheKey(statement) {
  // Normalize statement to create consistent keys
  return statement
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')  // Remove punctuation
    .replace(/\s+/g, '_');    // Replace spaces with underscores
}

/**
 * Prunes old cache entries to prevent storage limit issues
 * @param {boolean} aggressive - If true, removes more aggressively
 */
function pruneCache(aggressive = false) {
  if (!browser) return;
  
  try {
    const cachePrefix = 'sonar_cache_';
    const now = Date.now();
    const keysToRemove = [];
    
    // Find cache keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(cachePrefix)) {
        try {
          const value = JSON.parse(localStorage.getItem(key));
          const age = now - value.timestamp;
          
          // Remove if expired or if aggressive pruning is needed
          if (age > CACHE_DURATION_MS || (aggressive && age > CACHE_DURATION_MS / 2)) {
            keysToRemove.push(key);
          }
        } catch (e) {
          // If entry is corrupted, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove identified keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // If aggressive pruning is needed but no expired items were found,
    // remove the oldest items to make space
    if (aggressive && keysToRemove.length === 0) {
      const cacheItems = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(cachePrefix)) {
          try {
            const value = JSON.parse(localStorage.getItem(key));
            cacheItems.push({ key, timestamp: value.timestamp });
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      }
      
      // Sort by timestamp (oldest first) and remove up to 5 items
      cacheItems.sort((a, b) => a.timestamp - b.timestamp);
      cacheItems.slice(0, 5).forEach(item => localStorage.removeItem(item.key));
    }
  } catch (error) {
    console.error('Cache pruning error:', error);
  }
}
```

## Error Handling Strategy

### Error Types and Fallback States

We'll implement comprehensive error handling with appropriate fallback UI states:

```javascript
// src/lib/api/errors.js
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export class SonarApiError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'SonarApiError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Maps error types to user-friendly messages
 * @param {string} errorType - Type of error from ErrorTypes
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(errorType) {
  switch (errorType) {
    case ErrorTypes.NETWORK_ERROR:
      return "Couldn't connect to the verification service. Please check your internet connection and try again.";
    
    case ErrorTypes.RATE_LIMIT_EXCEEDED:
      return "We've reached our verification limit. Please try again in a few minutes or check previously verified myths.";
    
    case ErrorTypes.API_ERROR:
      return "The verification service is experiencing issues. We're working on it! Please try again soon.";
    
    case ErrorTypes.TIMEOUT_ERROR:
      return "The verification is taking longer than expected. Please try a simpler statement or try again later.";
    
    case ErrorTypes.UNKNOWN_ERROR:
    default:
      return "Something unexpected happened while verifying your statement. Please try again.";
  }
}

/**
 * Gets an appropriate suggestion based on error type
 * @param {string} errorType - Type of error from ErrorTypes
 * @returns {string} Suggestion for user action
 */
export function getErrorSuggestion(errorType) {
  switch (errorType) {
    case ErrorTypes.NETWORK_ERROR:
      return "You can try again when your connection improves or check out our cached myths that don't require an internet connection.";
    
    case ErrorTypes.RATE_LIMIT_EXCEEDED:
      return "To help with rate limits, we've cached popular myths. Try browsing our examples instead of a new verification.";
    
    case ErrorTypes.API_ERROR:
      return "Our team has been notified. In the meantime, you can explore previously verified myths in the cached section.";
    
    case ErrorTypes.TIMEOUT_ERROR:
      return "Try breaking your statement into simpler parts or making it more specific.";
    
    case ErrorTypes.UNKNOWN_ERROR:
    default:
      return "If this persists, let us know about the issue through our feedback form.";
  }
}
```

### Integration with UI Components

```svelte
<!-- src/lib/components/ErrorDisplay.svelte -->
<script>
  import { ErrorTypes, getErrorMessage, getErrorSuggestion } from '$lib/api/errors';
  import { Alert, AlertTitle, AlertDescription } from '$lib/components/ui/alert';
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle, RefreshCcw, Lightbulb } from 'lucide-svelte';
  
  const { 
    errorType = ErrorTypes.UNKNOWN_ERROR, 
    onRetry = () => {} 
  } = $props(/** @type {{
    errorType: string,
    onRetry?: () => void
  }} */);
  
  const errorMessage = $derived(getErrorMessage(errorType));
  const errorSuggestion = $derived(getErrorSuggestion(errorType));
  
  // Determine if retry is applicable for this error type
  const showRetry = $derived(
    errorType !== ErrorTypes.RATE_LIMIT_EXCEEDED
  );
</script>

<Alert variant="destructive" class="mb-4">
  <AlertTriangle class="h-5 w-5 mr-2" />
  <AlertTitle>Verification Error</AlertTitle>
  <AlertDescription>
    <p class="mb-2">{errorMessage}</p>
    <div class="flex items-start gap-2 mt-3">
      <Lightbulb class="h-5 w-5 flex-shrink-0 mt-0.5" />
      <p class="text-sm">{errorSuggestion}</p>
    </div>
    
    {#if showRetry}
      <div class="mt-4">
        <Button variant="outline" size="sm" on:click={() => onRetry()}>
          <RefreshCcw class="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    {/if}
  </AlertDescription>
</Alert>
```

## API Rate Limit Handling

To handle Sonar API rate limits effectively, we'll implement:

1. **Browser-based Caching**: Store results to minimize API calls
2. **Rate Limit Detection**: Identify and handle 429 Too Many Requests responses
3. **Exponential Backoff**: Smart retries with increasing delays
4. **Graceful Degradation**: Fallback to cached content when rate-limited

### Example Rate-Limit Handler

```javascript
// src/lib/api/rate-limit.js
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000;    // 30 seconds
const MAX_RETRIES = 3;

export class RateLimitManager {
  constructor() {
    this.lastRequestTime = 0;
    this.consecutiveRateLimits = 0;
    this.retryDelay = INITIAL_RETRY_DELAY;
  }
  
  /**
   * Records a successful API call
   */
  recordSuccess() {
    this.lastRequestTime = Date.now();
    this.consecutiveRateLimits = 0;
    this.retryDelay = INITIAL_RETRY_DELAY;
  }
  
  /**
   * Records a rate limit error and calculates next retry time
   * @returns {number} Milliseconds until next retry is allowed
   */
  recordRateLimit() {
    this.lastRequestTime = Date.now();
    this.consecutiveRateLimits++;
    
    // Calculate exponential backoff
    if (this.consecutiveRateLimits > 1) {
      this.retryDelay = Math.min(
        this.retryDelay * 2,
        MAX_RETRY_DELAY
      );
    }
    
    return this.retryDelay;
  }
  
  /**
   * Checks if we should allow a new request
   * @returns {boolean} True if request should be allowed
   */
  canMakeRequest() {
    // If we've hit max retries, prevent new requests for a longer period
    if (this.consecutiveRateLimits >= MAX_RETRIES) {
      const cooldownPeriod = MAX_RETRY_DELAY * 2;
      if (Date.now() - this.lastRequestTime < cooldownPeriod) {
        return false;
      }
      // Reset after cooldown
      this.consecutiveRateLimits = 0;
      this.retryDelay = INITIAL_RETRY_DELAY;
    }
    
    // Make sure we're respecting the current backoff delay
    return Date.now() - this.lastRequestTime >= this.retryDelay;
  }
  
  /**
   * Gets time remaining until next request is allowed
   * @returns {number} Milliseconds until next request
   */
  timeUntilNextRequest() {
    if (this.canMakeRequest()) return 0;
    
    const waitTime = (this.lastRequestTime + this.retryDelay) - Date.now();
    return Math.max(0, waitTime);
  }
}

// Create singleton instance for app-wide rate limit management
export const rateLimitManager = new RateLimitManager();
```

### Integration with API Client

```javascript
// Add to sonar.js

import { rateLimitManager } from './rate-limit';
import { SonarApiError, ErrorTypes } from './errors';

/**
 * Enhanced verify function with rate limit handling
 */
export async function verifyStatementWithRateLimitHandling(statement) {
  // Check cache first
  const cachedResult = getCachedResult(statement);
  if (cachedResult) {
    return { ...cachedResult, cached: true };
  }
  
  // Check if we're rate limited
  if (!rateLimitManager.canMakeRequest()) {
    const waitTime = rateLimitManager.timeUntilNextRequest();
    
    // If wait time is reasonable, we can wait and retry
    if (waitTime < 5000) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    } else {
      // Otherwise, throw rate limit error
      throw new SonarApiError(
        ErrorTypes.RATE_LIMIT_EXCEEDED,
        `Rate limited, please wait ${Math.ceil(waitTime / 1000)} seconds`,
      );
    }
  }
  
  try {
    const result = await verifyStatement(statement);
    rateLimitManager.recordSuccess();
    return result;
  } catch (error) {
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      const retryAfter = rateLimitManager.recordRateLimit();
      throw new SonarApiError(
        ErrorTypes.RATE_LIMIT_EXCEEDED,
        `Rate limited, please wait ${Math.ceil(retryAfter / 1000)} seconds`,
        error
      );
    }
    
    // Handle other errors
    if (error.cause?.name === 'AbortError') {
      throw new SonarApiError(
        ErrorTypes.TIMEOUT_ERROR,
        'Request timed out',
        error
      );
    } else if (error.cause?.name === 'TypeError' && error.cause?.message.includes('fetch')) {
      throw new SonarApiError(
        ErrorTypes.NETWORK_ERROR,
        'Network error',
        error
      );
    } else {
      throw new SonarApiError(
        ErrorTypes.API_ERROR,
        error.message || 'Unknown API error',
        error
      );
    }
  }
}
```

## Mock Data for Development and Demos

To ensure reliable development and demos without hitting API limits, we'll create a mock API module:

```javascript
// src/lib/api/mock-sonar.js
const MOCK_DELAY_MS = 1500; // Simulate API delay

/**
 * Mock myth database for development and demos
 */
const MOCK_MYTHS = [
  {
    statement: "cracking your knuckles causes arthritis",
    verdict: "false",
    explanation: "Cracking your knuckles does not cause arthritis. The sound is caused by gas bubbles popping in the synovial fluid of the joints, but this does not lead to arthritis. Multiple studies, including a long-term study where a doctor cracked knuckles on only one hand for decades, found no connection between knuckle cracking and arthritis.",
    citations: [
      {
        title: "Harvard Health Publishing - Does cracking knuckles cause arthritis?",
        url: "https://www.health.harvard.edu/blog/does-cracking-knuckles-cause-arthritis-2018051413782",
        snippet: "According to Harvard Health, multiple studies have found no link between knuckle cracking and arthritis."
      },
      {
        title: "Journal of the American Board of Family Medicine - Knuckle Cracking and Hand Osteoarthritis",
        url: "https://www.jabfm.org/content/24/2/169",
        snippet: "A study published in the Journal of the American Board of Family Medicine found no correlation between knuckle cracking and hand osteoarthritis."
      }
    ]
  },
  {
    statement: "we only use 10% of our brains",
    verdict: "false",
    explanation: "The claim that humans only use 10% of their brains is a widespread myth with no scientific basis. Modern brain imaging technology shows that all parts of the brain have active functions, and even during sleep, significant brain activity continues. Different activities engage different parts of the brain, but there is no 'unused' 90%. Damage to even small areas of the brain can have profound effects, indicating the importance of the entire brain.",
    citations: [
      {
        title: "Scientific American - Do People Only Use 10 Percent of Their Brains?",
        url: "https://www.scientificamerican.com/article/do-people-only-use-10-percent-of-their-brains/",
        snippet: "Scientific American explains that brain imaging studies clearly show activity throughout the entire brain, even during sleep."
      },
      {
        title: "BBC Future - The Ten Percent Brain Myth",
        url: "https://www.bbc.com/future/article/20121112-do-we-only-use-10-of-our-brains",
        snippet: "The BBC reports that the 10% myth may have originated from early neuroscientists who were trying to explain the unexplored potential of the human brain."
      }
    ]
  },
  {
    statement: "vitamin c prevents the common cold",
    verdict: "inconclusive",
    explanation: "Whether vitamin C prevents the common cold is inconclusive based on scientific evidence. While vitamin C doesn't appear to prevent colds in the general population, some studies suggest it may reduce the risk in people exposed to extreme physical stress or cold environments (like marathon runners or soldiers in subarctic conditions). Regular vitamin C supplementation may slightly reduce cold duration and severity, but the effect is generally modest. Large doses of vitamin C after cold symptoms appear don't provide benefit.",
    citations: [
      {
        title: "National Institutes of Health - Vitamin C Fact Sheet",
        url: "https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/",
        snippet: "The NIH reports that regular vitamin C supplementation doesn't prevent colds in the general population but may reduce their severity and duration."
      },
      {
        title: "Cochrane Library - Vitamin C for preventing and treating the common cold",
        url: "https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD000980.pub4/full",
        snippet: "A major review found that vitamin C supplementation doesn't reduce cold incidence in the general community but may be useful for people exposed to extreme physical exercise or cold environments."
      }
    ]
  }
];

/**
 * Mock implementation of verify statement for development and demos
 * @param {string} statement 
 * @returns {Promise<Object>}
 */
export async function mockVerifyStatement(statement) {
  // Normalize statement for comparison
  const normalizedStatement = statement.trim().toLowerCase();
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));
  
  // Find exact or fuzzy match
  const exactMatch = MOCK_MYTHS.find(
    myth => myth.statement.toLowerCase() === normalizedStatement
  );
  
  if (exactMatch) {
    return {
      ...exactMatch,
      cached: false
    };
  }
  
  // Look for partial matches
  const partialMatches = MOCK_MYTHS.filter(
    myth => normalizedStatement.includes(myth.statement) || 
            myth.statement.includes(normalizedStatement)
  );
  
  if (partialMatches.length > 0) {
    // Return the first partial match
    return {
      ...partialMatches[0],
      cached: false,
      explanation: `Note: This is based on a similar myth. ${partialMatches[0].explanation}`
    };
  }
  
  // For unrecognized statements, return a generic response
  // This is useful for demo purposes
  return {
    statement: normalizedStatement,
    verdict: Math.random() > 0.7 ? 'true' : (Math.random() > 0.5 ? 'false' : 'inconclusive'),
    explanation: `This is a simulated response for "${statement}". In the actual app, we would use the Sonar API to verify this statement with real sources and citations.`,
    citations: [
      {
        title: "Demo Citation - This is an example",
        url: "https://example.com",
        snippet: "This is an example citation that would be replaced with real data from the Sonar API."
      }
    ],
    cached: false
  };
}

// Export both real and mock API functions
export const apiClient = {
  verifyStatement: import.meta.env.VITE_USE_MOCK_API === 'true' 
    ? mockVerifyStatement 
    : verifyStatementWithRateLimitHandling
};
```

## Integration with Svelte 5 Components

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { apiClient } from '$lib/api/sonar';
  import { ErrorTypes, SonarApiError } from '$lib/api/errors';
  import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
  import VerdictDisplay from '$lib/components/VerdictDisplay.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Skeleton } from '$lib/components/ui/skeleton';
  
  // State management
  let statement = $state('');
  let isVerifying = $state(false);
  let error = $state(null);
  let result = $state(null);
  
  // Derived state for UI rendering
  let canVerify = $derived(statement.trim().length > 0 && !isVerifying);
  
  // Handle verification
  async function verifyMyth() {
    if (!canVerify) return;
    
    isVerifying = true;
    error = null;
    result = null;
    
    try {
      result = await apiClient.verifyStatement(statement);
    } catch (err) {
      if (err instanceof SonarApiError) {
        error = err;
      } else {
        error = new SonarApiError(
          ErrorTypes.UNKNOWN_ERROR,
          'An unexpected error occurred',
          err
        );
      }
    } finally {
      isVerifying = false;
    }
  }
</script>

<div class="container mx-auto max-w-4xl py-8 px-4">
  <h1 class="text-3xl font-bold mb-6 text-center">Myth Buster</h1>
  
  <Card class="mb-6">
    <CardHeader>
      <CardTitle>Verify a Statement</CardTitle>
    </CardHeader>
    <CardContent>
      <Textarea
        placeholder="Enter a statement to verify (e.g., 'Cracking knuckles causes arthritis')"
        bind:value={statement}
        class="mb-2"
      />
    </CardContent>
    <CardFooter>
      <Button 
        on:click={verifyMyth} 
        disabled={!canVerify}
        class="w-full md:w-auto"
      >
        {isVerifying ? 'Verifying...' : 'Verify Statement'}
      </Button>
    </CardFooter>
  </Card>
  
  {#if error}
    <ErrorDisplay 
      errorType={error.type} 
      onRetry={verifyMyth} 
    />
  {/if}
  
  {#if isVerifying}
    <Card>
      <CardHeader>
        <Skeleton class="h-8 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton class="h-4 w-full mb-2" />
        <Skeleton class="h-4 w-full mb-2" />
        <Skeleton class="h-4 w-5/6 mb-2" />
        <Skeleton class="h-4 w-4/6" />
      </CardContent>
    </Card>
  {:else if result}
    <VerdictDisplay 
      verdict={result.verdict} 
      explanation={result.explanation} 
      citations={result.citations} 
    />
  {/if}
</div>
```

## Browser Storage Implementation for Persistent Cache

```javascript
// src/lib/storage/browser-storage.js
import { browser } from '$app/environment';

/**
 * Browser storage service for caching and offline functionality
 */
class BrowserStorageService {
  constructor() {
    this.available = browser && this.isStorageAvailable('localStorage');
  }
  
  /**
   * Checks if a storage type is available
   * @param {string} type - Storage type ('localStorage' or 'sessionStorage')
   * @returns {boolean}
   */
  isStorageAvailable(type) {
    try {
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Gets an item from localStorage with expiration handling
   * @param {string} key - Storage key
   * @returns {any|null} - Parsed value or null if not found/expired
   */
  getItem(key) {
    if (!this.available) return null;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const { value, expiry } = JSON.parse(item);
      
      // Check if item has expired
      if (expiry && expiry < Date.now()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return value;
    } catch (e) {
      console.error('Error retrieving from storage:', e);
      return null;
    }
  }
  
  /**
   * Sets an item in localStorage with optional expiration
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @param {number} [ttl] - Time to live in milliseconds
   * @returns {boolean} - Success status
   */
  setItem(key, value, ttl = null) {
    if (!this.available) return false;
    
    try {
      const item = {
        value,
        expiry: ttl ? Date.now() + ttl : null
      };
      
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (e) {
      console.error('Error setting storage:', e);
      
      // If we hit quota error, try to clear some space
      if (e.name === 'QuotaExceededError') {
        this.clearOldestItems(5);
        
        // Try again after clearing
        try {
          const item = {
            value,
            expiry: ttl ? Date.now() + ttl : null
          };
          
          localStorage.setItem(key, JSON.stringify(item));
          return true;
        } catch (retryError) {
          console.error('Failed to store even after clearing space:', retryError);
        }
      }
      
      return false;
    }
  }
  
  /**
   * Removes an item from localStorage
   * @param {string} key - Storage key
   */
  removeItem(key) {
    if (this.available) {
      localStorage.removeItem(key);
    }
  }
  
  /**
   * Clears all items or those with a specific prefix
   * @param {string} [prefix] - Optional prefix to limit clearing
   */
  clear(prefix = '') {
    if (!this.available) return;
    
    if (!prefix) {
      localStorage.clear();
      return;
    }
    
    // Clear only items with the given prefix
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
  
  /**
   * Clears expired items to free up space
   */
  clearExpired() {
    if (!this.available) return;
    
    const now = Date.now();
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      
      if (!key) continue;
      
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item.expiry && item.expiry < now) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        // If we can't parse the item, it's not in our format, so skip it
        continue;
      }
    }
  }
  
  /**
   * Clears oldest items to free up space
   * @param {number} count - Number of items to clear
   */
  clearOldestItems(count) {
    if (!this.available || count <= 0) return;
    
    const items = [];
    
    // Collect items with their timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      try {
        const data = JSON.parse(localStorage.getItem(key));
        
        // Use expiry time if available, otherwise use current time (least priority for deletion)
        items.push({
          key,
          timestamp: data.expiry || Date.now()
        });
      } catch (e) {
        // If we can't parse, use a default old timestamp to prioritize for removal
        items.push({
          key,
          timestamp: 0
        });
      }
    }
    
    // Sort by timestamp (oldest first)
    items.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove the oldest items
    items.slice(0, count).forEach(item => {
      localStorage.removeItem(item.key);
    });
  }
}

// Export singleton instance
export const storageService = new BrowserStorageService();
```

This comprehensive Sonar API integration strategy addresses several key implementation concerns:

1. **Efficient API Usage**: Caching results in browser storage to minimize API calls
2. **Graceful Error Handling**: Detailed error types with user-friendly messages
3. **Rate Limit Management**: Smart retry logic with exponential backoff
4. **Development/Demo Support**: Mock API implementation for testing without API access
5. **Offline Capabilities**: Local storage with expiration handling for cached results

The strategy also includes specific code examples that can be directly integrated into the Svelte 5 application, ensuring a robust and reliable myth verification experience.