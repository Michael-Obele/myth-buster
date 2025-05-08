# Comprehensive Testing Strategy for Myth Buster App

This document outlines a robust testing strategy for the Myth Buster application, covering all aspects from unit tests to end-to-end testing. The strategy ensures thorough validation of the application's functionality, performance, and user experience across different devices and browsers.

## Testing Philosophy and Objectives

Our testing approach is guided by the following principles:

1. **Shift-Left Testing**: We integrate testing early in the development lifecycle to catch issues before they propagate.
2. **Pyramid Approach**: We build a testing pyramid with a solid foundation of numerous, fast unit tests, complemented by fewer but more comprehensive integration and end-to-end tests.
3. **Behavior-Driven**: We focus on testing user-observable behavior rather than implementation details.
4. **Continuous Testing**: Tests run automatically throughout the development process to provide immediate feedback.
5. **Coverage-Oriented**: We aim for high test coverage of critical paths and features.

## Testing Levels Overview

| Testing Level | Target | Tools | Quantity | Speed | Purpose |
|---------------|--------|-------|----------|-------|---------|
| **Unit** | Individual functions and components | Vitest, Testing Library | Many | Fast | Validate core logic in isolation |
| **Component** | UI components | Testing Library, Storybook | Several | Medium | Verify component behavior and appearance |
| **Integration** | API interactions, component combinations | Vitest, MSW | Moderate | Medium | Test interactions between parts |
| **End-to-End** | User flows | Playwright | Few | Slow | Validate complete user journeys |
| **Performance** | Response times, animations | Lighthouse, Custom metrics | Few | Varies | Ensure optimal user experience |
| **Accessibility** | WCAG compliance | Axe, Lighthouse | Moderate | Fast | Ensure inclusive experience |
| **Cross-Browser** | Browser compatibility | Playwright, BrowserStack | Few | Slow | Verify consistent experience |
| **Responsive** | Device compatibility | Playwright, Chrome DevTools | Moderate | Medium | Ensure mobile-friendly design |

## 1. Unit Testing

Unit tests focus on testing individual functions and components in isolation, ensuring they work as expected.

### 1.1 Utility Function Tests

```typescript
// src/tests/unit/verdict-classifier.test.ts
import { describe, it, expect } from 'vitest';
import { classifyVerdict } from '$lib/utils/verdict-classifier';

describe('Verdict Classifier', () => {
  it('should classify clear true statements correctly', () => {
    const apiResponse = {
      answer: 'This statement is true. Research consistently shows that...',
      sources: [{ title: 'Scientific Source', url: 'https://example.com' }]
    };
    
    const result = classifyVerdict(apiResponse);
    
    expect(result).toBe('true');
  });
  
  it('should classify clear false statements correctly', () => {
    const apiResponse = {
      answer: 'This claim is false. Multiple studies have debunked...',
      sources: [{ title: 'Fact Check', url: 'https://example.com' }]
    };
    
    const result = classifyVerdict(apiResponse);
    
    expect(result).toBe('false');
  });
  
  it('should classify inconclusive or nuanced statements correctly', () => {
    const apiResponse = {
      answer: 'The evidence is mixed on this topic. Some research suggests...',
      sources: [
        { title: 'Supporting Study', url: 'https://example.com/1' },
        { title: 'Contradicting Study', url: 'https://example.com/2' }
      ]
    };
    
    const result = classifyVerdict(apiResponse);
    
    expect(result).toBe('inconclusive');
  });
  
  it('should handle edge cases in API responses', () => {
    // Test with minimal response
    const minimalResponse = {
      answer: 'Yes.',
      sources: []
    };
    
    expect(classifyVerdict(minimalResponse)).toBeDefined();
    
    // Test with lengthy, complex response
    const complexResponse = {
      answer: 'This is a complex topic with many nuances. On one hand... [long text]',
      sources: Array(10).fill({ title: 'Source', url: 'https://example.com' })
    };
    
    expect(classifyVerdict(complexResponse)).toBeDefined();
  });
});
```

### 1.2 API Client Unit Tests

```typescript
// src/tests/unit/api-client.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { apiClient } from '$lib/api/sonar';

describe('API Client', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = vi.fn();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
    });
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should make correct API request', async () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        answer: 'Test answer', 
        sources: [] 
      })
    });
    
    await apiClient.verifyStatement('Test statement');
    
    // Verify fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': expect.any(String)
        }),
        body: expect.any(String)
      })
    );
    
    // Verify request body
    const requestBody = JSON.parse(fetch.mock.calls[0][1].body);
    expect(requestBody.query).toContain('Test statement');
  });
  
  it('should handle API errors properly', async () => {
    // Mock error response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests'
    });
    
    // Expect error to be thrown
    await expect(apiClient.verifyStatement('Test statement')).rejects.toThrow();
  });
  
  it('should cache results and reuse them', async () => {
    // Mock cache hit
    window.localStorage.getItem.mockReturnValueOnce(JSON.stringify({
      timestamp: Date.now(),
      verdict: 'true',
      explanation: 'Cached explanation',
      citations: []
    }));
    
    const result = await apiClient.verifyStatement('Cached statement');
    
    // Verify fetch was not called
    expect(fetch).not.toHaveBeenCalled();
    
    // Verify cached result was returned
    expect(result.verdict).toBe('true');
    expect(result.explanation).toBe('Cached explanation');
    expect(result.cached).toBe(true);
  });
  
  it('should handle network failures gracefully', async () => {
    // Mock network failure
    global.fetch.mockRejectedValueOnce(new Error('Network failure'));
    
    // Expect error to be thrown with appropriate type
    await expect(apiClient.verifyStatement('Test statement')).rejects.toThrow();
  });
});
```

### 1.3 State Management Unit Tests

```typescript
// src/tests/unit/verification-store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { 
  verificationState, 
  submitVerification,
  resetVerification,
  setVerificationError
} from '$lib/stores/verification-store';

describe('Verification Store', () => {
  beforeEach(() => {
    // Reset store before each test
    resetVerification();
  });
  
  it('should initialize with default state', () => {
    expect(verificationState.statement).toBe('');
    expect(verificationState.isLoading).toBe(false);
    expect(verificationState.result).toBeNull();
    expect(verificationState.error).toBeNull();
  });
  
  it('should update state when starting verification', () => {
    // Start verification
    submitVerification('Test statement');
    
    // Check state
    expect(verificationState.statement).toBe('Test statement');
    expect(verificationState.isLoading).toBe(true);
    expect(verificationState.result).toBeNull();
    expect(verificationState.error).toBeNull();
  });
  
  it('should handle verification success', () => {
    // Setup
    submitVerification('Test statement');
    
    // Simulate success
    verificationState.isLoading = false;
    verificationState.result = {
      verdict: 'true',
      explanation: 'Test explanation',
      citations: []
    };
    
    // Check state
    expect(verificationState.isLoading).toBe(false);
    expect(verificationState.result).not.toBeNull();
    expect(verificationState.result.verdict).toBe('true');
    expect(verificationState.error).toBeNull();
  });
  
  it('should handle verification error', () => {
    // Setup
    submitVerification('Test statement');
    
    // Simulate error
    setVerificationError('API Error');
    
    // Check state
    expect(verificationState.isLoading).toBe(false);
    expect(verificationState.result).toBeNull();
    expect(verificationState.error).toBe('API Error');
  });
  
  it('should properly reset state', () => {
    // Setup with some state
    submitVerification('Test statement');
    verificationState.result = {
      verdict: 'true',
      explanation: 'Test explanation',
      citations: []
    };
    
    // Reset
    resetVerification();
    
    // Verify reset
    expect(verificationState.isLoading).toBe(false);
    expect(verificationState.statement).toBe('');
    expect(verificationState.result).toBeNull();
    expect(verificationState.error).toBeNull();
  });
});
```

