// Front-end UI models (simple, framework-friendly, no backend annotations)

/** Platform roles (RBAC). Domain roles like "host/guest" are contextual. */
export type Role = 'USER' | 'ADMIN';

/** Minimal user identity returned by /api/auth/me */
export interface User {
  id: number;
  email: string;
  role: Role;
}

/** Phone visibility policy mirrored from backend enum */
export type PhoneVisibility = 'NEVER' | 'AFTER_ACCEPT' | 'ALWAYS_FOR_HOSTS';

/**
 * User profile fields you can show/edit in settings.
 * NOTE: `id` equals the User.id (1:1 profile per user).
 */
export interface UserProfile {
  id: number;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  phoneVisibility?: PhoneVisibility; // backend requires a value; server should return one
  avatarUrl?: string | null;
  locale?: string | null;
  timezone?: string | null;
  marketingOptIn?: boolean | null;
}
