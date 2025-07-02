import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types'; // Corrected import
import type { User } from '@prisma/client';
import { updateUserDetails, updateUserPassword } from '$lib/server/profile';
import { prisma as db } from '$lib/server/db';
import type {
	UserResearchActivity as UserResearchActivityType,
	PremiumAnalytics as PremiumAnalyticsType
} from '$lib/types/index';

export interface PageData {
	user: User | null;
	userResearchActivities: UserResearchActivityType[];
	premiumAnalytics: PremiumAnalyticsType | null;
}

export const load: PageServerLoad<PageData> = async ({ locals }: { locals: App.Locals }) => {
	// If user is not logged in, redirect to sign in page
	if (!locals.user) {
		throw redirect(303, '/signin?redirectTo=/profile');
	}

	const userResearchActivities = await db.userResearchActivity.findMany({
		where: { userId: locals.user.id },
		orderBy: { timestamp: 'desc' },
		take: 10 // Get recent activities
	});

	const premiumAnalytics = await db.premiumAnalytics.findFirst({
		where: { userId: locals.user.id },
		orderBy: { timestamp: 'desc' }
	});

	return {
		user: locals.user, // Add user to the returned data
		userResearchActivities: userResearchActivities.map((activity) => {
			let lensUsageMetrics: Record<string, number> | null = null;
			if (activity.lensUsageMetrics) {
				if (typeof activity.lensUsageMetrics === 'string') {
					try {
						lensUsageMetrics = JSON.parse(activity.lensUsageMetrics) as Record<string, number>;
					} catch (e) {
						console.error('Failed to parse lensUsageMetrics JSON:', e);
					}
				} else if (
					typeof activity.lensUsageMetrics === 'object' &&
					activity.lensUsageMetrics !== null
				) {
					lensUsageMetrics = activity.lensUsageMetrics as Record<string, number>;
				}
			}

			let mythTopicFrequency: Record<string, number> | null = null;
			if (activity.mythTopicFrequency) {
				if (typeof activity.mythTopicFrequency === 'string') {
					try {
						mythTopicFrequency = JSON.parse(activity.mythTopicFrequency) as Record<string, number>;
					} catch (e) {
						console.error('Failed to parse mythTopicFrequency JSON:', e);
					}
				} else if (
					typeof activity.mythTopicFrequency === 'object' &&
					activity.mythTopicFrequency !== null
				) {
					mythTopicFrequency = activity.mythTopicFrequency as Record<string, number>;
				}
			}

			return {
				...activity,
				researchSessionId: activity.researchSessionId || null,
				generatedContentSnippet: activity.generatedContentSnippet || null,
				mythId: activity.mythId || null,
				verificationStatus: activity.verificationStatus || null,
				lensUsageMetrics,
				mythTopicFrequency
			} as UserResearchActivityType;
		}),
		premiumAnalytics: premiumAnalytics as PremiumAnalyticsType | null
	};
};

export const actions: Actions = {
	updateDetails: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
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

	updatePassword: async ({ request, locals }: { request: Request; locals: App.Locals }) => {
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