### 1.4 Configuration for Unit Tests

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,ts}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/']
    }
  },
  resolve: {
    alias: {
      '$lib': '/src/lib',
      '$components': '/src/components',
    }
  }
});
```

## 2. Component Testing

Component tests verify that UI components render correctly and respond appropriately to user interactions.

### 2.1 Verification Form Component Tests

```typescript
// src/tests/components/VerificationForm.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import VerificationForm from '$lib/components/VerificationForm.svelte';

describe('VerificationForm', () => {
  it('should render form elements correctly', () => {
    render(VerificationForm);
    
    // Check for essential elements
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
  });
  
  it('should disable submission with empty input', async () => {
    render(VerificationForm);
    
    const submitButton = screen.getByRole('button', { name: /verify/i });
    
    // Button should be disabled initially
    expect(submitButton).toBeDisabled();
    
    // Enter text and check if button is enabled
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test statement');
    
    expect(submitButton).not.toBeDisabled();
    
    // Clear text and check if button is disabled again
    await userEvent.clear(input);
    
    expect(submitButton).toBeDisabled();
  });
  
  it('should call onSubmit when form is submitted', async () => {
    const mockSubmit = vi.fn();
    
    render(VerificationForm, { props: { onSubmit: mockSubmit } });
    
    // Enter text
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test statement');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /verify/i });
    await userEvent.click(submitButton);
    
    // Check if onSubmit was called with correct value
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith('Test statement');
  });
  
  it('should show loading state during submission', async () => {
    const mockSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(VerificationForm, { props: { onSubmit: mockSubmit } });
    
    // Enter text and submit
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test statement');
    
    const submitButton = screen.getByRole('button', { name: /verify/i });
    await userEvent.click(submitButton);
    
    // Check for loading state
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/verifying/i)).toBeInTheDocument();
  });
  
  it('should validate input length', async () => {
    render(VerificationForm);
    
    // Enter very long text
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'a'.repeat(1000));
    
    // Check for validation error
    expect(screen.getByText(/statement is too long/i)).toBeInTheDocument();
    
    // Button should be disabled due to validation error
    const submitButton = screen.getByRole('button', { name: /verify/i });
    expect(submitButton).toBeDisabled();
  });
});
```

### 2.2 Verdict Display Component Tests

```typescript
// src/tests/components/VerdictDisplay.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import VerdictDisplay from '$lib/components/VerdictDisplay.svelte';

describe('VerdictDisplay', () => {
  it('should show loading state correctly', () => {
    render(VerdictDisplay, { props: { isLoading: true } });
    
    // Check for loading indicators
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(/verdict/i)).not.toBeInTheDocument();
  });
  
  it('should render true verdict correctly', () => {
    const result = {
      verdict: 'true',
      explanation: 'This statement is correct.',
      citations: [{ title: 'Source', url: 'https://example.com' }]
    };
    
    render(VerdictDisplay, { props: { isLoading: false, result } });
    
    // Check for true verdict indicators
    expect(screen.getByText(/true/i)).toBeInTheDocument();
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
    
    // Check for citation
    expect(screen.getByText(/source/i)).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
  });
  
  it('should render false verdict correctly', () => {
    const result = {
      verdict: 'false',
      explanation: 'This statement is incorrect.',
      citations: [{ title: 'Source', url: 'https://example.com' }]
    };
    
    render(VerdictDisplay, { props: { isLoading: false, result } });
    
    // Check for false verdict indicators
    expect(screen.getByText(/false/i)).toBeInTheDocument();
    expect(screen.getByText(/incorrect/i)).toBeInTheDocument();
  });
  
  it('should render inconclusive verdict correctly', () => {
    const result = {
      verdict: 'inconclusive',
      explanation: 'The evidence is mixed on this topic.',
      citations: [
        { title: 'Source 1', url: 'https://example.com/1' },
        { title: 'Source 2', url: 'https://example.com/2' }
      ]
    };
    
    render(VerdictDisplay, { props: { isLoading: false, result } });
    
    // Check for inconclusive verdict indicators
    expect(screen.getByText(/inconclusive/i)).toBeInTheDocument();
    expect(screen.getByText(/mixed/i)).toBeInTheDocument();
    
    // Check for multiple citations
    expect(screen.getByText(/source 1/i)).toBeInTheDocument();
    expect(screen.getByText(/source 2/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
  
  it('should handle empty citations gracefully', () => {
    const result = {
      verdict: 'true',
      explanation: 'This is correct.',
      citations: []
    };
    
    render(VerdictDisplay, { props: { isLoading: false, result } });
    
    // Should not show citations section
    expect(screen.queryByText(/sources/i)).not.toBeInTheDocument();
  });
  
  it('should display cached indicator for cached results', () => {
    const result = {
      verdict: 'true',
      explanation: 'This is correct.',
      citations: [],
      cached: true
    };
    
    render(VerdictDisplay, { props: { isLoading: false, result } });
    
    // Check for cached indicator
    expect(screen.getByText(/cached/i)).toBeInTheDocument();
  });
});
```

### 2.3 Theme Toggle Component Tests

```typescript
// src/tests/components/ThemeToggle.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '$lib/components/ThemeToggle.svelte';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn()
      }
    });
    
    // Mock document methods
    document.documentElement.classList.add = vi.fn();
    document.documentElement.classList.remove = vi.fn();
  });
  
  it('should render toggle button', () => {
    render(ThemeToggle);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
  
  it('should initialize with light theme by default', () => {
    // Mock localStorage returning null (no saved preference)
    window.localStorage.getItem.mockReturnValueOnce(null);
    
    render(ThemeToggle);
    
    // Should not add dark class
    expect(document.documentElement.classList.add).not.toHaveBeenCalledWith('dark');
  });
  
  it('should initialize with saved theme preference', () => {
    // Mock localStorage returning dark
    window.localStorage.getItem.mockReturnValueOnce('dark');
    
    render(ThemeToggle);
    
    // Should add dark class
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
  });
  
  it('should toggle theme when clicked', async () => {
    // Start with light theme
    window.localStorage.getItem.mockReturnValueOnce('light');
    
    render(ThemeToggle);
    
    // Click toggle button
    await userEvent.click(screen.getByRole('button'));
    
    // Should add dark class and save preference
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // Reset mocks for second click
    vi.clearAllMocks();
    
    // Click toggle button again
    await userEvent.click(screen.getByRole('button'));
    
    // Should remove dark class and save preference
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });
  
  it('should display appropriate icon based on current theme', async () => {
    // Start with light theme
    window.localStorage.getItem.mockReturnValueOnce('light');
    
    render(ThemeToggle);
    
    // Should show moon icon for light theme
    expect(screen.getByLabelText(/dark mode/i)).toBeInTheDocument();
    
    // Click toggle button
    await userEvent.click(screen.getByRole('button'));
    
    // Should now show sun icon for dark theme
    expect(screen.getByLabelText(/light mode/i)).toBeInTheDocument();
  });
});
```

### 2.4 Component Snapshot Tests

```typescript
// src/tests/components/snapshots.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import VerdictDisplay from '$lib/components/VerdictDisplay.svelte';
import VerificationForm from '$lib/components/VerificationForm.svelte';
import ThemeToggle from '$lib/components/ThemeToggle.svelte';

