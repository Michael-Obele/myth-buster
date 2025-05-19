import { Argon2id } from 'oslo/password';
import { encodeHexLowerCase } from '@oslojs/encoding';
import type { User } from '$lib/server/types';
import { prisma } from '$lib/server/db';


export async function createUser(username: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: any }> {
  try {
    // Generate a unique ID for the user
    const bytes = new Uint8Array(15);
    crypto.getRandomValues(bytes);
    const userId = encodeHexLowerCase(bytes);

    // Hash the password
    const hasher = new Argon2id();
    const passwordHash = await hasher.hash(password);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        password_hash: passwordHash
      }
    });

    return { success: true, user };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error };
  }
}

export async function verifyPassword(userId: string, password: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        password_hash: true
      }
    });

    if (!user) {
      return false;
    }

    const hasher = new Argon2id();
    return await hasher.verify(user.password_hash, password);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      username
    }
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      email
    }
  });
}
