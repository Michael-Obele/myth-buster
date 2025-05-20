import { createUser, getUserByEmail, getUserByUsername } from '$lib/server/user';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Validation function for email
const isValidEmail = (email: string) => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
};

// Validation function for password
const isStrongPassword = (password: string) => {
	return password.length >= 8;
};

// export const load: PageServerLoad = async () => {
// 	return {
// 		form: {
// 			data: {
// 				username: '',
// 				email: '',
// 				password: '',
// 				confirmPassword: ''
// 			},
// 			errors: {}
// 		}
// 	};
// };

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		console.log('Sign Up: Processing signup request');

		const formData = await request.formData();
		const username = formData.get('username')?.toString() || '';
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';
		const confirmPassword = formData.get('confirmPassword')?.toString() || '';

		console.log(`Sign Up: Received form data for username: ${username}, email: ${email}`);

		const errors: Record<string, string[]> = {};

		// Validate username
		if (!username) {
			console.log('Sign Up: Username is missing');
			errors.username = ['Username is required'];
		} else if (username.length < 3) {
			console.log('Sign Up: Username is too short');
			errors.username = ['Username must be at least 3 characters'];
		} else if (username.length > 20) {
			console.log('Sign Up: Username is too long');
			errors.username = ['Username must be at most 20 characters'];
		}

		// Validate email
		if (!email) {
			console.log('Sign Up: Email is missing');
			errors.email = ['Email is required'];
		} else if (!isValidEmail(email)) {
			console.log('Sign Up: Invalid email format');
			errors.email = ['Invalid email address'];
		}

		// Validate password
		if (!password) {
			console.log('Sign Up: Password is missing');
			errors.password = ['Password is required'];
		} else if (!isStrongPassword(password)) {
			console.log('Sign Up: Password is not strong enough');
			errors.password = ['Password must be at least 8 characters'];
		}

		// Validate password confirmation
		if (password !== confirmPassword) {
			console.log('Sign Up: Passwords do not match');
			errors.confirmPassword = ['Passwords do not match'];
		}

		// If there are validation errors, return them
		if (Object.keys(errors).length > 0) {
			console.log('Sign Up: Validation failed', errors);
			return fail(400, {
				form: {
					data: { username, email, password: '', confirmPassword: '' },
					errors
				}
			});
		}

		// Check if the username is already taken
		console.log(`Sign Up: Checking if username ${username} is already taken`);
		const existingUsername = await getUserByUsername(username);
		if (existingUsername) {
			console.log('Sign Up: Username is already taken');
			return fail(400, {
				form: {
					data: { username, email, password: '', confirmPassword: '' },
					errors: { username: ['Username is already taken'] }
				}
			});
		}

		// Check if the email is already taken
		console.log(`Sign Up: Checking if email ${email} is already registered`);
		const existingEmail = await getUserByEmail(email);
		if (existingEmail) {
			console.log('Sign Up: Email is already registered');
			return fail(400, {
				form: {
					data: { username, email, password: '', confirmPassword: '' },
					errors: { email: ['Email is already registered'] }
				}
			});
		}

		// Create the user
		console.log('Sign Up: Creating new user account');
		const { success, user, error } = await createUser(username, email, password);

		if (!success || !user) {
			console.error('Sign Up: Error creating user:', error);
			return fail(500, {
				form: {
					data: { username, email, password: '', confirmPassword: '' },
					errors: { error: ['An error occurred while creating your account'] }
				}
			});
		}

		// Generate a session token and create a session
		console.log(`Sign Up: User created successfully with ID: ${user.id}, creating session`);
		const token = generateSessionToken();
		const session = await createSession(token, user.id);

		// Set the session cookie
		setSessionTokenCookie({ cookies } as any, token, session.expiresAt);
		console.log('Sign Up: Session cookie set');

		// Set the user and session in locals
		locals.user = user;
		locals.session = session;

		// Redirect to the app
		console.log('Sign Up: Complete, redirecting to homepage');
		// Make sure we're using a 303 status code for redirecting after a POST
		throw redirect(303, '/');
	}
};