describe('Component Snapshots', () => {
  it('VerdictDisplay should match snapshot for true verdict', () => {
    const result = {
      verdict: 'true',
      explanation: 'This statement is correct.',
      citations: [{ title: 'Source', url: 'https://example.com' }]
    };
    
    const { container } = render(VerdictDisplay, { 
      props: { isLoading: false, result } 
    });
    
    expect(container).toMatchSnapshot();
  });
  
  it('VerdictDisplay should match snapshot for false verdict', () => {
    const result = {
      verdict: 'false',
      explanation: 'This statement is incorrect.',
      citations: [{ title: 'Source', url: 'https://example.com' }]
    };
    
    const { container } = render(VerdictDisplay, { 
      props: { isLoading: false, result } 
    });
    
    expect(container).toMatchSnapshot();
  });
  
  it('VerificationForm should match snapshot', () => {
    const { container } = render(VerificationForm);
    
    expect(container).toMatchSnapshot();
  });
  
  it('ThemeToggle should match snapshot', () => {
    const { container } = render(ThemeToggle);
    
    expect(container).toMatchSnapshot();
  });
});
```

### 2.5 Storybook Integration

```typescript
// src/stories/VerdictDisplay.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';
import VerdictDisplay from '$lib/components/VerdictDisplay.svelte';

const meta: Meta<VerdictDisplay> = {
  component: VerdictDisplay,
  title: 'Components/VerdictDisplay',
  tags: ['autodocs'],
  argTypes: {
    isLoading: { control: 'boolean' },
    result: { control: 'object' }
  }
};

export default meta;
type Story = StoryObj<VerdictDisplay>;

export const Loading: Story = {
  args: {
    isLoading: true
  }
};

export const TrueVerdict: Story = {
  args: {
    isLoading: false,
    result: {
      verdict: 'true',
      explanation: 'This statement is factually correct based on multiple reliable sources.',
      citations: [
        { title: 'Scientific Journal', url: 'https://example.com/journal' },
        { title: 'Educational Resource', url: 'https://example.com/edu' }
      ]
    }
  }
};

export const FalseVerdict: Story = {
  args: {
    isLoading: false,
    result: {
      verdict: 'false',
      explanation: 'This statement has been debunked by multiple fact-checking organizations.',
      citations: [
        { title: 'Fact Check Organization', url: 'https://example.com/factcheck' },
        { title: 'Research Study', url: 'https://example.com/study' }
      ]
    }
  }
};

export const InconclusiveVerdict: Story = {
  args: {
    isLoading: false,
    result: {
      verdict: 'inconclusive',
      explanation: 'The evidence on this topic is mixed, with studies supporting both sides.',
      citations: [
        { title: 'Supporting Study', url: 'https://example.com/supporting' },
        { title: 'Contradicting Study', url: 'https://example.com/contradicting' }
      ]
    }
  }
};

export const CachedResult: Story = {
  args: {
    isLoading: false,
    result: {
      verdict: 'true',
      explanation: 'This is a cached result.',
      citations: [{ title: 'Source', url: 'https://example.com' }],
      cached: true
    }
  }
};
```

## 3. Integration Tests

Integration tests verify that different parts of the application work together correctly.

### 3.1 API Integration Tests

```typescript
// src/tests/integration/api-integration.test.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { apiClient } from '$lib/api/sonar';

// Mock API responses
const handlers = [
  rest.post('https://api.perplexity.ai/search', (req, res, ctx) => {
    const body = req.body;
    
    // Check if request includes a specific keyword for different scenarios
    if (body && typeof body === 'object' && 'query' in body) {
      const query = body.query as string;
      
      if (query.includes('true statement')) {
        return res(
          ctx.json({
            answer: 'This statement is true based on multiple sources.',
            sources: [
              { title: 'Source 1', url: 'https://example.com/1' },
              { title: 'Source 2', url: 'https://example.com/2' }
            ]
          })
        );
      }
      
      if (query.includes('false statement')) {
        return res(
          ctx.json({
            answer: 'This statement is false. It has been debunked.',
            sources: [
              { title: 'Debunking Source', url: 'https://example.com/debunk' }
            ]
          })
        );
      }
      
      if (query.includes('error')) {
        return res(
          ctx.status(500),
          ctx.json({ error: 'Server error' })
        );
      }
      
      if (query.includes('rate limit')) {
        return res(
          ctx.status(429),
          ctx.json({ error: 'Rate limit exceeded' })
        );
      }
    }
    
    // Default response
    return res(
      ctx.json({
        answer: 'Default response',
        sources: []
      })
    );
  })
];

const server = setupServer(...handlers);

describe('API Integration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  
  it('should process true statement correctly', async () => {
    const result = await apiClient.verifyStatement('true statement test');
    
    expect(result.verdict).toBe('true');
    expect(result.explanation).toContain('true');
    expect(result.citations).toHaveLength(2);
  });
  
  it('should process false statement correctly', async () => {
    const result = await apiClient.verifyStatement('false statement test');
    
    expect(result.verdict).toBe('false');
    expect(result.explanation).toContain('false');
    expect(result.citations).toHaveLength(1);
  });
  
  it('should handle server errors', async () => {
    await expect(apiClient.verifyStatement('error test'))
      .rejects.toThrow();
  });
  
  it('should handle rate limiting', async () => {
    await expect(apiClient.verifyStatement('rate limit test'))
      .rejects.toThrow(/rate limit/i);
  });
});
```

### 3.2 Component Integration Tests

```typescript
// src/tests/integration/verification-flow.test.ts
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import App from '../App.svelte';

// Set up MSW server with the same handlers as in the API integration tests
const server = setupServer(/* handlers */);

