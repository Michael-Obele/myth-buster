# Error Handling Strategy for Myth Buster App

A comprehensive error handling strategy is crucial for a polished web application, especially one that relies on external APIs. This document outlines a robust approach to handling errors in the Myth Buster app, with specific code examples for implementation.

## Types of Errors

The Myth Buster app may encounter several categories of errors:

1. **API Errors**
   - Rate limiting (429 Too Many Requests)
   - Authentication failures (401 Unauthorized)
   - Server errors (500 Internal Server Error)
   - Timeout errors (request takes too long)

2. **Network Errors**
   - Offline state (no internet connection)
   - Intermittent connection issues
   - CORS errors (cross-origin issues)

3. **Input Validation Errors**
   - Empty queries
   - Malformed statements
   - Potentially harmful inputs

4. **Application Errors**
   - Rendering failures
   - State management issues
   - Browser compatibility problems

5. **Storage Errors**
   - Local storage quota exceeded
   - Corrupted cache data
   - Permission issues

## Error Handling Architecture

### 1. Centralized Error Management

```typescript
// src/lib/errors/errorTypes.ts

/**
 * Error types for Myth Buster app
 */
export enum ErrorType {
  // API Errors
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_AUTHENTICATION = 'API_AUTHENTICATION',
  API_SERVER_ERROR = 'API_SERVER_ERROR',
  API_TIMEOUT = 'API_TIMEOUT',
  API_MALFORMED_RESPONSE = 'API_MALFORMED_RESPONSE',
  
  // Network Errors
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_UNSTABLE = 'NETWORK_UNSTABLE',
  NETWORK_CORS = 'NETWORK_CORS',
  
  // Input Errors
  INPUT_EMPTY = 'INPUT_EMPTY',
  INPUT_INVALID = 'INPUT_INVALID',
  INPUT_TOO_COMPLEX = 'INPUT_TOO_COMPLEX',
  
  // Application Errors
  APP_RENDER_ERROR = 'APP_RENDER_ERROR',
  APP_STATE_ERROR = 'APP_STATE_ERROR',
  APP_BROWSER_COMPAT = 'APP_BROWSER_COMPAT',
  
  // Storage Errors
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_CORRUPTED = 'STORAGE_CORRUPTED',
  STORAGE_PERMISSION = 'STORAGE_PERMISSION',
  
  // Fallback
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Custom error class for Myth Buster app
 */
export class MythBusterError extends Error {
  type: ErrorType;
  originalError?: Error;
  details?: Record<string, any>;
  
  constructor(
    type: ErrorType,
    message: string,
    originalError?: Error,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'MythBusterError';
    this.type = type;
    this.originalError = originalError;
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, MythBusterError.prototype);
  }
}
```

### 2. Error State Management with Svelte 5

```svelte
<!-- src/lib/stores/errorStore.svelte -->
<script context="module">
  import { ErrorType, MythBusterError } from '$lib/errors/errorTypes';
  
  // Global error state
  export let currentError = $state(null);
  export let errorHistory = $state([]);
  export let hasError = $derived(currentError !== null);
  
  // Maximum number of errors to keep in history
  const MAX_ERROR_HISTORY = 10;
  
  /**
   * Set the current error
   * @param {MythBusterError | null} error The error to set, or null to clear
   */
  export function setError(error) {
    if (error) {
      // Add to history first
      errorHistory = [error, ...errorHistory].slice(0, MAX_ERROR_HISTORY);
      
      // Set as current error
      currentError = error;
      
      // Log to console for debugging
      console.error('MythBuster Error:', error);
    } else {
      // Clear current error
      currentError = null;
    }
  }
  
  /**
   * Clear the current error
   */
  export function clearError() {
    currentError = null;
  }
  
  /**
   * Create and set a new error
   * @param {ErrorType} type Error type
   * @param {string} message User-friendly message
   * @param {Error} [originalError] Original error that caused this
   * @param {Record<string, any>} [details] Additional error details
   */
  export function createError(type, message, originalError, details) {
    const error = new MythBusterError(type, message, originalError, details);
    setError(error);
    return error;
  }
</script>
```

### 3. Error Boundary Component

