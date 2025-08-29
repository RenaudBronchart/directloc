// Raw backend DTOs (mirror server fields exactly)

export type RoleDto = 'USER' | 'ADMIN';
export type PhoneVisibilityDto = 'NEVER' | 'AFTER_ACCEPT' | 'ALWAYS_FOR_HOSTS';

export interface UserDto {
  id: number;
  email: string;
  role: RoleDto;
}

export interface UserProfileDto {
  id: number; // same as user id
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  phoneVisibility: PhoneVisibilityDto; // backend column is NOT NULL
  avatarUrl?: string | null;
  locale?: string | null;
  timezone?: string | null;
  marketingOptIn?: boolean | null;
}

/**
 * Payload accepted by PUT /api/profile.
 * Keep keys optional so the form can send partial updates if your API supports it.
 * If your backend requires all fields, make them required here.
 */
export interface UpdateProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  phoneVisibility?: PhoneVisibilityDto;
  avatarUrl?: string | null;
  locale?: string | null;
  timezone?: string | null;
  marketingOptIn?: boolean | null;
}