describe('Verification Flow Integration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  
  it('should handle complete verification flow', async () => {
    render(App);
    
    // Enter a statement
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'true statement test');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /verify/i });
    await userEvent.click(submitButton);
    
    // Check for loading state
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/true/i)).toBeInTheDocument();
    });
    
    // Check for citations
    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
  
  it('should handle false statements properly', async () => {
    render(App);
    
    // Enter a statement
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'false statement test');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /verify/i });
    await userEvent.click(submitButton);
    
    // Wait for result
    await waitFor(() => {
      expect(screen.getByText(/false/i)).toBeInTheDocument();
    });
    
    // Check for debunking explanation
    expect(screen.getByText(/debunked/i)).toBeInTheDocument();
  });
  
  it('should handle API errors gracefully', async () => {
    render(App);
    
    // Enter a statement that will trigger an error
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'error test');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /verify/i });
    await userEvent.click(submitButton);
    
    // Wait for error display
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    // Verify error message and retry button
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
  
  it('should toggle theme correctly', async () => {
    // Mock document methods
    document.documentElement.classList.add = vi.fn();
    document.documentElement.classList.remove = vi.fn();
    
    render(App);
    
    // Find and click theme toggle
    const themeToggle = screen.getByLabelText(/dark mode/i);
    await userEvent.click(themeToggle);
    
    // Verify dark mode is applied
    expect(document.documentElement.classList.add).toHaveBeenCalledWith('dark');
    
    // Click again to toggle back
    await userEvent.click(screen.getByLabelText(/light mode/i));
    
    // Verify light mode is restored
    expect(document.documentElement.classList.remove).toHaveBeenCalledWith('dark');
  });
});
```

### 3.3 Mock Service Worker (MSW) Setup

```typescript
// src/tests/setup.ts
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

// Create MSW server
const server = setupServer(...handlers);

// Set up global test hooks
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock Web Audio API
class AudioMock {
  play = vi.fn().mockResolvedValue(undefined);
}

global.Audio = AudioMock as any;

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }),
  writable: true
});
```

## 4. End-to-End Testing

End-to-end tests validate complete user journeys through the application, simulating real user behavior.

### 4.1 Basic E2E Test Setup

```typescript
// tests/e2e/basic.spec.ts
import { test, expect } from '@playwright/test';

test('homepage loads and displays verification form', async ({ page }) => {
  await page.goto('/');
  
  // Check for main elements
  await expect(page.getByRole('heading', { name: /myth buster/i })).toBeVisible();
  await expect(page.getByRole('textbox')).toBeVisible();
  await expect(page.getByRole('button', { name: /verify/i })).toBeVisible();
});

test('form validation works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Try submitting empty form
  const submitButton = page.getByRole('button', { name: /verify/i });
  await expect(submitButton).toBeDisabled();
  
  // Enter text
  await page.getByRole('textbox').fill('Test statement');
  await expect(submitButton).toBeEnabled();
  
  // Clear text
  await page.getByRole('textbox').clear();
  await expect(submitButton).toBeDisabled();
});

test('theme toggle changes appearance', async ({ page }) => {
  await page.goto('/');
  
  // Get initial theme state
  const initialHasDarkClass = await page.evaluate(() => 
    document.documentElement.classList.contains('dark')
  );
  
  // Toggle theme
  await page.getByRole('button', { name: /dark mode|light mode/i }).click();
  
  // Check if theme changed
  const newHasDarkClass = await page.evaluate(() => 
    document.documentElement.classList.contains('dark')
  );
  
  expect(newHasDarkClass).not.toBe(initialHasDarkClass);
});
```

### 4.2 Verification Flow E2E Tests

```typescript
// tests/e2e/verification-flow.spec.ts
import { test, expect } from '@playwright/test';

// Use the test.beforeEach hook to set up API mocks
test.beforeEach(async ({ page }) => {
  // Mock API response
  await page.route('**/search', async (route) => {
    const body = route.request().postDataJSON();
    const query = body.query.toLowerCase();
    
    if (query.includes('earth is round')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'The statement "The Earth is round" is true. The Earth is an oblate spheroid, slightly flattened at the poles and bulging at the equator.',
          sources: [
            { title: 'NASA - Earth Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
            { title: 'National Geographic - Earth', url: 'https://www.nationalgeographic.com/science/article/earth' }
          ]
        }),
      });
    } else if (query.includes('flat earth')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'The statement "The Earth is flat" is false. The Earth is an oblate spheroid, as proven by multiple lines of evidence including photos from space, ship disappearance over the horizon, and measurements of the Earth\'s curvature.',
          sources: [
            { title: 'NASA - Earth Observations', url: 'https://www.nasa.gov/topics/earth/features/blue-marble-earth-plant.html' },
            { title: 'Scientific American - Flat Earth Myth', url: 'https://www.scientificamerican.com/article/flat-earth-theory-fact-check/' }
          ]
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'The evidence regarding this statement is mixed and inconclusive.',
          sources: [
            { title: 'Source 1', url: 'https://example.com/1' },
            { title: 'Source 2', url: 'https://example.com/2' }
          ]
        }),
      });
    }
  });
});

test('verifying a true statement shows correct verdict', async ({ page }) => {
  await page.goto('/');
  
  // Enter and submit a true statement
  await page.getByRole('textbox').fill('The Earth is round');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for result
  await expect(page.getByText(/true/i)).toBeVisible();
  
  // Check for explanation and sources
  await expect(page.getByText(/oblate spheroid/i)).toBeVisible();
  await expect(page.getByText(/nasa/i)).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(2);
});

test('verifying a false statement shows debunking', async ({ page }) => {
  await page.goto('/');
  
  // Enter and submit a false statement
  await page.getByRole('textbox').fill('The Earth is flat');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for result
  await expect(page.getByText(/false/i)).toBeVisible();
  
  // Check for debunking and sources
  await expect(page.getByText(/proven by multiple lines of evidence/i)).toBeVisible();
  await expect(page.getByText(/NASA/i)).toBeVisible();
});

test('submitting another statement after getting results works', async ({ page }) => {
  await page.goto('/');
  
  // First verification
  await page.getByRole('textbox').fill('The Earth is round');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for first result
  await expect(page.getByText(/true/i)).toBeVisible();
  
  // Submit another statement
  await page.getByRole('textbox').clear();
  await page.getByRole('textbox').fill('The Earth is flat');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for second result
  await expect(page.getByText(/false/i)).toBeVisible();
});

test('error handling shows appropriate message', async ({ page }) => {
  // Override route to simulate error
  await page.route('**/search', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' }),
    });
  });
  
  await page.goto('/');
  
  // Submit statement
  await page.getByRole('textbox').fill('Test error handling');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Check for error message and retry button
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText(/error/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
});
```

### 4.3 Different Myth Types E2E Tests

```typescript
// tests/e2e/myth-types.spec.ts
import { test, expect } from '@playwright/test';

