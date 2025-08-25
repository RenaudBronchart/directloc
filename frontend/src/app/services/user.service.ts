import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../types/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = 'http://localhost:8080/api/users'; // ou juste '/api/users' si tu as un proxy

  constructor(private http: HttpClient) {}

  me(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`);
  }

  // pour plus tard
  updateProfile(body: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API}/me`, body);
  }

  changePassword(body: { currentPassword: string; newPassword: string }) {
    return this.http.put<void>(`${this.API}/me/password`, body);
  }
}
