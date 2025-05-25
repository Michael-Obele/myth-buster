# How to Add `response_format` to Perplexity API Requests

This guide explains how to add the `response_format` parameter to Perplexity API requests for structured outputs, ensuring reliable and type-safe responses in your SvelteKit project.

---

## 1. Define the Expected Output Structure

First, decide what structure you want the API to return. Define a TypeScript interface for the expected response:

```typescript
interface MyResponse {
  verdict: 'true' | 'false' | 'inconclusive';
  explanation: string;
  citations: { title: string; url: string }[];
}
```

---

## 2. Create the Corresponding JSON Schema

Translate your TypeScript interface into a JSON schema object:

```typescript
const jsonSchema = {
  type: "object",
  properties: {
    verdict: { type: "string", enum: ["true", "false", "inconclusive"] },
    explanation: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          url: { type: "string" }
        },
        required: ["title", "url"]
      }
    }
  },
  required: ["verdict", "explanation", "citations"],
  additionalProperties: false
};
```

---

## 3. Add `response_format` to the API Payload

Include the `response_format` field in your API request body:

```typescript
const payload = {
  model: "sonar",
  messages: [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: USER_QUERY }
  ],
  response_format: {
    type: "json_schema",
    json_schema: { schema: jsonSchema }
  },
  // ...other parameters
};
```

---

## 4. Parse and Validate the API Response

The Perplexity API may return the structured output as a string in `message.content`. Always:

1. Check if `message.content` exists.
2. If it's a string, use `JSON.parse()` to convert it to an object.
3. Validate the parsed object against your TypeScript interface (manually or with a validation library).
4. Handle errors if parsing or validation fails.

Example:

```typescript
const content = answer.choices?.[0]?.message?.content;
let data: MyResponse | null = null;

if (typeof content === "string") {
  try {
    data = JSON.parse(content);
    // Optionally: validate fields here
  } catch {
    // Handle parse error
  }
}
```

---

## 5. Test and Iterate

- Test your integration with various prompts and edge cases.
- Update the schema and validation logic as needed.
- Document the schema and expected output for future maintainers.

---

**Tip:**  
For simple pattern-based outputs, you can use `response_format: { type: "regex", regex: { regex: "..." } }` instead.

---

By following these steps, you ensure robust, structured, and type-safe integration with the Perplexity API in your project.