// Mock API with different myth types
test.beforeEach(async ({ page }) => {
  await page.route('**/search', async (route) => {
    const body = route.request().postDataJSON();
    const query = body.query.toLowerCase();
    
    // Different types of myths with responses
    const mythResponses = {
      // Clear true case
      'earth revolves around the sun': {
        status: 200,
        body: {
          answer: 'This statement is true. The Earth revolves around the Sun, completing one orbit every 365.25 days.',
          sources: [{ title: 'NASA', url: 'https://example.com/nasa' }]
        }
      },
      // Clear false case
      'vaccines cause autism': {
        status: 200,
        body: {
          answer: 'This statement is false. Extensive scientific research has found no link between vaccines and autism.',
          sources: [{ title: 'CDC', url: 'https://example.com/cdc' }]
        }
      },
      // Nuanced case
      'vitamin c prevents colds': {
        status: 200,
        body: {
          answer: 'This statement is partially true, but mostly inconclusive. While some studies suggest vitamin C may reduce the duration of colds in some populations, it does not prevent colds in the general population.',
          sources: [
            { title: 'NIH Study', url: 'https://example.com/nih' },
            { title: 'Cochrane Review', url: 'https://example.com/cochrane' }
          ]
        }
      },
      // Scientific myth
      '10 percent of brain': {
        status: 200,
        body: {
          answer: 'The claim that humans only use 10% of their brains is false. This is a common misconception with no scientific basis.',
          sources: [{ title: 'Scientific American', url: 'https://example.com/sciam' }]
        }
      },
      // Historical myth
      'columbus proved earth round': {
        status: 200,
        body: {
          answer: 'This statement is false. The Earth was already known to be round by educated people in Columbus\'s time. The ancient Greeks had established this fact centuries earlier.',
          sources: [{ title: 'History.com', url: 'https://example.com/history' }]
        }
      }
    };
    
    // Find matching myth
    const matchingMyth = Object.keys(mythResponses).find(key => query.includes(key));
    
    if (matchingMyth) {
      const response = mythResponses[matchingMyth];
      await route.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: JSON.stringify(response.body),
      });
    } else {
      // Default response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'This is a general response.',
          sources: [{ title: 'Source', url: 'https://example.com' }]
        }),
      });
    }
  });
});

test('verifying a clear true scientific fact', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('textbox').fill('The Earth revolves around the Sun');
  await page.getByRole('button', { name: /verify/i }).click();
  
  await expect(page.getByText(/true/i)).toBeVisible();
  await expect(page.getByText(/completes one orbit/i)).toBeVisible();
});

test('verifying a clear false statement', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('textbox').fill('Vaccines cause autism');
  await page.getByRole('button', { name: /verify/i }).click();
  
  await expect(page.getByText(/false/i)).toBeVisible();
  await expect(page.getByText(/no link between vaccines and autism/i)).toBeVisible();
});

test('verifying a nuanced statement with mixed evidence', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('textbox').fill('Vitamin C prevents colds');
  await page.getByRole('button', { name: /verify/i }).click();
  
  await expect(page.getByText(/inconclusive/i)).toBeVisible();
  await expect(page.getByText(/partially true/i)).toBeVisible();
  await expect(page.getByRole('link')).toHaveCount(2);
});

test('verifying a common scientific misconception', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('textbox').fill('Humans only use 10 percent of their brain');
  await page.getByRole('button', { name: /verify/i }).click();
  
  await expect(page.getByText(/false/i)).toBeVisible();
  await expect(page.getByText(/common misconception/i)).toBeVisible();
});

test('verifying a historical myth', async ({ page }) => {
  await page.goto('/');
  
  await page.getByRole('textbox').fill('Columbus proved the Earth was round');
  await page.getByRole('button', { name: /verify/i }).click();
  
  await expect(page.getByText(/false/i)).toBeVisible();
  await expect(page.getByText(/already known/i)).toBeVisible();
});
```

### 4.4 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

## 5. Performance Testing

Performance tests evaluate the application's responsiveness, load time, and resource usage.

### 5.1 API Response Handling Tests

```typescript
// src/tests/performance/api-response.test.ts
import { describe, it, expect, vi } from 'vitest';
import { apiClient } from '$lib/api/sonar';

describe('API Response Performance', () => {
  it('should handle large responses efficiently', async () => {
    // Create a large mock response
    const largeResponse = {
      answer: 'a'.repeat(10000), // 10KB text
      sources: Array(50).fill(0).map((_, i) => ({
        title: `Source ${i}`,
        url: `https://example.com/${i}`,
        snippet: 'a'.repeat(500) // 500 byte snippet
      }))
    };
    
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => largeResponse
    });
    
    // Measure processing time
    const startTime = performance.now();
    const result = await apiClient.verifyStatement('test large response');
    const endTime = performance.now();
    
    // Processing should be reasonably fast (under 100ms)
    expect(endTime - startTime).toBeLessThan(100);
    
    // Result should have all data
    expect(result.explanation.length).toBeGreaterThan(9000);
    expect(result.citations.length).toBe(50);
  });
  
  it('should cache results for performance', async () => {
    // Set up localStorage mock
    let cache = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(key => cache[key] || null),
        setItem: vi.fn((key, value) => { cache[key] = value; })
      }
    });
    
    // First request (no cache)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ answer: 'Test answer', sources: [] })
    });
    
    await apiClient.verifyStatement('cache test');
    
    // Reset fetch mock to verify it's not called
    global.fetch = vi.fn();
    
    // Second request (should use cache)
    const startTime = performance.now();
    const result = await apiClient.verifyStatement('cache test');
    const endTime = performance.now();
    
    // Cached response should be very fast (under 10ms)
    expect(endTime - startTime).toBeLessThan(10);
    
    // Fetch should not be called for cached request
    expect(fetch).not.toHaveBeenCalled();
    
    // Should indicate that result is cached
    expect(result.cached).toBe(true);
  });
});
```

### 5.2 Animation Performance Tests

```typescript
// tests/e2e/animation-performance.spec.ts
import { test, expect } from '@playwright/test';

test('animations maintain good frame rate', async ({ page }) => {
  await page.goto('/');
  
  // Set up performance observer
  await page.evaluate(() => {
    window.frameDrops = 0;
    window.frameCount = 0;
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        window.frameCount++;
        // A frame drop is when the frame time exceeds 16.67ms (60fps)
        if (entry.duration > 16.67) {
          window.frameDrops++;
        }
      }
    });
    
    observer.observe({ entryTypes: ['frame'] });
    window.performanceObserver = observer;
  });
  
  // Submit verification to trigger animations
  await page.getByRole('textbox').fill('Test animation performance');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for animations to complete
  await page.waitForTimeout(2000);
  
  // Get frame statistics
  const stats = await page.evaluate(() => {
    window.performanceObserver.disconnect();
    return {
      frameCount: window.frameCount,
      frameDrops: window.frameDrops,
      dropRate: window.frameCount > 0 ? (window.frameDrops / window.frameCount) : 0
    };
  });
  
  // Frame drop rate should be less than 10%
  expect(stats.dropRate).toBeLessThan(0.1);
});

