import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { updateUserDetails, updateUserPassword } from '$lib/server/profile';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is not logged in, redirect to sign in page
	if (!locals.user) {
		throw redirect(303, '/signin?redirectTo=/profile');
	}

	return {};
};

export const actions: Actions = {
	updateDetails: async ({ request, locals }) => {
		// Ensure user is logged in
		if (!locals.user) {
			throw redirect(303, '/signin?redirectTo=/profile');
		}

		// Get form data
		const formData = await request.formData();
		const username = formData.get('username')?.toString() || '';
		const email = formData.get('email')?.toString() || '';

		// Initialize errors object
		const errors: Record<string, string> = {};

		// Validate username
		if (!username) {
			errors.username = 'Username is required';
		} else if (username.length < 3) {
			errors.username = 'Username must be at least 3 characters long';
		} else if (username.length > 50) {
			errors.username = 'Username must be less than 50 characters';
		} else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
			errors.username = 'Username can only contain letters, numbers, and underscores';
		}

		// Validate email
		if (!email) {
			errors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errors.email = 'Please enter a valid email address';
		}

		// Return errors if validation failed
		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, username, email });
		}

		// Update user details
		const result = await updateUserDetails(locals.user.id, username, email);

		if (!result.success) {
			return fail(400, {
				errors: { error: result.message },
				detailsMessage: result.message,
				detailsSuccess: false,
				username,
				email
			});
		}

		// Update locals with new data
		locals.user.username = username;
		locals.user.email = email;

		// Return success message
		return {
			detailsMessage: result.message,
			detailsSuccess: true
		};
	},

	updatePassword: async ({ request, locals }) => {
		// Ensure user is logged in
		if (!locals.user) {
			throw redirect(303, '/signin?redirectTo=/profile');
		}

		// Get form data
		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword')?.toString() || '';
		const newPassword = formData.get('newPassword')?.toString() || '';
		const confirmPassword = formData.get('confirmPassword')?.toString() || '';

		// Initialize errors object
		const errors: Record<string, string> = {};

		// Validate current password
		if (!currentPassword) {
			errors.currentPassword = 'Current password is required';
		}

		// Validate new password
		if (!newPassword) {
			errors.newPassword = 'New password is required';
		} else if (newPassword.length < 8) {
			errors.newPassword = 'Password must be at least 8 characters long';
		} else if (!/[A-Z]/.test(newPassword)) {
			errors.newPassword = 'Password must contain at least one uppercase letter';
		} else if (!/[a-z]/.test(newPassword)) {
			errors.newPassword = 'Password must contain at least one lowercase letter';
		} else if (!/[0-9]/.test(newPassword)) {
			errors.newPassword = 'Password must contain at least one number';
		}

		// Validate confirm password
		if (!confirmPassword) {
			errors.confirmPassword = 'Please confirm your new password';
		} else if (newPassword !== confirmPassword) {
			errors.confirmPassword = 'Passwords do not match';
		}

		// Return errors if validation failed
		if (Object.keys(errors).length > 0) {
			return fail(400, { errors });
		}

		// Verify the current password before proceeding
		const { verifyPassword } = await import('$lib/server/user');
		const isCurrentPasswordValid = await verifyPassword(locals.user.id, currentPassword);

		if (!isCurrentPasswordValid) {
			return fail(400, {
				errors: { currentPassword: 'Current password is incorrect' },
				passwordMessage: 'Current password is incorrect',
				passwordSuccess: false
			});
		}

		// Update password - this handles hashing and storing the new password
		const result = await updateUserPassword(locals.user.id, currentPassword, newPassword);

		if (!result.success) {
			return fail(400, {
				errors: { error: result.message },
				passwordMessage: result.message,
				passwordSuccess: false
			});
		}

		// If successful, redirect to sign-out page since sessions are invalidated
		throw redirect(303, '/signout');
	}
};
