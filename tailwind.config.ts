import defaultTheme from 'tailwindcss/defaultTheme';
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
		},
		extend: {
			// colors: {
			// 	border: 'hsl(var(--border) / <alpha-value>)',
			// 	input: 'hsl(var(--input) / <alpha-value>)',
			// 	ring: 'hsl(var(--ring) / <alpha-value>)',
			// 	background: 'hsl(var(--background) / <alpha-value>)',
			// 	foreground: 'hsl(var(--foreground) / <alpha-value>)',
			// 	primary: {
			// 		DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
			// 		foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
			// 	},
			// 	secondary: {
			// 		DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
			// 		foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
			// 	},
			// 	destructive: {
			// 		DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
			// 		foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
			// 	},
			// 	muted: {
			// 		DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
			// 		foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
			// 	},
			// 	accent: {
			// 		DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
			// 		foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
			// 	},
			// 	popover: {
			// 		DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
			// 		foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
			// 	},
			// 	card: {
			// 		DEFAULT: 'hsl(var(--card) / <alpha-value>)',
			// 		foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
			// 	},
			// 	sidebar: {
			// 		DEFAULT: 'hsl(var(--sidebar-background))',
			// 		foreground: 'hsl(var(--sidebar-foreground))',
			// 		primary: 'hsl(var(--sidebar-primary))',
			// 		'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
			// 		accent: 'hsl(var(--sidebar-accent))',
			// 		'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
			// 		border: 'hsl(var(--sidebar-border))',
			// 		ring: 'hsl(var(--sidebar-ring))'
			// 	},
			// 	'color-1': 'hsl(var(--color-1))',
			// 	'color-2': 'hsl(var(--color-2))',
			// 	'color-3': 'hsl(var(--color-3))',
			// 	'color-4': 'hsl(var(--color-4))',
			// 	'color-5': 'hsl(var(--color-5))'
			// },
			// borderRadius: {
			// 	xl: 'calc(var(--radius) + 4px)',
			// 	lg: 'var(--radius)',
			// 	md: 'calc(var(--radius) - 2px)',
			// 	sm: 'calc(var(--radius) - 4px)'
			// },
			fontFamily: {
				play: ['Playwrite DK Loopet', 'cursive'],
				underdog: ['Underdog', 'system-ui']
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--bits-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--bits-accordion-content-height)' },
					to: { height: '0' }
				},
				'caret-blink': {
					'0%,70%,100%': { opacity: '1' },
					'20%,50%': { opacity: '0' }
				},
				grid: {
					'0%': { transform: 'translateY(-50%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'aurora-border': {
					'0%, 100%': { borderRadius: '37% 29% 27% 27% / 28% 25% 41% 37%' },
					'25%': { borderRadius: '47% 29% 39% 49% / 61% 19% 66% 26%' },
					'50%': { borderRadius: '57% 23% 47% 72% / 63% 17% 66% 33%' },
					'75%': { borderRadius: '28% 49% 29% 100% / 93% 20% 64% 25%' }
				},
				'aurora-1': {
					'0%, 100%': { top: '0', right: '0' },
					'50%': { top: '50%', right: '25%' },
					'75%': { top: '25%', right: '50%' }
				},
				'aurora-2': {
					'0%, 100%': { top: '0', left: '0' },
					'60%': { top: '75%', left: '25%' },
					'85%': { top: '50%', left: '50%' }
				},
				'aurora-3': {
					'0%, 100%': { bottom: '0', left: '0' },
					'40%': { bottom: '50%', left: '25%' },
					'65%': { bottom: '25%', left: '50%' }
				},
				'aurora-4': {
					'0%, 100%': { bottom: '0', right: '0' },
					'50%': { bottom: '25%', right: '40%' },
					'90%': { bottom: '50%', right: '25%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite',
				grid: 'grid 15s linear infinite'
			}
		}
	},
	plugins: [
		addVariablesForColors
		// Custom background patterns are removed for Tailwind CSS v4 migration.
		// This functionality should be handled differently in v4, likely using inline styles or a more specific plugin if needed.
		// Refer to BackgroundBoxes.svelte for where the pattern selection logic is handled.
		// In a Tailwind v4 context, the getPatternClass function would need to be updated
		// to generate styles directly or use a different v4-compatible approach.
	]
};

export default config;
