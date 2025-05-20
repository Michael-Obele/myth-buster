import {
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from '$lib/server/session';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Get the session token from cookies
	const token = event.cookies.get('session') ?? null;

	if (token === null) {
		event.locals.user = null;
		event.locals.session = null;
	} else {
		// Validate the session token
		const { session, user } = await validateSessionToken(token);

		if (session !== null) {
			// Extend the session if needed
			setSessionTokenCookie(event, token, session.expiresAt);
			event.locals.session = session;
			event.locals.user = user;
		} else {
			// Delete the invalid session cookie
			deleteSessionTokenCookie(event);
			event.locals.user = null;
			event.locals.session = null;
		}
	}

	// Protected routes that require authentication
	// if (event.url.pathname.startsWith('/app')) {
	//   if (event.locals.user === null) {
	//     throw redirect(303, '/signin?redirectTo=/app');
	//   }
	// }

	// Routes that should redirect to app if already authenticated
	if (['/signin', '/signup'].includes(event.url.pathname)) {
		if (event.locals.user !== null) {
			throw redirect(303, '/app');
		}
	}

	return await resolve(event);
};
