// DTOs alineados con tu backend

export type PhoneVisibility = 'NEVER' | 'AFTER_ACCEPT' | 'ALWAYS_FOR_HOSTS';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface ProfileDto {
  // Identidad
  email?: string | null;
  avatarUrl?: string | null;

  /** Back-end read DTO returns these two: */
  firstName?: string | null;
  lastName?: string | null;

  // Nombre "plano" que devuelve el backend (mapper join de first/last)
  fullName?: string | null;

  // Teléfono
  phone?: string | null;
  phoneCountry?: string | null;     // ISO-2 (ES, FR, ...), opcional
  phoneVisibility?: PhoneVisibility;

  // Datos personales
  gender?: Gender | null;
  nationality?: string | null;      // ISO-2
  dateOfBirth?: string | null;      // "yyyy-MM-dd"

  // Preferencias
  locale?: string | null;
  timezone?: string | null;

  // Flags
  wantsToHost?: boolean | null;
}
