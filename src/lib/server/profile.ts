import { prisma } from '$lib/server/db';
import { verifyPassword } from '$lib/server/user';
import { Argon2id } from 'oslo/password';
import { invalidateAllSessions } from '$lib/server/session';

/**
 * Updates user profile details (username and email)
 */
export async function updateUserDetails(
	userId: string,
	username: string,
	email: string
): Promise<{ success: boolean; message: string }> {
	try {
		// Check if username is already taken by another user
		const existingUsername = await prisma.user.findUnique({
			where: {
				username,
				NOT: {
					id: userId
				}
			}
		});

		if (existingUsername) {
			return {
				success: false,
				message: 'Username is already taken'
			};
		}

		// Check if email is already taken by another user
		const existingEmail = await prisma.user.findUnique({
			where: {
				email,
				NOT: {
					id: userId
				}
			}
		});

		if (existingEmail) {
			return {
				success: false,
				message: 'Email is already taken'
			};
		}

		// Update the user
		await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				username,
				email
			}
		});

		return {
			success: true,
			message: 'Profile updated successfully'
		};
	} catch (error) {
		console.error('Error updating user details:', error);
		return {
			success: false,
			message: 'Failed to update profile'
		};
	}
}

/**
 * Updates user password
 */
export async function updateUserPassword(
	userId: string,
	currentPassword: string,
	newPassword: string
): Promise<{ success: boolean; message: string }> {
	try {
		// Verify current password
		const isValidPassword = await verifyPassword(userId, currentPassword);

		if (!isValidPassword) {
			return {
				success: false,
				message: 'Current password is incorrect'
			};
		}

		// Hash the new password
		const hasher = new Argon2id();
		const passwordHash = await hasher.hash(newPassword);

		// Update the password
		await prisma.user.update({
			where: {
				id: userId
			},
			data: {
				password_hash: passwordHash
			}
		});

		// Invalidate all sessions for security reasons
		await invalidateAllSessions(userId);

		return {
			success: true,
			message: 'Password updated successfully. Please sign in with your new password.'
		};
	} catch (error) {
		console.error('Error updating user password:', error);
		return {
			success: false,
			message: 'Failed to update password'
		};
	}
}
