// Define user type based on our database schema
export type DatabaseUser = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
};

// Define the session type
export type DatabaseSession = {
  id: string;
  userId: string;
  expiresAt: Date;
  user?: DatabaseUser;
};

// Define the Prisma User and Session types
export type User = {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  sessions?: Session[];
};

export type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  user?: User;
};
export type UserSession = {
  user: User | null;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  } | null;
};

// Define the auth form types
export type SignInForm = {
  username: string;
  password: string;
};

export type SignUpForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type PasswordResetForm = {
  email: string;
};

export type PasswordUpdateForm = {
  password: string;
  confirmPassword: string;
};
