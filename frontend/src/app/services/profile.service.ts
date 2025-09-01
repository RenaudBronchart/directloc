import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProfileDto } from '../dto/profile.dto';

const API = `${environment.apiBase}api/profile`;

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  /** GET /api/profile */
  get(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(API);
  }

  /**
   * PUT /api/profile
   * Acepta CUALQUIER subconjunto de campos soportados por tu UpdateProfileDto en el backend.
   * (fullName, phone, phoneCountry, phoneVisibility, gender, nationality, dateOfBirth, locale, timezone, wantsToHost)
   */
  update(data: Partial<ProfileDto>): Observable<ProfileDto> {
    // Enviamos sólo las claves definidas
    const payload: any = {};
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) payload[k] = v;
    });
    return this.http.put<ProfileDto>(API, payload);
  }

  /** POST /api/profile/avatar → normalizamos a string (URL final) */
  uploadAvatar(file: File): Observable<string> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<any>(`${API}/avatar`, fd).pipe(
      map(res => typeof res === 'string' ? res : (res?.avatarUrl ?? ''))
    );
  }
}
