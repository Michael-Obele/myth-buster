# Svelte Event Handling: `on:event` vs `onevent`

This document clarifies the preferred syntax for event handling in Svelte projects, particularly distinguishing between `on:event` and `onevent`.

## Rule: Always use `on:event` for event listeners

In Svelte, the recommended and idiomatic way to bind event listeners to DOM elements or components is using the `on:event` directive. This syntax is native to Svelte and offers several advantages, including:

- **Clarity and Readability:** It clearly denotes an event listener, making the code easier to understand for other Svelte developers.
- **Svelte's Event System:** It integrates seamlessly with Svelte's optimized event dispatching and reactivity system.
- **Event Modifiers:** It supports Svelte's powerful event modifiers (e.g., `on:click|once`, `on:keydown|prevent`) which are not available with `onevent`.
- **Consistency:** Promotes a consistent coding style across the project.

### Incorrect Usage:

```svelte
<button onclick="handleClick()">Click Me</button>
<input onchange={handleChange} type="text" />
```

### Correct Usage:

```svelte
<script>
	let count = 0;
	function handleClick() {
		count++;
	}
</script>

<button on:click={handleClick}>Click Me: {count}</button>
<input on:change={handleChange} type="text" />
```

### Explanation:

The `onclick` and `onchange` attributes (and similar `on` prefixed attributes) are standard HTML attributes for event handlers. While they technically work in Svelte, they do not leverage Svelte's reactivity system as effectively as `on:event`. Using `on:event` ensures that Svelte can properly track dependencies and optimize updates related to the event, leading to more predictable behavior and better performance.

Therefore, for all event handling in Svelte components, consistently use the `on:event` directive.
