import type { Actions } from './$types';
import { PERPLEXITY_API_KEY } from '$env/static/private';

// You should store your Perplexity API key securely (e.g. env vars). For now, use a placeholder.
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const SYSTEM_PROMPT = 'Be precise and concise.';

export const actions: Actions = {
	verifyMyth: async ({ request }) => {
		const data = await request.formData();
		const myth = data.get('myth');
		if (typeof myth !== 'string' || !myth.trim()) {
			return { status: 400, body: { error: 'Myth is required.' } };
		}

		console.log('Received myth:', myth);
		const apiKey = PERPLEXITY_API_KEY;
		console.log('Using API Key:', apiKey ? '[REDACTED]' : 'MISSING');
		if (!apiKey) {
			console.error('Missing Perplexity API key on server.');
			return { status: 500, body: { error: 'Missing Perplexity API key on server.' } };
		}

		const payload = {
			model: 'sonar',
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT + ' Return a JSON object with fields "verdict" (true/false/inconclusive) and "citations" (array of URLs).' },
				{ role: 'user', content: myth }
			]
		};
		console.log('Payload to Perplexity:', JSON.stringify(payload, null, 2));

		try {
			const resp = await fetch(PERPLEXITY_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`
				},
				body: JSON.stringify(payload)
			});

			console.log('Perplexity API status:', resp.status);
			const answer = await resp.json();
			console.log('Perplexity API response:', JSON.stringify(answer, null, 2));

			if (!resp.ok) {
				console.error('Perplexity API error:', answer);
				return { status: resp.status, body: { error: 'Perplexity API error.' } };
			}

			// Return the formatted data in a way that's easy for the frontend to consume
			// Try to extract verdict from the response content
			let verdict = 'inconclusive';
			try {
				const content = answer.choices?.[0]?.message?.content;
				console.log('Raw content from Perplexity:', content);
				
				if (content) {
					const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
					if (jsonMatch && jsonMatch[1]) {
						const parsedContent = JSON.parse(jsonMatch[1]);
						console.log('Parsed verdict from content:', parsedContent.verdict);
						
						if (parsedContent.verdict === true || parsedContent.verdict === 'true') {
							verdict = 'true';
						} else if (parsedContent.verdict === false || parsedContent.verdict === 'false') {
							verdict = 'false';
							console.log('Setting verdict to false');
						}
					}
				}
			} catch (error) {
				console.error('Error extracting verdict:', error);
			}
			
			console.log('Final verdict being sent to frontend:', verdict);

			return {
				success: true,
				data: {
					answer,
					// Extract citations directly from the API response if available
					citations: answer.citations || [],
					// Include the extracted verdict
					verdict
				}
			};
		} catch (err) {
			console.error('Failed to contact Perplexity API:', err);
			return { status: 500, body: { error: 'Failed to contact Perplexity API.' } };
		}
	}
};
