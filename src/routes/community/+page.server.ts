import { getCommunitySignupCount } from '$lib/server/community';

export async function load() {
	const result = await getCommunitySignupCount();

	return {
		signupCount: result.success ? result.count : 0,
		error: result.success ? null : result.error
	};
}
