import { getUserByUsername, verifyPassword } from '$lib/server/user';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

// Define the sign-in form schema
const signInSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export const load: PageServerLoad = async () => {
  // Create a form using the schema
  const form = await superValidate(zod(signInSchema));
  
  return {
    form
  };
};

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    // Validate the form data
    const form = await superValidate(request, zod(signInSchema));
    
    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { username, password } = form.data;
    
    // Find the user by username
    const user = await getUserByUsername(username.toString());
    
    if (!user) {
      form.errors.username = ['Invalid username or password'];
      return fail(400, { form });
    }
    
    // Verify the password
    const validPassword = await verifyPassword(user.id, password.toString());
    
    if (!validPassword) {
      form.errors.password = ['Invalid username or password'];
      return fail(400, { form });
    }
    
    // Generate a session token and create a session
    const token = generateSessionToken();
    const session = await createSession(token, user.id);
    
    // Set the session cookie
    setSessionTokenCookie({ cookies } as any, token, session.expiresAt);
    
    // Set the user and session in locals
    locals.user = user;
    locals.session = session;
    
    // Redirect to the app
    throw redirect(303, '/app');
  }
};
