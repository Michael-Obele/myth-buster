// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User, Session, UserResearchActivity } from '@prisma/client';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
		interface PageData {
			userResearchActivities?: UserResearchActivity[];
		}
		// interface Error {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
