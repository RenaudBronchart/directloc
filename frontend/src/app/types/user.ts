export type Role = 'USER' | 'OWNER' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  role: Role;

  // champs futurs (optionnels, n’impactent pas le build si absents côté back)
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
