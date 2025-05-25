# Perplexity API: Structured Outputs (`response_format`)

This document outlines how the `response_format` parameter is used with the Perplexity Sonar API to obtain structured outputs, based on the [Perplexity API Documentation](https://docs.perplexity.ai/guides/structured-outputs) and the implementation in this project.

The `response_format` parameter is a crucial tool for ensuring that the AI's response adheres to a specific format, making it easier to parse and use programmatically.

## Supported Types

Perplexity API currently supports two main types of structured outputs via the `response_format` parameter:

1.  **`json_schema`**: Guarantees the output is a JSON object that conforms to a provided JSON schema.
2.  **`regex`**: Guarantees the output matches a provided regular expression.

This project primarily utilizes the `json_schema` type for structured data extraction (e.g., myth verification details, research lens findings, synthesis results).

## Using `json_schema`

The `json_schema` type requires you to provide a JSON schema object that the AI's output must adhere to.

**Defining the Schema:**

*   In TypeScript, you typically define the desired structure using interfaces.
    ```typescript
    interface Citation {
      title: string;
      url: string;
    }

    interface VerifyMythResponse {
      verdict: 'true' | 'false' | 'inconclusive';
      explanation: string;
      citations: Citation[];
      // ... other fields as defined in the prompt
    }
    ```
*   This TypeScript interface conceptually maps to a JSON schema. While you could manually write the JSON schema object, libraries like Pydantic (in Python) can generate schemas from code definitions. In a TypeScript environment like this SvelteKit project, we define the schema directly as a JavaScript object within the API payload, mirroring the structure implied by the TypeScript interface.

    Example JSON schema object for `VerifyMythResponse`:
    ```json
    {
      "type": "object",
      "properties": {
        "verdict": { "type": "string", "enum": ["true", "false", "inconclusive"] },
        "explanation": { "type": "string" },
        "citations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "title": { "type": "string" },
              "url": { "type": "string" }
            },
            "required": ["title", "url"]
          }
        },
        "mythOrigin": { "type": "string" },
        "relatedMyth": { "type": "string" },
        "whyBelieved": { "type": "string" }
      },
      "required": ["verdict", "explanation", "citations"],
      "additionalProperties": false
    }
    ```

**Including `response_format` in the API Payload:**

Add the `response_format` field to the main API request body (the payload sent to `https://api.perplexity.ai/chat/completions`).

```typescript
const payload = {
  model: 'sonar', // Or other suitable model
  messages: [
    { role: 'system', content: SYSTEM_PROMPT_DEFINING_SCHEMA_AND_TASK },
    { role: 'user', content: USER_QUERY }
  ],
  temperature: 0.x,
  max_tokens: XXXX,
  // ... other parameters like web_search_options
  response_format: { // <<< Add this block
    type: 'json_schema',
    json_schema: {
      schema: {
        // ... your JSON schema object here ...
      }
    }
  }
};
```

**Handling the API Response:**

Even when using `response_format: json_schema`, the Perplexity API might return the JSON object as a **string** within the `message.content` field, rather than a direct JSON object.

Therefore, the server-side code receiving the API response must:

1.  Check if `answer.choices?.[0]?.message?.content` exists.
2.  Determine if the content is a string or already an object.
3.  If it's a string, attempt to `JSON.parse()` it.
4.  If parsing fails or if the initial content was not a string or object, handle it as an API format error.
5.  **Crucially**, validate the structure of the parsed object against the expected TypeScript interface to ensure all required fields are present and have the correct types.

This project's `makePerplexityRequest` function and the validation logic in the server actions (`verifyMythLogic`, `researchLens`, `analyzeSource`, `synthesizeInsights`) implement this robust handling.

## Using `regex` (Briefly)

The `regex` type is simpler, requiring only a regular expression string that the AI's output must match.

```typescript
const payload = {
  model: 'sonar', // Only available for certain models (e.g., sonar)
  messages: [
    { role: 'system', content: "Provide only the IPv4 address." },
    { role: 'user', content: "What is the IPv4 address of OpenDNS DNS server?" }
  ],
  response_format: { // <<< Add this block
    type: 'regex',
    regex: {
      regex: "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)" // IPv4 regex
    }
  }
};
```
This project does not currently use the `regex` format, but it's available for simpler, pattern-based outputs.

By leveraging the `response_format` parameter, especially with `json_schema`, the Myth Buster application can reliably receive structured data from the Perplexity API, which is essential for parsing and utilizing the AI's output programmatically in the deep research features.