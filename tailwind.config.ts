import type { Config } from 'tailwindcss';
import svgToDataUri from 'mini-svg-data-uri';

// Helper function to flatten color palette for the grid and dot patterns
function flattenColorPalette(colors: any) {
	return Object.assign(
		{},
		...Object.entries(colors ?? {}).flatMap(([color, values]) =>
			typeof values == 'object'
				? Object.entries(flattenColorPalette(values)).map(([key, rgb]) => ({
						[color + (key === 'DEFAULT' ? '' : `-${key}`)]: rgb
					}))
				: [{ [`${color}`]: values }]
		)
	);
}

// Function to add CSS variables for colors
function addVariablesForColors({ addBase, theme }: any) {
	const allColors = flattenColorPalette(theme('colors'));
	const newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
	);

	addBase({
		':root': newVars
	});
}

const config: Config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		}
	},
	plugins: [
		addVariablesForColors,
		// Custom background patterns are removed for Tailwind CSS v4 migration.
		// This functionality should be handled differently in v4, likely using inline styles or a more specific plugin if needed.
		// Refer to BackgroundBoxes.svelte for where the pattern selection logic is handled.
		// In a Tailwind v4 context, the getPatternClass function would need to be updated
		// to generate styles directly or use a different v4-compatible approach.
		function ({ matchUtilities, theme }: any) {
			matchUtilities(
				{
					'bg-grid': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
						)}")`
					}),
					'bg-grid-small': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="8" height="8" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`
						)}")`
					}),
					'bg-dot': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
						)}")`
					})
				},
				{ values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
			);
		}
	]
};

export default config;
