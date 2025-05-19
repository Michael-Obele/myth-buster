import { createUser, getUserByEmail, getUserByUsername } from '$lib/server/user';
import { generateSessionToken, createSession, setSessionTokenCookie } from '$lib/server/session';
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';

// Define the sign-up form schema
const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const load: PageServerLoad = async () => {
  // Create a form using the schema
  const form = await superValidate(zod(signUpSchema));
  
  return {
    form
  };
};

export const actions: Actions = {
  default: async ({ request, locals, cookies }) => {
    // Validate the form data
    const form = await superValidate(request, zod(signUpSchema));
    
    if (!form.valid) {
      return fail(400, { form });
    }
    
    const { username, email, password } = form.data;
    
    // Check if the username is already taken
    const existingUsername = await getUserByUsername(username.toString());
    
    if (existingUsername) {
      form.errors.username = ['Username is already taken'];
      return fail(400, { form });
    }
    
    // Check if the email is already taken
    const existingEmail = await getUserByEmail(email.toString());
    
    if (existingEmail) {
      form.errors.email = ['Email is already registered'];
      return fail(400, { form });
    }
    
    // Create the user
    const { success, user, error } = await createUser(username.toString(), email.toString(), password.toString());
    
    if (!success || !user) {
      console.error('Error creating user:', error);
      return fail(500, { form, message: 'An error occurred while creating your account' });
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
