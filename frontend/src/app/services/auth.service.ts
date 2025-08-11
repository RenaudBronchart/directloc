// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

export interface User {
  id: number;
  email: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
}

interface AuthResponse {
  token: string;
}
interface LoginRequest {
  email: string;
  password: string;
}
interface RegisterRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8080';
  private user$ = new BehaviorSubject<User | null>(null);
  private loadingUser = false; // évite les doublons d’appel /users/me

  constructor(private http: HttpClient) {
    this.restoreFromStorage();
  }

// === Auth API ===
  register(data: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API}/auth/register`, data).pipe(
        tap(res => this.saveToken(res.token)),                  // 1) stocke le JWT
        switchMap(() => this.http.get<User>(`${this.API}/users/me`)), // 2) récupère le profil
        tap(user => this.user$.next(user))                      // 3) hydrate l'état courant
    );
  }

  login(data: LoginRequest): Observable<User> {
    return this.http
        .post<AuthResponse>(`${this.API}/auth/login`, data)
        .pipe(
            tap((res) => this.saveToken(res.token)),
            switchMap(() => this.http.get<User>(`${this.API}/users/me`)),
            tap((u) => this.user$.next(u))
        );
  }

  // === Token & session ===
  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.user$.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const payload = this.decodeJwt<any>(token);
    return !!payload?.exp && Date.now() / 1000 < payload.exp;
  }

  get currentUser(): User | null {
    return this.user$.value;
  }

  currentUser$(): Observable<User | null> {
    return this.user$.asObservable();
  }

  // === Helpers ===
  private restoreFromStorage() {
    const token = this.getToken();
    if (!token || !this.isAuthenticated() || this.loadingUser) return;

    this.loadingUser = true;
    this.http.get<User>(`${this.API}/users/me`).subscribe({
      next: (u) => {
        this.user$.next(u);
        this.loadingUser = false;
      },
      error: () => {
        this.logout();
        this.loadingUser = false;
      },
    });
  }

  private decodeJwt<T>(token: string): T | null {
    try {
      const base64 = token.split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/');
      const json = decodeURIComponent(
          atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }
}
