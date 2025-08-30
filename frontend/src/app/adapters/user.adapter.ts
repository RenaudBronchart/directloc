// Converts backend DTOs <-> UI models in a single place.
// Keep all transformations and fallbacks here.

import {
  UserDto,
  UserProfileDto,
  PhoneVisibilityDto,
} from '../dto/user.dto';
import {
  User,
  UserProfile,
  PhoneVisibility,
} from '../models/user.model';

function mapPhoneVisibility(v: PhoneVisibilityDto | undefined): PhoneVisibility | undefined {
  // Defensive conversion (in case backend evolves)
  if (!v) return undefined;
  if (v === 'NEVER' || v === 'AFTER_ACCEPT' || v === 'ALWAYS_FOR_HOSTS') return v;
  return undefined;
}

export const userAdapter = {
  /** Map /api/auth/me → User (UI model). */
  toModel(dto: UserDto): User {
    return {
      id: dto.id,
      email: dto.email,
      role: dto.role, // same union type
    };
    // If you ever need computed fields (e.g., displayName) add them here.
  },

  /** Map /api/profile (GET/PUT) → UserProfile (UI model). */
  profileToModel(dto: UserProfileDto): UserProfile {
    return {
      id: dto.id,
      firstName: dto.firstName ?? null,
      lastName: dto.lastName ?? null,
      phone: dto.phone ?? null,
      phoneVisibility: mapPhoneVisibility(dto.phoneVisibility),
      avatarUrl: dto.avatarUrl ?? null,
      locale: dto.locale ?? null,
      timezone: dto.timezone ?? null,
      marketingOptIn: dto.marketingOptIn ?? null,
    };
  },
};
