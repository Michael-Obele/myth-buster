import { prisma } from './db';

/**
 * Save a community signup to the database
 *
 * @param name User's name
 * @param email User's email
 * @returns The created community signup record
 */
export async function saveCommunitySignup(name: string, email: string) {
	try {
		console.log('Attempting to create community signup:', { name, email });
		const signup = await prisma.communitySignup.create({
			data: {
				name: name,
				email: email
			}
		});

		return { success: true, data: signup };
	} catch (error) {
		// Check if it's a unique constraint violation on email
		if (
			typeof error === 'object' &&
			error !== null &&
			'code' in error &&
			(error as any).code === 'P2002' &&
			'meta' in error &&
			(error as any).meta?.target?.includes('email')
		) {
			return {
				success: false,
				error: 'This email has already been registered for the community.'
			};
		}
		console.error('Error saving community signup:', error);

		return {
			success: false,
			error: 'Failed to register. Please try again later.'
		};
	}
}

/**
 * Get all community signups
 *
 * @returns Array of all community signups
 */
export async function getAllCommunitySignups() {
	try {
		const signups = await prisma.communitySignup.findMany({
			orderBy: { createdAt: 'desc' }
		});

		return { success: true, data: signups };
	} catch (error) {
		console.error('Error fetching community signups:', error);
		return {
			success: false,
			error: 'Failed to fetch community signups.'
		};
	}
}

/**
 * Get the count of community signups
 *
 * @returns Total count of community signups
 */
export async function getCommunitySignupCount() {
	try {
		const count = await prisma.communitySignup.count();

		return { success: true, count };
	} catch (error) {
		console.error('Error fetching community signup count:', error);
		return {
			success: false,
			error: 'Failed to fetch community signup count.',
			count: 0
		};
	}
}