test('animations respect reduced motion preferences', async ({ page }) => {
  // Set reduced motion preference
  await page.emulateMedia({ reducedMotion: 'reduce' });
  
  await page.goto('/');
  
  // Submit verification
  await page.getByRole('textbox').fill('Test reduced motion');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for result
  await expect(page.getByText(/true|false|inconclusive/i)).toBeVisible();
  
  // Check if animations are disabled
  // This requires specific implementation details to test properly,
  // but could involve checking CSS classes or properties that change
  // based on the reduced motion preference
  const hasReducedMotion = await page.evaluate(() => {
    // Example check - adjust based on your implementation
    const animatedElements = document.querySelectorAll('.animate-pulse, .animate-spin, .animate-bounce');
    for (const el of animatedElements) {
      const style = window.getComputedStyle(el);
      if (style.animationName !== 'none' && style.animationDuration !== '0s') {
        return false;
      }
    }
    return true;
  });
  
  expect(hasReducedMotion).toBe(true);
});
```

### 5.3 Lighthouse Performance Tests

```typescript
// tests/performance/lighthouse.spec.ts
import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test('lighthouse performance audit', async ({ page, context }) => {
  await page.goto('/');
  
  const { lhr } = await playAudit({
    page,
    port: 9222,
    thresholds: {
      performance: 90,
      accessibility: 90,
      'best-practices': 90,
      seo: 90,
    },
    reports: {
      formats: {
        html: true,
      },
      directory: 'lighthouse-reports',
      name: 'myth-buster-audit'
    }
  });
  
  // Check main performance metrics
  expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.9);
  expect(lhr.categories.accessibility.score).toBeGreaterThanOrEqual(0.9);
  expect(lhr.categories['best-practices'].score).toBeGreaterThanOrEqual(0.9);
  expect(lhr.categories.seo.score).toBeGreaterThanOrEqual(0.9);
  
  // Check specific performance metrics
  expect(lhr.audits['first-contentful-paint'].score).toBeGreaterThanOrEqual(0.9);
  expect(lhr.audits['speed-index'].score).toBeGreaterThanOrEqual(0.8);
  expect(lhr.audits['largest-contentful-paint'].score).toBeGreaterThanOrEqual(0.9);
  expect(lhr.audits['total-blocking-time'].score).toBeGreaterThanOrEqual(0.9);
  expect(lhr.audits['cumulative-layout-shift'].score).toBeGreaterThanOrEqual(0.9);
});

test('lighthouse performance under load', async ({ page, context }) => {
  // Set CPU and network throttling to simulate lower-end devices
  await page.context().addInitScript(() => {
    const originalRequestIdleCallback = window.requestIdleCallback;
    window.requestIdleCallback = fn => originalRequestIdleCallback(fn, { timeout: 1 });
    
    // Simulate slow CPU (4x slowdown)
    const originalDate = Date.now;
    Date.now = () => originalDate() * 4;
  });
  
  await page.goto('/');
  
  // Simulate user interaction
  await page.getByRole('textbox').fill('Test performance under load');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Run Lighthouse audit under simulated load
  const { lhr } = await playAudit({
    page,
    port: 9222,
    thresholds: {
      performance: 70, // Lower threshold for throttled conditions
    },
    reports: {
      formats: {
        html: true,
      },
      directory: 'lighthouse-reports',
      name: 'myth-buster-throttled-audit'
    }
  });
  
  // Even under load, should maintain acceptable performance
  expect(lhr.categories.performance.score).toBeGreaterThanOrEqual(0.7);
});
```

## 6. Cross-Browser and Device Testing

These tests ensure the application works consistently across different browsers and device types.

### 6.1 Cross-Browser Tests

```typescript
// tests/cross-browser/basic-functionality.spec.ts
import { test, expect } from '@playwright/test';

// This test will run across all browser projects defined in playwright.config.ts
test('basic functionality works in all browsers', async ({ page, browserName }) => {
  test.slow(); // Allow more time for different browsers
  
  await page.goto('/');
  
  // Check that the main UI elements are visible
  await expect(page.getByRole('heading', { name: /myth buster/i })).toBeVisible();
  await expect(page.getByRole('textbox')).toBeVisible();
  await expect(page.getByRole('button', { name: /verify/i })).toBeDisabled();
  
  // Check form interaction
  await page.getByRole('textbox').fill('Cross-browser test');
  await expect(page.getByRole('button', { name: /verify/i })).toBeEnabled();
  
  // Check theme toggle
  const themeToggle = page.getByRole('button', { name: /dark mode|light mode/i });
  await expect(themeToggle).toBeVisible();
  
  // Log browser-specific information
  console.log(`Test running on ${browserName}`);
});

test('verification flow works in all browsers', async ({ page, browserName }) => {
  test.slow();
  
  // Mock API to ensure consistent responses across browsers
  await page.route('**/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'This statement is true based on available evidence.',
        sources: [{ title: 'Test Source', url: 'https://example.com' }]
      }),
    });
  });
  
  await page.goto('/');
  
  // Complete verification flow
  await page.getByRole('textbox').fill(`Cross-browser verification test in ${browserName}`);
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Check result display
  await expect(page.getByText(/true/i)).toBeVisible();
  await expect(page.getByText(/based on available evidence/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /test source/i })).toBeVisible();
  
  console.log(`Verification flow test completed on ${browserName}`);
});
```

### 6.2 Mobile Responsiveness Tests

```typescript
// tests/cross-browser/responsive-design.spec.ts
import { test, expect, devices } from '@playwright/test';

// Test viewport sizes
const viewports = [
  { width: 375, height: 667, name: 'Mobile' },      // iPhone SE
  { width: 768, height: 1024, name: 'Tablet' },     // iPad
  { width: 1280, height: 800, name: 'Laptop' },     // Standard laptop
  { width: 1920, height: 1080, name: 'Desktop' }    // Full HD desktop
];

