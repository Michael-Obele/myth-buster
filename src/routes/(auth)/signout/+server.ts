import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const { locals, cookies } = event;
  if (locals.session) {
    await invalidateSession(locals.session.id);
    deleteSessionTokenCookie(event);
    locals.user = null;
    locals.session = null;
  }
  
  throw redirect(303, '/signin');
};
