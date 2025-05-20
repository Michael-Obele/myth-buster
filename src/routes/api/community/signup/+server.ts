import { json } from '@sveltejs/kit';
import { saveCommunitySignup } from '$lib/server/community';

export async function POST({ request }) {
	const { name, email } = await request.json();

	// Basic validation
	if (!name || !email) {
		return json({ success: false, error: 'Name and email are required' }, { status: 400 });
	}

	// Email format validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ success: false, error: 'Invalid email format' }, { status: 400 });
	}

	// Save to database
	const result = await saveCommunitySignup(name, email);

	if (result.success) {
		return json({ success: true, message: 'Signed up successfully' });
	} else {
		return json({ success: false, error: result.error }, { status: 500 });
	}
}