for (const viewport of viewports) {
  test(`responsive layout at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
    // Set viewport size
    await page.setViewportSize({ 
      width: viewport.width, 
      height: viewport.height 
    });
    
    await page.goto('/');
    
    // Take screenshot for visual comparison
    await page.screenshot({ 
      path: `./screenshots/responsive-${viewport.name.toLowerCase()}.png`,
      fullPage: true
    });
    
    // Verify critical elements are visible
    await expect(page.getByRole('heading', { name: /myth buster/i })).toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();
    await expect(page.getByRole('button', { name: /verify/i })).toBeVisible();
    
    // Check if layout adjusts properly
    const formWidth = await page.getByRole('textbox').boundingBox().then(box => box.width);
    
    // Form should be appropriately sized for viewport
    if (viewport.width <= 768) {
      // On mobile/tablet, form should take up most of the width
      expect(formWidth).toBeGreaterThan(viewport.width * 0.7);
    } else {
      // On larger screens, form should not be too wide
      expect(formWidth).toBeLessThan(viewport.width * 0.8);
    }
  });
  
  test(`interaction flow at ${viewport.name} viewport`, async ({ page }) => {
    // Set viewport size
    await page.setViewportSize({ 
      width: viewport.width, 
      height: viewport.height 
    });
    
    // Mock API for consistent testing
    await page.route('**/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'This statement is true.',
          sources: [{ title: 'Source', url: 'https://example.com' }]
        }),
      });
    });
    
    await page.goto('/');
    
    // Complete verification flow
    await page.getByRole('textbox').fill('Responsive test');
    await page.getByRole('button', { name: /verify/i }).click();
    
    // Verify result appears correctly
    await expect(page.getByText(/true/i)).toBeVisible();
    
    // Take screenshot of results for visual comparison
    await page.screenshot({ 
      path: `./screenshots/responsive-results-${viewport.name.toLowerCase()}.png`,
      fullPage: true
    });
  });
}
```

### 6.3 Touch Interaction Tests

```typescript
// tests/cross-browser/touch-interactions.spec.ts
import { test, expect, devices } from '@playwright/test';

// Test on mobile devices
test.describe('Touch interactions', () => {
  // Use Pixel 5 as test device
  test.use({ ...devices['Pixel 5'] });
  
  test('form interaction works with touch', async ({ page }) => {
    await page.goto('/');
    
    // Tap on input field
    await page.getByRole('textbox').tap();
    
    // Check if virtual keyboard appears (indicated by focus)
    await expect(page.getByRole('textbox')).toBeFocused();
    
    // Enter text (simulates virtual keyboard)
    await page.getByRole('textbox').fill('Touch test');
    
    // Tap submit button
    await page.getByRole('button', { name: /verify/i }).tap();
    
    // Should show loading state
    await expect(page.getByText(/verifying/i)).toBeVisible();
  });
  
  test('scrolling works on touch devices', async ({ page }) => {
    // Mock API to create a long result
    await page.route('**/search', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'This is a very long answer that should require scrolling. '.repeat(20),
          sources: Array(10).fill(0).map((_, i) => ({
            title: `Source ${i + 1}`,
            url: `https://example.com/${i + 1}`
          }))
        }),
      });
    });
    
    await page.goto('/');
    
    // Submit verification
    await page.getByRole('textbox').fill('Long result test');
    await page.getByRole('button', { name: /verify/i }).tap();
    
    // Wait for result
    await expect(page.getByText(/this is a very long answer/i)).toBeVisible();
    
    // Get initial position of an element near the bottom
    const initialPosition = await page.getByRole('link', { name: /source 10/i }).boundingBox()
      .then(box => box ? box.y : null);
    
    // Scroll down using touch gesture (swipe up)
    const middleX = page.viewportSize().width / 2;
    const startY = page.viewportSize().height * 0.7;
    const endY = page.viewportSize().height * 0.3;
    
    await page.touchscreen.tap(middleX, startY);
    await page.touchscreen.move(middleX, startY);
    await page.touchscreen.move(middleX, endY);
    await page.touchscreen.up();
    
    // Wait for scrolling to complete
    await page.waitForTimeout(500);
    
    // Get new position
    const newPosition = await page.getByRole('link', { name: /source 10/i }).boundingBox()
      .then(box => box ? box.y : null);
    
    // Position should have changed (element moved up)
    expect(newPosition).toBeLessThan(initialPosition);
  });
});
```

## 7. Accessibility Testing

Accessibility tests ensure the application is usable by people with disabilities.

### 7.1 Automated Accessibility Testing

```typescript
// tests/accessibility/automated.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('main page passes accessibility tests', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('verification results page passes accessibility tests', async ({ page }) => {
  // Mock API to return consistent results
  await page.route('**/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'This statement is true based on scientific evidence.',
        sources: [{ title: 'Scientific Source', url: 'https://example.com' }]
      }),
    });
  });
  
  await page.goto('/');
  
  // Complete verification to show results
  await page.getByRole('textbox').fill('Accessibility test');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for results to appear
  await expect(page.getByText(/true/i)).toBeVisible();
  
  // Run accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('error state passes accessibility tests', async ({ page }) => {
  // Mock API to return error
  await page.route('**/search', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Server error' }),
    });
  });
  
  await page.goto('/');
  
  // Complete verification to trigger error
  await page.getByRole('textbox').fill('Error test');
  await page.getByRole('button', { name: /verify/i }).click();
  
  // Wait for error to appear
  await expect(page.getByRole('alert')).toBeVisible();
  
  // Run accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 7.2 Keyboard Navigation Tests

```typescript
// tests/accessibility/keyboard-navigation.spec.ts
import { test, expect } from '@playwright/test';

test('complete verification flow using only keyboard', async ({ page }) => {
  await page.goto('/');
  
  // Mock API to return consistent results
  await page.route('**/search', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        answer: 'This statement is true based on scientific evidence.',
        sources: [{ title: 'Scientific Source', url: 'https://example.com' }]
      }),
    });
  });
  
  // Focus on input field using Tab
  await page.keyboard.press('Tab');
  
  // Verify input is focused
  await expect(page.getByRole('textbox')).toBeFocused();
  
  // Type statement
  await page.keyboard.type('Keyboard navigation test');
  
  // Tab to submit button
  await page.keyboard.press('Tab');
  
  // Verify button is focused
  await expect(page.getByRole('button', { name: /verify/i })).toBeFocused();
  
  // Press Enter to submit
  await page.keyboard.press('Enter');
  
  // Wait for results
  await expect(page.getByText(/true/i)).toBeVisible();
  
  // Tab to first citation link
  await page.keyboard.press('Tab');
  
  // Verify link is focused
  await expect(page.getByRole('link')).toBeFocused();
  
  // Press Enter to open link (this would normally navigate away)
  // We'll intercept the navigation to verify it would happen
  let linkClicked = false;
  page.once('dialog', dialog => {
    linkClicked = true;
    dialog.dismiss();
  });
  
  await page.evaluate(() => {
    // Override link behavior to show dialog instead of navigating
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        window.alert('Link clicked');
      }
    }, { capture: true });
  });
  
  await page.keyboard.press('Enter');
  
  // Verify link was activated
  expect(linkClicked).toBe(true);
});

test('theme toggle works with keyboard', async ({ page }) => {
  await page.goto('/');
  
  // Tab to theme toggle button
  // Assuming it's the 2nd or 3rd focusable element on the page
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  
  // If not focused on theme toggle yet, tab again
  const isFocused = await page.evaluate(() => {
    const focused = document.activeElement;
    return focused && focused.getAttribute('aria-label')?.includes('mode');
  });
  
  if (!isFocused) {
    await page.keyboard.press('Tab');
  }
  
  // Store initial theme
  const initialTheme = await page.evaluate(() => 
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  
  // Press Enter to toggle theme
  await page.keyboard.press('Enter');
  
  // Verify theme changed
  const newTheme = await page.evaluate(() => 
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  
  expect(newTheme).not.toBe(initialTheme);
});
```

### 7.3 Screen Reader Tests (Manual)

While automated tests can check many aspects of accessibility, screen reader testing typically requires manual testing. However, we can document test cases for manual verification:

```markdown
# Manual Screen Reader Test Cases

## Verification Form
1. Navigate to form with screen reader
2. Verify input field has appropriate label
3. Verify button state (disabled/enabled) is announced
4. Enter text and submit form
5. Verify loading state is announced

## Verification Results
1. Navigate to results section
2. Verify verdict (true/false/inconclusive) is announced
3. Verify explanation is read correctly
4. Navigate to citations
5. Verify citations are announced as links

## Error States
1. Trigger an error state
2. Verify error is announced automatically (aria-live)
3. Verify error message is clear
4. Verify retry option is announced

## Theme Toggle
1. Navigate to theme toggle
2. Verify current state is announced
3. Activate toggle
4. Verify state change is announced
```

