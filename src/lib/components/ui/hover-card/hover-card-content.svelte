<script lang="ts">
	import { LinkPreview as HoverCardPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	type $$Props = HoverCardPrimitive.ContentProps;

	let className: $$Props["class"] = undefined;
	export let align: $$Props["align"] = "center";
	export let sideOffset: $$Props["sideOffset"] = 4;
	export { className as class };
</script>

<HoverCardPrimitive.Content
	{align}
	{sideOffset}
	class={cn(
		"bg-popover text-popover-foreground z-50 mt-3 w-64 rounded-md border p-4 shadow-md outline-none animate-in fade-in-0 zoom-in-95",
		className
	)}
	{...$$restProps}
>
	<slot />
</HoverCardPrimitive.Content>
