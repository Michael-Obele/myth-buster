<script lang="ts">
	import { page } from '$app/state';

	type Props = {
		title?: string;
		description?: string;
		keywords?: string | string[];
		author?: string;
		ogTitle?: string;
		ogDescription?: string;
		ogImage?: string;
		ogUrl?: string;
		ogType?: string; // e.g., 'website', 'article'
		ogSiteName?: string;
		ogLocale?: string;
		twitterCard?: string; // e.g., 'summary', 'summary_large_image'
		twitterSite?: string; // e.g., '@username'
		twitterCreator?: string; // e.g., '@username'
		twitterTitle?: string;
		twitterImageAlt?: string;
		twitterDescription?: string;
		twitterImage?: string;
		canonicalUrl?: string;
		robots?: string; // e.g., 'index, follow', 'noindex, nofollow'
		themeColor?: string;
	};

	let {
		title = 'Myth Buster',
		description = 'Bust myths with AI-powered verification. Get facts, explanations, and sources for common misconceptions.',
		keywords,
		author = 'Myth Buster Team',
		ogTitle,
		ogDescription,
		ogImage,
		ogUrl,
		ogType = 'website',
		twitterCard = 'summary_large_image',
		twitterSite, // Add your site's Twitter handle here if you have one
		twitterCreator,
		twitterTitle,
		twitterDescription,
		twitterImage,
		ogSiteName = '',
		ogLocale = 'en_US',
		twitterImageAlt = '',
		canonicalUrl,
		robots = 'index, follow',
		themeColor = '#1A202C' // Default theme color (dark)
	}: Props = $props();

	// Derive values if specific OG/Twitter props are not provided
	const currentOgTitle = $derived(ogTitle || title);
	const currentOgSiteName = $derived(ogSiteName || 'Myth Buster');
	const currentOgLocale = $derived(ogLocale || 'en_US'); // Default to English, US
	const currentOgDescription = $derived(ogDescription || description);
	const currentOgUrl = $derived(ogUrl || page.url.href);
	const currentTwitterTitle = $derived(twitterTitle || title);
	const currentTwitterDescription = $derived(twitterDescription || description);
	const currentCanonicalUrl = $derived(canonicalUrl || page.url.href);

	let keywordsString = $derived.by(() => {
		if (Array.isArray(keywords)) {
			return keywords.join(', ');
		}
		return (
			keywords || 'myth busting, fact checking, AI, truth, verification, common misconceptions'
		);
	});
</script>

<!-- Basic SEO -->
<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywordsString} />
	<meta name="author" content={author} />
	<link rel="canonical" href={currentCanonicalUrl} />
	<meta name="robots" content={robots} />
	<meta name="theme-color" content={themeColor} />

	<!-- Favicon - add your favicon links here -->
	<!-- Example:
	<link rel="icon" href="/favicon.ico" sizes="any">
	<link rel="icon" href="/icon.svg" type="image/svg+xml">
	<link rel="apple-touch-icon" href="/apple-touch-icon.png">
	<link rel="manifest" href="/manifest.webmanifest">
	-->

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={currentOgUrl} />
	<meta property="og:site_name" content={currentOgSiteName} />
	<meta property="og:locale" content={currentOgLocale} />
	<meta property="og:title" content={currentOgTitle} />
	<meta property="og:description" content={currentOgDescription} />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	{#if twitterSite}
		<meta name="twitter:site" content={twitterSite} />
	{/if}
	{#if twitterCreator}
		<meta name="twitter:creator" content={twitterCreator} />
	{/if}
	<meta name="twitter:url" content={currentOgUrl} />
	<meta name="twitter:title" content={currentTwitterTitle} />
	<meta name="twitter:description" content={currentTwitterDescription} />
	{#if twitterImage}
		<meta name="twitter:image" content={twitterImage} />
		{#if twitterImage && twitterImageAlt}
			<meta name="twitter:image:alt" content={twitterImageAlt} />
		{/if}
	{/if}
</svelte:head>
