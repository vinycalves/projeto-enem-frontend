import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { AuthResponse, Credentials, User } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUser = signal<User | null>(null);
  private sessionChecked = false;
  private pendingSession$: Observable<User | null> | null = null;

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /**
   * Restores the cookie-based session once per app lifetime. A 401 simply means
   * "visitor"; any other failure is also treated as a signed-out state so the
   * app remains usable if the API is temporarily unavailable.
   */
  ensureSession(): Observable<User | null> {
    if (this.sessionChecked) {
      return of(this.currentUser());
    }

    if (this.pendingSession$) {
      return this.pendingSession$;
    }

    this.pendingSession$ = this.http.get<AuthResponse>('/api/v1/auth/me').pipe(
      map((response) => response.user),
      tap((user) => this.currentUser.set(user)),
      catchError((_error: unknown) => {
        this.currentUser.set(null);
        return of(null);
      }),
      finalize(() => {
        this.sessionChecked = true;
        this.pendingSession$ = null;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.pendingSession$;
  }

  login(credentials: Credentials): Observable<User> {
    return this.http.post<AuthResponse>('/api/v1/auth/login', credentials).pipe(
      map((response) => response.user),
      tap((user) => this.setUser(user)),
    );
  }

  register(credentials: Credentials): Observable<User> {
    return this.http.post<AuthResponse>('/api/v1/auth/register', credentials).pipe(
      map((response) => response.user),
      tap((user) => this.setUser(user)),
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/v1/auth/logout', null).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.sessionChecked = true;
      }),
    );
  }

  private setUser(user: User): void {
    this.currentUser.set(user);
    this.sessionChecked = true;
  }
}
