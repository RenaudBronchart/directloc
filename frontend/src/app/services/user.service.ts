import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// DTOs (wire format from/to backend)
import { UserDto, UserProfileDto, UpdateProfileRequest } from '../dto/user.dto';
// UI models
import { User, UserProfile } from '../models/user.model';
// Mapping backend DTOs -> UI models
import { userAdapter } from '../adapters/user.adapter';

@Injectable({ providedIn: 'root' })
export class UserService {
  // Keep these in one place; switch to environment files when needed
  private readonly API_AUTH = 'http://localhost:8080/api/auth';
  private readonly API_PROFILE = 'http://localhost:8080/api/profile';

  constructor(private http: HttpClient) {}

  /** Current authenticated user (/api/auth/me). */
  me(): Observable<User> {
    return this.http
      .get<UserDto>(`${this.API_AUTH}/me`)
      .pipe(map(userAdapter.toModel));
  }

  /** Read profile (/api/profile). */
  getProfile(): Observable<UserProfile> {
    return this.http
      .get<UserProfileDto>(this.API_PROFILE)
      .pipe(map(userAdapter.profileToModel));
  }

  /**
   * Update profile (PUT /api/profile).
   * Send only the fields the backend accepts (see UpdateProfileRequest).
   */
  updateProfile(body: UpdateProfileRequest): Observable<UserProfile> {
    return this.http
      .put<UserProfileDto>(this.API_PROFILE, body)
      .pipe(map(userAdapter.profileToModel));
  }

  // Future extensions
  // changePassword(...)
  // updateEmail(...)
}