```svelte
<!-- src/lib/components/ErrorBoundary.svelte -->
<script>
  import { Button } from '@/lib/components/ui/button';
  import { Alert, AlertTitle, AlertDescription } from '@/lib/components/ui/alert';
  import { RefreshCcw } from 'lucide-svelte';
  import { ErrorType } from '$lib/errors/errorTypes';
  
  const { 
    fallback = null 
  } = $props(/** @type {{
    fallback?: any
  }} */);
  
  let error = $state(null);
  let errorInfo = $state(null);
  
  // Catch errors during rendering
  onError((err, info) => {
    error = err;
    errorInfo = info;
    
    // Log to console
    console.error('Error caught by boundary:', err, info);
  });
  
  // Reset the error state
  function resetError() {
    error = null;
    errorInfo = null;
  }
  
  // Get user-friendly error message
  function getErrorMessage(err) {
    if (err?.type && Object.values(ErrorType).includes(err.type)) {
      return err.message;
    }
    
    return 'Something went wrong. Please try again.';
  }
</script>

{#if error}
  {#if fallback}
    <svelte:component this={fallback} {error} {resetError} />
  {:else}
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        <p>{getErrorMessage(error)}</p>
        <div class="mt-4">
          <Button variant="outline" size="sm" on:click={resetError}>
            <RefreshCcw class="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  {/if}
{:else}
  <slot />
{/if}
```

## API Error Handling

### 1. API Request Wrapper

```typescript
// src/lib/api/apiClient.ts
import { createError, setError } from '$lib/stores/errorStore';
import { ErrorType, MythBusterError } from '$lib/errors/errorTypes';
import { storageService } from '$lib/storage/browser-storage';

// Default timeout for API requests in milliseconds
const DEFAULT_TIMEOUT = 15000;

/**
 * Options for API requests
 */
interface ApiRequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  cache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
}

/**
 * Make an API request with comprehensive error handling
 * @param url The URL to request
 * @param options Request options
 * @returns Response data
 */
export async function apiRequest<T>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = DEFAULT_TIMEOUT,
    cache = false,
    cacheKey,
    cacheTtl = 3600000 // 1 hour default
  } = options;
  
  // Check if we should use cached data
  if (cache && cacheKey) {
    const cachedData = storageService.getItem(cacheKey);
    if (cachedData) {
      return cachedData as T;
    }
  }
  
  // Check network status first
  if (!navigator.onLine) {
    throw new MythBusterError(
      ErrorType.NETWORK_OFFLINE,
      'You appear to be offline. Please check your internet connection and try again.'
    );
  }
  
  try {
    // Set up timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Make the request
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal
    });
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Handle HTTP error statuses
    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new MythBusterError(
            ErrorType.API_AUTHENTICATION,
            'Authentication failed. Please check your API key.'
          );
        
        case 429:
          throw new MythBusterError(
            ErrorType.API_RATE_LIMIT,
            'You\'ve reached the API rate limit. Please try again later.',
            null,
            { retryAfter: response.headers.get('Retry-After') }
          );
        
        case 500:
        case 502:
        case 503:
        case 504:
          throw new MythBusterError(
            ErrorType.API_SERVER_ERROR,
            'The server encountered an error. Please try again later.',
            null,
            { status: response.status }
          );
        
        default:
          throw new MythBusterError(
            ErrorType.UNKNOWN_ERROR,
            `Request failed with status ${response.status}`,
            null,
            { status: response.status }
          );
      }
    }
    
    // Parse the response
    let data: T;
    try {
      data = await response.json() as T;
    } catch (error) {
      throw new MythBusterError(
        ErrorType.API_MALFORMED_RESPONSE,
        'Failed to parse API response',
        error as Error
      );
    }
    
    // Cache the data if needed
    if (cache && cacheKey && data) {
      storageService.setItem(cacheKey, data, cacheTtl);
    }
    
    return data;
  } catch (error) {
    // Handle specific error types
    if (error instanceof MythBusterError) {
      throw error;
    }
    
    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new MythBusterError(
        ErrorType.API_TIMEOUT,
        'The request took too long to complete. Please try again.',
        error
      );
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new MythBusterError(
        ErrorType.NETWORK_UNSTABLE,
        'A network error occurred. Please check your connection and try again.',
        error
      );
    }
    
    // Generic error fallback
    throw new MythBusterError(
      ErrorType.UNKNOWN_ERROR,
      'An unexpected error occurred',
      error as Error
    );
  }
}
```

### 2. Fallback UI States

Each error type should have an appropriate UI representation:

