// myth-buster/src/lib/server/sourceConfig.ts

// This file centralizes lists of credible and undesired domains for AI analysis.
// It's used to filter Perplexity Sonar API search results and guide source analysis.

// Domains generally considered authoritative, peer-reviewed, and fact-checked.
// Prioritized for premium insights and enhanced source analysis.
export const CREDIBLE_DOMAINS = [
	// Academic & Research Institutions
	'example.edu',
	'universityofx.edu',
	'pubmed.ncbi.nlm.nih.gov',
	'jstor.org',
	'scholar.google.com', // Use with caution, filter for peer-reviewed
	'sciencedirect.com',
	'springer.com',
	'nature.com',
	'sciencemag.org',
	'plos.org',
	'cell.com',
	'elsevier.com',
	'wiley.com',
	'tandfonline.com',
	'ieee.org',
	'acm.org',
	'medrxiv.org', // Preprint, note lack of peer review
	'biorxiv.org', // Preprint, note lack of peer review
	'nejm.org',
	'thelancet.com',
	'jamanetwork.com',
	'bmj.com',
	'acpjournals.org',
	'ajpmonline.org',
	'mayoclinicproceedings.org',
	'jci.org',
	'bmjpediatr.biomedcentral.com',
	'academic.oup.com',
	'annualreviews.org',
	'frontiersin.org',
	'journals.plos.org',
	'sagepub.com',
	'dl.acm.org',

	// Government & International Organizations
	'usa.gov',
	'cdc.gov',
	'nih.gov',
	'fda.gov',
	'who.int',
	'un.org',
	'data.gov',
	'science.gov',
	'rand.org', // Government-affiliated research

	// Reputable Non-Profit & Fact-Checking Organizations
	'factcheck.org',
	'politifact.com',
	'snopes.com',
	'truthorfiction.com',
	'hon.ch', // Health On the Net Foundation
	'urac.org', // Healthcare accreditation
	'icmje.org', // Medical Journal Editors
	'acla.org', // Comparative Literature
	'socr.org', // Statistics Online
	'aas.org', // Astronomical Society
	'aaas.org', // Advancement of Science
	'commons.wikimedia.org', // Open Media

	// Reputable News Organizations (known for editorial rigor)
	// Neutral / Low Bias
	'reuters.com',
	'apnews.com',
	'bbc.com',
	'pbs.org',
	// High Factual Reporting / Potential Bias
	'nytimes.com',
	'washingtonpost.com',
	'wsj.com',
	'economist.com',
	'ft.com',
	'npr.org'
];

// Domains to avoid or treat with extreme caution due to known bias, disinformation, or lack of rigor.
// These are generally excluded or heavily down-weighted for premium insights.
export const UNDESIRED_DOMAINS = [
	// Sources with Known Disinformation Ties
	'rt.com',
	'sputniknews.com',
	'breitbart.com',
	'thegatewaypundit.com',
	'infowars.com',
	'worldnetdaily.com',
	'zerohedge.com',
	'dcclothesline.com',
	'dcdirtylaundry.com',
	'americangreatness.com',
	'bigleaguepolitics.com',
	'activistpost.com',
	'westernjournal.com',
	'intellihub.com',
	'worldtruth.tv',
	'21stcenturywire.com',

	// Personal Blogs/Opinion Sites (unless author is recognized expert and content is scholarly)
	// This is a broad category; specific domains would need careful identification.

	// Forums, Social Media, Wikis (user-editable content generally not for premium insight sourcing)
	'wikipedia.org', // Useful for initial context, not primary premium source
	'reddit.com',
	'facebook.com',
	'twitter.com', // X.com
	'tiktok.com',
	'youtube.com' // Except for official channels of credible orgs

	// Commercial Sites with Strong Product/Service Bias
	// Sites heavily pushing supplements, unproven cures, or biased claims.
	// Specific domains would require ongoing curation.
];

/**
 * Checks if a given URL is from a domain that should be avoided.
 * @param url The URL string to check.
 * @returns boolean True if the URL is from an undesired domain, false otherwise.
 */
export function isUndesiredSource(url: string): boolean {
	if (!url) return false;
	try {
		const hostname = new URL(url).hostname;
		return UNDESIRED_DOMAINS.some((domain) => hostname.includes(domain));
	} catch (e) {
		// If URL is invalid, treat as not from an undesired domain for safety, or log error.
		console.warn(`[SourceConfig] Could not parse URL for undesired domain check: ${url}`, e);
		return false;
	}
}

/**
 * Checks if a given URL is from a domain that is considered credible.
 * @param url The URL string to check.
 * @returns boolean True if the URL is from a credible domain, false otherwise.
 */
export function isCredibleSource(url: string): boolean {
	if (!url) return false;
	try {
		const hostname = new URL(url).hostname;
		return CREDIBLE_DOMAINS.some((domain) => hostname.endsWith(domain)); // Use endsWith for subdomains like www.nature.com
	} catch (e) {
		console.warn(`[SourceConfig] Could not parse URL for credible domain check: ${url}`, e);
		return false;
	}
}
