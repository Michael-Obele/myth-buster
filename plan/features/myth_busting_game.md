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
  <h1 class="text-3xl font-bold mb-6">Myth Buster Challenge</h1>
  
  <Card.Root class="p-6 mb-6">
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
                <select name="difficulty" class="w-full p-2 border rounded">
                  <option value="easy">Easy</option>
                  <option value="medium" selected>Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Form.Control>
            </Form.Field>
            
            <Form.Field>
              <Form.Label>Category</Form.Label>
              <Form.Control>
                <select name="category" class="w-full p-2 border rounded">
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
          <h2 class="text-xl font-semibold mb-4">{form.statement}</h2>
          
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
                    <p class="text-sm text-gray-500 text-right">{confidence}% confident</p>
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
          <div class="flex items-center mb-2">
            {#if form.result === 'correct'}
              <Check class="text-emerald-500 mr-2" />
              <p class="font-semibold text-emerald-700">Correct! +{form.points} points</p>
            {:else}
              <X class="text-red-500 mr-2" />
              <p class="font-semibold text-red-700">Incorrect!</p>
            {/if}
          </div>
          
          <p class="mb-4">The statement is <strong>{form.isTrue ? 'TRUE' : 'FALSE'}</strong>.</p>
          <p class="text-gray-700">{form.explanation}</p>
          
          {#if form.citations && form.citations.length > 0}
            <div class="mt-4">
              <h3 class="font-semibold mb-2">Sources:</h3>
              <ul class="list-disc pl-5 space-y-1">
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
  
  <div class="flex justify-between items-center">
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