```svelte
<!-- src/lib/components/ErrorFallback.svelte -->
<script>
  import { ErrorType } from '$lib/errors/errorTypes';
  import { Button } from '@/lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { 
    RefreshCcw, 
    WifiOff, 
    Clock, 
    AlertTriangle, 
    Server, 
    Shield 
  } from 'lucide-svelte';
  
  const { 
    error, 
    resetError,
    onRetry
  } = $props(/** @type {{
    error: any,
    resetError: () => void,
    onRetry?: () => void
  }} */);
  
  // Determine which icon to show based on error type
  const errorIcon = $derived(() => {
    switch (error?.type) {
      case ErrorType.NETWORK_OFFLINE:
      case ErrorType.NETWORK_UNSTABLE:
      case ErrorType.NETWORK_CORS:
        return WifiOff;
        
      case ErrorType.API_TIMEOUT:
        return Clock;
        
      case ErrorType.API_RATE_LIMIT:
        return Shield;
        
      case ErrorType.API_SERVER_ERROR:
        return Server;
        
      default:
        return AlertTriangle;
    }
  });
  
  // Get a user-friendly title
  const errorTitle = $derived(() => {
    switch (error?.type) {
      case ErrorType.NETWORK_OFFLINE:
        return 'You\'re Offline';
        
      case ErrorType.NETWORK_UNSTABLE:
        return 'Connection Issue';
        
      case ErrorType.API_TIMEOUT:
        return 'Request Timeout';
        
      case ErrorType.API_RATE_LIMIT:
        return 'Rate Limit Reached';
        
      case ErrorType.API_SERVER_ERROR:
        return 'Server Error';
        
      case ErrorType.API_AUTHENTICATION:
        return 'Authentication Failed';
        
      default:
        return 'Error Occurred';
    }
  });
  
  // Get suggestion text
  const suggestion = $derived(() => {
    switch (error?.type) {
      case ErrorType.NETWORK_OFFLINE:
        return 'Check your internet connection and try again.';
        
      case ErrorType.API_RATE_LIMIT:
        return error.details?.retryAfter 
          ? `Please try again in ${error.details.retryAfter} seconds.`
          : 'Please try again in a few minutes.';
        
      case ErrorType.API_TIMEOUT:
        return 'The request took too long. Try a simpler statement or check your connection.';
        
      case ErrorType.STORAGE_QUOTA_EXCEEDED:
        return 'We couldn\'t save to your browser storage. Try clearing some cached data.';
        
      default:
        return 'Please try again or check back later.';
    }
  });
  
  // Determine if we should show a retry button
  const showRetry = $derived(() => {
    return error?.type !== ErrorType.API_AUTHENTICATION;
  });
  
  // Handle retry action
  function handleRetry() {
    resetError();
    if (onRetry) {
      onRetry();
    }
  }
</script>

<Card class="w-full border-red-200 dark:border-red-900">
  <CardHeader>
    <div class="flex items-center gap-2">
      <svelte:component this={errorIcon} class="h-5 w-5 text-red-500" />
      <CardTitle>{errorTitle}</CardTitle>
    </div>
  </CardHeader>
  
  <CardContent>
    <p class="text-gray-700 dark:text-gray-300">{error.message}</p>
    {#if suggestion}
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{suggestion}</p>
    {/if}
  </CardContent>
  
  {#if showRetry}
    <CardFooter>
      <Button variant="outline" on:click={handleRetry}>
        <RefreshCcw class="h-4 w-4 mr-2" />
        Try Again
      </Button>
    </CardFooter>
  {/if}
</Card>
```

### 3. Error-Specific Components

For certain errors, specialized components provide better UX:

```svelte
<!-- src/lib/components/OfflineNotice.svelte -->
<script>
  import { Alert, AlertTitle, AlertDescription } from '@/lib/components/ui/alert';
  import { WifiOff } from 'lucide-svelte';
  
  // State to track online status
  let isOnline = $state(navigator.onLine);
  
  // Update online status when it changes
  function updateOnlineStatus() {
    isOnline = navigator.onLine;
  }
  
  // Set up event listeners
  onMount(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  });
</script>

{#if !isOnline}
  <Alert variant="warning" class="mb-4">
    <WifiOff class="h-4 w-4 mr-2" />
    <AlertTitle>You're offline</AlertTitle>
    <AlertDescription>
      Your internet connection appears to be offline. Some features may be unavailable.
      {#if navigator.serviceWorker?.controller}
        Previously verified myths are available in offline mode.
      {/if}
    </AlertDescription>
  </Alert>
{/if}
```

## Input Validation and Error Prevention

Prevent errors before they happen with robust input validation:

