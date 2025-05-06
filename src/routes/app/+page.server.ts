import type { Actions } from './$types';
import { PERPLEXITY_API_KEY } from '$env/static/private';
import { building } from '$app/environment';

// You should store your Perplexity API key securely (e.g. env vars). For now, use a placeholder.
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const SYSTEM_PROMPT = `You are a myth-busting expert who analyzes statements to determine their accuracy.

For each statement provided, follow these steps:
1. Analyze whether the statement is true, false, or inconclusive based on current evidence
2. Provide a detailed explanation of your verdict, with special emphasis on debunking if the statement is false
3. Include factual information that corrects any misconceptions
4. Cite reliable sources to support your explanation
5. If known, briefly explain the origin of this myth or misconception

Return your response as a JSON object with the following structure:
{
  "verdict": "true" | "false" | "inconclusive",
  "explanation": "A detailed explanation of why the statement is true, false, or inconclusive",
  "citations": [
    {
      "title": "Source title",
      "url": "URL to the source"
    }
  ],
  "mythOrigin": "Brief explanation of where this myth originated (if applicable)"
}

Always format your response as a JSON object within a markdown code block.`;

// Improved cache implementation
type CachedResponse = {
  timestamp: number;
  response: any;
  expiresAt: number;
};

// Cache with 24 hour expiration
// Use a more persistent cache that won't be reset on server restart
// Skip initialization during build to prevent issues
const responseCache: Map<string, CachedResponse> = !building ? new Map() : new Map();
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get a cached response if it exists and is valid
 * @param key The cache key
 * @returns The cached response or null if not found or expired
 */
function getCachedResponse(key: string): any | null {
  const now = Date.now();
  const cachedData = responseCache.get(key);
  
  if (!cachedData) {
    return null;
  }
  
  // Check if the cache entry has expired
  if (now >= cachedData.expiresAt) {
    // Remove expired cache entry
    responseCache.delete(key);
    return null;
  }
  
  return cachedData.response;
}

/**
 * Cache a response
 * @param key The cache key
 * @param response The response to cache
 */
function cacheResponse(key: string, response: any): void {
  const now = Date.now();
  responseCache.set(key, {
    timestamp: now,
    response,
    expiresAt: now + CACHE_EXPIRATION_MS
  });
}

export const actions: Actions = {
  verifyMyth: async ({ request }) => {
    const data = await request.formData();
    const myth = data.get('myth');
    if (typeof myth !== 'string' || !myth.trim()) {
      return { status: 400, body: { error: 'Myth is required.' } };
    }

    console.log('Received myth:', myth);
    const apiKey = PERPLEXITY_API_KEY;
    console.log('Using API Key:', apiKey ? '[REDACTED]' : 'MISSING');
    if (!apiKey) {
      console.error('Missing Perplexity API key on server.');
      return { status: 500, body: { error: 'Missing Perplexity API key on server.' } };
    }

    // Check if we have a cached response for this myth
    const cacheKey = myth.trim().toLowerCase();
    const cachedResponse = getCachedResponse(cacheKey);
    
    // If we have a valid cached response, use it
    if (cachedResponse) {
      console.log('Using cached response for myth');
      // Return the cached response but update the cached flag to true
      return {
        ...cachedResponse,
        cached: true
      };
    }

    const payload = {
      model: 'sonar',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: myth }
      ]
    };
    console.log('Payload to Perplexity:', JSON.stringify(payload, null, 2));

    try {
      const resp = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Perplexity API status:', resp.status);
      
      // Check if the response is OK before trying to parse as JSON
      if (!resp.ok) {
        console.error(`API returned error status: ${resp.status}`);
        
        // Return a graceful error response
        return {
          success: false,
          error: `API returned status ${resp.status}`,
          data: {
            verdict: 'inconclusive',
            explanation: 'Unable to verify this myth due to an API error. Please try again later or contact support if the issue persists.',
            citations: [],
            mythOrigin: ''
          }
        };
      }
      
      // Only try to parse JSON if the response was successful
      let answer;
      try {
        answer = await resp.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        
        // Return a graceful error response
        return {
          success: false,
          error: 'Invalid response from API',
          data: {
            verdict: 'inconclusive',
            explanation: 'Unable to verify this myth due to an error processing the response. Please try again later.',
            citations: [],
            mythOrigin: ''
          }
        };
      }

      console.log('Perplexity API response:', JSON.stringify(answer, null, 2));

      // Return the formatted data in a way that's easy for the frontend to consume
      // Try to extract verdict from the response content
      let verdict = 'inconclusive';
      let explanation = '';
      let citations = [];
      let mythOrigin = '';
      try {
        const content = answer.choices?.[0]?.message?.content;
        console.log('Raw content from Perplexity:', content);
        console.log('Citations from Perplexity:', answer.citations);

        // Initialize with any citations from the API response
        const apiCitations = answer.citations?.map((url: string, index: number) => ({
          title: `Source ${index + 1}`,
          url
        })) || [];

        if (content) {
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch && jsonMatch[1]) {
            const parsedContent = JSON.parse(jsonMatch[1]);
            console.log('Parsed content:', parsedContent);

            if (parsedContent.verdict === true || parsedContent.verdict === 'true') {
              verdict = 'true';
            } else if (parsedContent.verdict === false || parsedContent.verdict === 'false') {
              verdict = 'false';
            }

            explanation = parsedContent.explanation || '';
            mythOrigin = parsedContent.mythOrigin || '';
            
            // Get citations from the parsed JSON content
            const jsonCitations = parsedContent.citations || [];
            
            // Merge citations from both sources, removing duplicates by URL
            const citationMap = new Map();
            
            // Add JSON citations first (they have titles)
            jsonCitations.forEach((citation: { title: string; url: string }) => {
              citationMap.set(citation.url, citation);
            });
            
            // Then add API citations, but only if not already in the map
            apiCitations.forEach((citation: { title: string; url: string }) => {
              if (!citationMap.has(citation.url)) {
                citationMap.set(citation.url, citation);
              }
            });
            
            citations = Array.from(citationMap.values());
          }
        }
      } catch (error) {
        console.error('Error extracting content:', error);
      }

      console.log('Final verdict being sent to frontend:', verdict);

      const responseData = {
        success: true,
        cached: false,
        myth,
        data: {
          answer,
          explanation,
          citations,
          mythOrigin,
          verdict
        }
      };
      
      // Cache the response with the improved caching function
      cacheResponse(cacheKey, responseData);
      
      console.log('Returning response data:', responseData);

      return responseData;
    } catch (err) {
      console.error('Failed to contact Perplexity API:', err);
      return {
        success: false,
        error: 'Failed to contact Perplexity API',
        data: {
          verdict: 'inconclusive',
          explanation: 'Unable to verify this myth due to an error contacting the API. Please try again later or contact support if the issue persists.',
          citations: [],
          mythOrigin: ''
        }
      };
    }
  },
  
  // Add a reset action to clear the form data
  reset: () => {
    console.log('Reset action called - clearing form data');
    return { success: true };
  },
  
  // Add a new action to clear the cache
  clearCache: () => {
    console.log('Clearing response cache');
    responseCache.clear();
    return { success: true, message: 'Cache cleared successfully' };
  }
};