## 8. Test Automation and CI/CD Integration

### 8.1 Unit and Component Test Script

```json
// package.json (testing scripts)
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:mobile": "playwright test --project='Mobile Chrome' --project='Mobile Safari'",
    "test:accessibility": "playwright test tests/accessibility/",
    "test:performance": "playwright test tests/performance/",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### 8.2 GitHub Actions CI Configuration

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium firefox webkit
      - name: Run Playwright tests
        run: npm run test:e2e
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Run accessibility tests
        run: npm run test:accessibility
```

## 9. Test Data Management

### 9.1 Mock Data for Testing

```typescript
// src/tests/mocks/data.ts
export const mockStatements = {
  // Clear true statements
  trueStatements: [
    'The Earth revolves around the Sun',
    'Water boils at 100 degrees Celsius at sea level',
    'Humans need oxygen to survive',
    'The Declaration of Independence was signed in 1776',
    'Mount Everest is the tallest mountain on Earth'
  ],
  
  // Clear false statements
  falseStatements: [
    'The Earth is flat',
    'Vaccines cause autism',
    'Humans only use 10% of their brains',
    'Napoleon Bonaparte was extremely short',
    'Lightning never strikes the same place twice'
  ],
  
  // Nuanced/inconclusive statements
  inconclusiveStatements: [
    'Vitamin C prevents colds',
    'Breakfast is the most important meal of the day',
    'Drinking eight glasses of water daily is necessary for health',
    'Coffee stunts your growth',
    'Reading in dim light damages your eyesight'
  ],
  
  // Statements with special characters
  edgeCaseStatements: [
    'Statement with <script>alert("XSS")</script> tags',
    'Statement with line\nbreaks and tabs\t',
    'Statement with emoji 🔍 and unicode ⚠️',
    'Statement with SQL injection; DROP TABLE users;',
    'Extremely long statement ' + 'a'.repeat(1000)
  ]
};

export const mockApiResponses = {
  true: {
    answer: 'This statement is true based on scientific evidence and historical records.',
    sources: [
      { title: 'Scientific Journal', url: 'https://example.com/journal' },
      { title: 'Academic Research', url: 'https://example.com/research' }
    ]
  },
  
  false: {
    answer: 'This statement is false. It has been debunked by multiple fact-checking organizations and scientific studies.',
    sources: [
      { title: 'Fact Check', url: 'https://example.com/factcheck' },
      { title: 'Scientific Study', url: 'https://example.com/study' }
    ]
  },
  
  inconclusive: {
    answer: 'The evidence regarding this statement is mixed and inconclusive. Some studies suggest it may be partially true under specific conditions, while others contradict these findings.',
    sources: [
      { title: 'Supporting Research', url: 'https://example.com/supporting' },
      { title: 'Contradicting Research', url: 'https://example.com/contradicting' },
      { title: 'Meta-Analysis', url: 'https://example.com/metaanalysis' }
    ]
  },
  
  error: {
    error: 'Internal server error',
    status: 500
  },
  
  rateLimit: {
    error: 'Rate limit exceeded',
    status: 429
  }
};
```

### 9.2 MSW Handlers for API Mocking

```typescript
// src/tests/mocks/handlers.ts
import { rest } from 'msw';
import { mockApiResponses, mockStatements } from './data';

export const handlers = [
  rest.post('https://api.perplexity.ai/search', (req, res, ctx) => {
    // Extract query from request body
    const body = req.body;
    let query = '';
    
    if (body && typeof body === 'object' && 'query' in body) {
      query = body.query.toString().toLowerCase();
    }
    
    // Determine which response to send based on query content
    
    // Check for true statements
    if (mockStatements.trueStatements.some(statement => 
      query.includes(statement.toLowerCase()))) {
      return res(ctx.json(mockApiResponses.true));
    }
    
    // Check for false statements
    if (mockStatements.falseStatements.some(statement => 
      query.includes(statement.toLowerCase()))) {
      return res(ctx.json(mockApiResponses.false));
    }
    
    // Check for inconclusive statements
    if (mockStatements.inconclusiveStatements.some(statement => 
      query.includes(statement.toLowerCase()))) {
      return res(ctx.json(mockApiResponses.inconclusive));
    }
    
    // Check for error triggers
    if (query.includes('error')) {
      return res(
        ctx.status(500),
        ctx.json(mockApiResponses.error)
      );
    }
    
    // Check for rate limit triggers
    if (query.includes('rate limit')) {
      return res(
        ctx.status(429),
        ctx.json(mockApiResponses.rateLimit)
      );
    }
    
    // Default case - return a generic true response
    return res(ctx.json(mockApiResponses.true));
  })
];
```

## 10. Comprehensive Test Matrix

To ensure complete test coverage across different dimensions, we use a test matrix:

| Feature | Unit Tests | Component Tests | Integration Tests | E2E Tests | Performance Tests | Accessibility Tests | Mobile Tests |
|---------|------------|----------------|-------------------|-----------|-------------------|---------------------|--------------|
| Verification Form | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| API Client | ✅ | N/A | ✅ | ✅ | ✅ | N/A | ✅ |
| Verdict Display | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Citations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Theme Toggle | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Error Handling | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Animations | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Responsiveness | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

## 11. Testing Schedule and Resources

### 11.1 Testing Schedule

| Phase | Tests to Run | When | Duration | Resources |
|-------|--------------|------|----------|-----------|
| **Development** | Unit tests | During development | Continuous | Developers |
| **Feature Complete** | Component tests | When feature is complete | 1-2 hours | Developers |
| **Integration** | Integration tests | When features are combined | 2-3 hours | Developers |
| **Pre-release** | E2E tests | Before submitting | 3-4 hours | Developers |
| **Pre-release** | Cross-browser tests | Before submitting | 2-3 hours | Developers |
| **Pre-release** | Performance tests | Before submitting | 1-2 hours | Developers |
| **Pre-release** | Accessibility tests | Before submitting | 1-2 hours | Developers |

### 11.2 Test Environment Requirements

- **Local Development**: Modern browser, Node.js environment
- **CI Environment**: Linux-based runner with browsers installed
- **Browser Coverage**: Chrome, Firefox, Safari (latest versions)
- **Device Coverage**: Desktop, tablet, and mobile viewports
- **Performance Testing**: Standard and throttled conditions

## Conclusion

This comprehensive testing strategy ensures that the Myth Buster app is thoroughly validated across multiple dimensions:

1. **Functionality**: Through unit, component, integration, and E2E tests
2. **Performance**: Through dedicated performance metrics and optimizations
3. **Accessibility**: Through automated testing and manual verification
4. **Compatibility**: Through cross-browser and device testing
5. **Usability**: Through user flow validation and visual testing

By implementing this testing approach, we build confidence in the application's quality and readiness for submission to the hackathon, demonstrating our commitment to delivering a polished, reliable user experience.