```svelte
<!-- src/lib/components/StatementInput.svelte -->
<script>
  import { Textarea } from '@/lib/components/ui/textarea';
  import { Label } from '@/lib/components/ui/label';
  import { createError } from '$lib/stores/errorStore';
  import { ErrorType } from '$lib/errors/errorTypes';
  
  let value = $state('');
  let validationError = $state('');
  
  // Validate input on change
  function validateInput() {
    // Clear previous error
    validationError = '';
    
    // Check for empty input
    if (!value.trim()) {
      validationError = 'Please enter a statement to verify.';
      return false;
    }
    
    // Check for excessively long input
    if (value.length > 500) {
      validationError = 'Statement is too long. Please limit to 500 characters.';
      return false;
    }
    
    // Check for potentially harmful inputs (example check)
    const harmfulPatterns = [
      /DROP TABLE/i,
      /<script>/i
    ];
    
    for (const pattern of harmfulPatterns) {
      if (pattern.test(value)) {
        validationError = 'Please remove potentially harmful content from your statement.';
        return false;
      }
    }
    
    return true;
  }
  
  // Handle form submission
  function handleSubmit() {
    if (!validateInput()) {
      createError(
        ErrorType.INPUT_INVALID,
        validationError,
        null,
        { input: value }
      );
      return;
    }
    
    // Dispatch event with validated input
    dispatch('submit', value);
  }
  
  function dispatch(name, detail) {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
  }
</script>

<div class="grid w-full gap-1.5">
  <Label for="statement">Statement</Label>
  <Textarea
    id="statement"
    bind:value
    placeholder="Enter a statement to verify..."
    class={validationError ? 'border-red-500' : ''}
  />
  
  {#if validationError}
    <p class="text-sm text-red-500 mt-1">{validationError}</p>
  {/if}
</div>
```

## Graceful Degradation Strategy

### 1. Cached Results Fallback

```svelte
<!-- src/lib/components/CachedResultsFallback.svelte -->
<script>
  import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
  import { Button } from '@/lib/components/ui/button';
  import { Database } from 'lucide-svelte';
  import { storageService } from '$lib/storage/browser-storage';
  
  // State for cached myths
  let cachedMyths = $state([]);
  
  // Load cached myths on mount
  onMount(() => {
    loadCachedMyths();
  });
  
  // Load myths from cache
  function loadCachedMyths() {
    const keys = storageService.getAllKeys('sonar_cache_');
    
    const myths = keys
      .map(key => {
        const data = storageService.getItem(key);
        return data ? {
          statement: data.statement,
          verdict: data.verdict,
          explanation: data.explanation,
          cached: true
        } : null;
      })
      .filter(Boolean)
      .slice(0, 5); // Limit to 5 most recent
    
    cachedMyths = myths;
  }
  
  // Handle selecting a cached myth
  function selectMyth(myth) {
    const event = new CustomEvent('select-cached', { detail: myth });
    dispatch('select-cached', myth);
  }
</script>

<Card>
  <CardHeader>
    <div class="flex items-center gap-2">
      <Database class="h-5 w-5 text-blue-500" />
      <CardTitle>Available While Offline</CardTitle>
    </div>
  </CardHeader>
  
  <CardContent>
    {#if cachedMyths.length === 0}
      <p class="text-gray-500">No cached myths available.</p>
    {:else}
      <p class="mb-4 text-sm text-gray-500">
        While you're offline or experiencing API issues, you can view these previously verified myths:
      </p>
      
      <div class="space-y-2">
        {#each cachedMyths as myth}
          <Button 
            variant="outline" 
            class="w-full justify-start" 
            on:click={() => selectMyth(myth)}
          >
            <span class="truncate">{myth.statement}</span>
          </Button>
        {/each}
      </div>
    {/if}
  </CardContent>
</Card>
```

### 2. Service Worker for Offline Experience

```javascript
// src/service-worker.js
import { build, files, version } from '$service-worker';

// Cache name includes version for easy updates
const CACHE_NAME = `myth-buster-cache-${version}`;

// Assets to cache immediately
const ASSETS = [
  ...build, // Vite/SvelteKit generated assets
  ...files  // Static files in public directory
];

// Additional routes to cache when visited
const ROUTES_TO_CACHE = [
  '/',
  '/offline'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip API requests (handle separately)
  if (event.request.url.includes('/api/')) {
    // For API requests, try network first, then fallback to offline page
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline'))
    );
    return;
  }
  
  // For navigation requests, try network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the page if it's in our ROUTES_TO_CACHE list
          if (ROUTES_TO_CACHE.some(route => 
            event.request.url.endsWith(route))) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              return cachedResponse || caches.match('/offline');
            });
        })
    );
    return;
  }
  
  // For other requests (assets, etc), try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        return cachedResponse || fetch(event.request)
          .then((response) => {
            // Cache successful responses
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(() => {
            // For images, fonts, etc., return a fallback
            if (event.request.destination === 'image') {
              return caches.match('/images/fallback.png');
            }
            
            // For other resources, just fail
            return new Response('Resource not available offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});
```

## Integration with Main Application

