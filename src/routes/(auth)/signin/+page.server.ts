import { getUserByUsername, verifyPassword } from '$lib/server/user';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// export const load: PageServerLoad = async () => {
// 	// Return empty form with no errors initially
// 	return {
// 		form: {
// 			data: { username: '', password: '' },
// 			errors: {}
// 		}
// 	};
// };

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		console.log('Sign In: Processing sign-in request');

		// Get form data from request
		const formData = await request.formData();
		const username = formData.get('username')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		console.log(`Sign In: Received form data for username: ${username}`);

		// Initialize form object
		const form = {
			data: { username, password },
			errors: {} as Record<string, string[]>
		};

		// Validate form inputs
		if (!username) {
			console.log('Sign In: Username is missing');
			form.errors.username = ['Username is required'];
		}

		if (!password) {
			console.log('Sign In: Password is missing');
			form.errors.password = ['Password is required'];
		}

		// Return early if validation failed
		if (Object.keys(form.errors).length > 0) {
			console.log('Sign In: Validation failed', form.errors);
			return fail(400, { form });
		}

		// Find the user by username
		console.log(`Sign In: Looking up user with username: ${username}`);
		const user = await getUserByUsername(username);

		if (!user) {
			console.log('Sign In: User not found');
			form.errors.username = ['Invalid username or password'];
			return fail(400, { form });
		}

		// Verify the password
		console.log(`Sign In: Verifying password for user ID: ${user.id}`);
		const validPassword = await verifyPassword(user.id, password);

		if (!validPassword) {
			console.log('Sign In: Invalid password');
			form.errors.password = ['Invalid username or password'];
			return fail(400, { form });
		}

		// Generate a session token and create a session
		console.log('Sign In: Authentication successful, creating session');
		const token = generateSessionToken();
		const session = await createSession(token, user.id);

		// Set the session cookie
		setSessionTokenCookie({ cookies } as any, token, session.expiresAt);
		console.log('Sign In: Session cookie set');

		// Set the user and session in locals
		locals.user = user;
		locals.session = session;

		// Redirect to the app
		console.log('Sign In: Complete, redirecting to homepage');
		// Make sure we're using a 303 status code for redirecting after a POST
		throw redirect(303, '/');
	}
};
