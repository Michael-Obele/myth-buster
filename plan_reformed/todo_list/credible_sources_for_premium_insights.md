# Credible Sources for Premium Insights and Enhanced Source Analysis

This document outlines a strategy for identifying and utilizing credible sources to enhance the Myth Buster application. The goal is to provide users with a higher level of trust and depth in the information presented, particularly for premium features.

The key to this strategy is leveraging the Perplexity Sonar API's `search_domain_filter` parameter, which allows for precise control over the web search sources used to generate a response. This guide is based on the official [Perplexity Search Domain Filter Guide](https://docs.perplexity.ai/guides/search-domain-filters).

## I. Highly Credible Domains & Source Categories (Allowlist Candidates)

These domains represent authoritative, peer-reviewed, and fact-checked information. They should be prioritized for queries requiring the highest level of accuracy, such as deep research and premium insights.

### A. Academic & Research Institutions
*   **Academic Publishers & Databases:** `pubmed.ncbi.nlm.nih.gov`, `jstor.org`, `scholar.google.com`, `sciencedirect.com`, `springer.com`, `nature.com`, `sciencemag.org`, `plos.org`, `cell.com`, `wiley.com`, `tandfonline.com`, `ieee.org`, `acm.org`
*   **Medical & Scientific Journals:** `nejm.org`, `thelancet.com`, `jamanetwork.com`, `bmj.com`, `academic.oup.com`
*   **Preprint Servers (Note lack of peer review):** `medrxiv.org`, `biorxiv.org`

### B. Government & International Organizations
*   **Official Government Websites:** `cdc.gov`, `nih.gov`, `fda.gov`, `who.int`, `un.org`, `data.gov`, `science.gov` (and other `.gov` domains)
*   **Government-affiliated Research Bodies:** `rand.org`

### C. Reputable Non-Profit & Fact-Checking Organizations
*   **Fact-Checking Sites:** `factcheck.org`, `politifact.com`, `snopes.com`, `truthorfiction.com`
*   **Well-established Non-Profits:** `hon.ch`, `icmje.org`, `aaas.org`

### D. Reputable News Organizations (High Factual Reporting)
*   **Minimal Bias:** `reuters.com`, `apnews.com`, `bbc.com`, `pbs.org`
*   **Identifiable Editorial Bias:** `nytimes.com`, `washingtonpost.com`, `wsj.com`, `economist.com`

## II. Untrustworthy Domains & Source Categories (Denylist Candidates)

These sources often exhibit strong bias, lack rigorous fact-checking, or are known to promote misinformation. They should be explicitly excluded from search results to maintain the integrity of the application's responses.

*   **Sources with Known Disinformation Ties:** `rt.com`, `sputniknews.com`, `breitbart.com`, `thegatewaypundit.com`, `infowars.com`, `worldnetdaily.com`, `zerohedge.com`, `activistpost.com`, `westernjournal.com`
*   **Forums & User-Editable Content:** `reddit.com`, `quora.com` (and social media sites like `pinterest.com`, `facebook.com`, etc., unless it's an official channel of a credible organization).
*   **General Wikis:** `wikipedia.org` (While useful for general orientation, it should not be the primary source for deep fact-checking and can be excluded to force reliance on primary sources).

## III. Implementation Guidelines for `search_domain_filter`

The `search_domain_filter` is a list of strings in the API request payload. You can specify up to **10 domains** per request.

*   To **include** a domain, add its name: `"nasa.gov"`
*   To **exclude** a domain, prefix its name with a minus sign: `"-infowars.com"`

### Strategy 1: Allowlisting for High-Trust Queries

For premium features like "Deep Research" or "Analyze Source," restrict the search to a curated list of the most credible domains. This provides the highest quality results.

*   **Example Payload (Allowlist):**
    ```typescript
    const premiumDomains = [
        // Select up to 10 of the most relevant domains from Section I
        'ncbi.nlm.nih.gov', 
        'jstor.org', 
        'cdc.gov', 
        'who.int', 
        'factcheck.org', 
        'reuters.com', 
        'apnews.com',
        'nejm.org',
        'thelancet.com',
        'nature.com'
    ];

    const payload = {
        model: 'sonar-large-online',
        messages: [/* ... */],
        search_domain_filter: premiumDomains
    };
    ```

### Strategy 2: Denylisting for General Queries

For standard myth verification, it's often more practical to exclude a list of known unreliable sources. This allows for a broad search while filtering out the worst offenders.

*   **Example Payload (Denylist):**
    ```typescript
    const untrustworthyDomains = [
        // Select up to 10 of the most problematic domains from Section II
        '-rt.com',
        '-breitbart.com',
        '-infowars.com',
        '-thegatewaypundit.com',
        '-zerohedge.com',
        '-sputniknews.com',
        '-activistpost.com',
        '-pinterest.com', // Often low-quality image results
        '-quora.com',     // User-generated opinions
        '-reddit.com'     // User-generated opinions
    ];

    const payload = {
        model: 'sonar-large-online',
        messages: [/* ... */],
        search_domain_filter: untrustworthyDomains
    };
    ```

### Best Practices

*   **Use Simple Domain Names:** Specify domains without `http://`, `https://`, or `www.` (e.g., use `example.com`, not `https://www.example.com`).
*   **Main Domains Cover Subdomains:** Filtering `example.com` will also apply to `sub.example.com`.
*   **Combine Approaches:** You can mix inclusion and exclusion in a single request, though it counts towards the 10-domain limit.
*   **Be Targeted:** Using a smaller, more relevant list of domains is often more effective than using the maximum of 10.
*   **Performance:** Overly restrictive filters may lead to fewer search results, potentially impacting response quality.

## IV. Continuous Evaluation & Maintenance

The online information landscape is constantly changing. The allowlists and denylists should be periodically reviewed and updated to ensure they remain effective. A mechanism for dynamically managing these lists (e.g., from a configuration file or database) is recommended over hardcoding them.