Put everything together in the main application flow:

```svelte
<!-- src/routes/+page.svelte -->
<script>
  import { ErrorBoundary } from '$lib/components/ErrorBoundary.svelte';
  import ErrorFallback from '$lib/components/ErrorFallback.svelte';
  import OfflineNotice from '$lib/components/OfflineNotice.svelte';
  import VerificationForm from '$lib/components/VerificationForm.svelte';
  import VerdictDisplay from '$lib/components/VerdictDisplay.svelte';
  import CachedResultsFallback from '$lib/components/CachedResultsFallback.svelte';
  import { apiClient } from '$lib/api/sonar';
  import { createError, clearError, currentError } from '$lib/stores/errorStore';
  import { ErrorType } from '$lib/errors/errorTypes';
  
  // State management
  let isVerifying = $state(false);
  let verificationResult = $state(null);
  
  // Handle verification form submission
  async function handleVerify(statement) {
    clearError();
    isVerifying = true;
    verificationResult = null;
    
    try {
      verificationResult = await apiClient.verifyStatement(statement);
    } catch (error) {
      if (!(error instanceof MythBusterError)) {
        error = new MythBusterError(
          ErrorType.UNKNOWN_ERROR,
          'An unexpected error occurred during verification',
          error
        );
      }
      
      createError(error.type, error.message, error.originalError, error.details);
    } finally {
      isVerifying = false;
    }
  }
  
  // Handle selecting a cached result
  function handleSelectCached(cachedResult) {
    verificationResult = cachedResult;
    clearError();
  }
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-6 text-center">Myth Buster</h1>
  
  <OfflineNotice />
  
  <ErrorBoundary fallback={ErrorFallback}>
    <div class="grid gap-6">
      <VerificationForm 
        on:submit={handleVerify} 
        disabled={isVerifying} 
      />
      
      {#if currentError}
        <ErrorFallback 
          error={currentError} 
          resetError={clearError} 
          onRetry={verificationResult ? null : () => handleVerify(lastStatement)}
        />
        
        <!-- Show cached results as fallback when API errors occur -->
        {#if ['API_RATE_LIMIT', 'API_SERVER_ERROR', 'NETWORK_OFFLINE'].includes(currentError.type)}
          <CachedResultsFallback on:select-cached={handleSelectCached} />
        {/if}
      {/if}
      
      {#if isVerifying}
        <!-- Show loading state -->
        <div class="animate-pulse">
          <VerdictDisplay isLoading={true} />
        </div>
      {:else if verificationResult}
        <VerdictDisplay 
          verdict={verificationResult.verdict}
          explanation={verificationResult.explanation}
          citations={verificationResult.citations}
          cached={verificationResult.cached}
        />
      {/if}
    </div>
  </ErrorBoundary>
</div>
```

## Error Tracking and Debugging

For a hackathon project, it's valuable to have basic error tracking:

```typescript
// src/lib/errors/errorTracker.ts
import { ErrorType, MythBusterError } from '$lib/errors/errorTypes';

/**
 * Simple error tracker for debugging and monitoring
 */
class ErrorTracker {
  private errors: any[] = [];
  private readonly MAX_ERRORS = 50;
  
  /**
   * Track a new error
   * @param error The error to track
   */
  trackError(error: any): void {
    // Ensure we don't exceed max length
    if (this.errors.length >= this.MAX_ERRORS) {
      this.errors.shift();
    }
    
    const errorData = {
      timestamp: new Date().toISOString(),
      type: error instanceof MythBusterError ? error.type : ErrorType.UNKNOWN_ERROR,
      message: error.message || 'Unknown error',
      stack: error.stack || null,
      details: error instanceof MythBusterError ? error.details : null,
      originalError: error instanceof MythBusterError && error.originalError 
        ? {
            name: error.originalError.name,
            message: error.originalError.message,
            stack: error.originalError.stack
          } 
        : null
    };
    
    this.errors.push(errorData);
    
    // In a real app, you might send this to a monitoring service
    console.debug('Error tracked:', errorData);
  }
  
  /**
   * Get all tracked errors
   */
  getErrors(): any[] {
    return [...this.errors];
  }
  
  /**
   * Clear all tracked errors
   */
  clearErrors(): void {
    this.errors = [];
  }
  
  /**
   * Get error statistics
   */
  getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    for (const error of this.errors) {
      const type = error.type || 'unknown';
      stats[type] = (stats[type] || 0) + 1;
    }
    
    return stats;
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();
```

This comprehensive error handling strategy ensures that the Myth Buster app provides a smooth, informative user experience even when things go wrong - a critical aspect of a polished application.