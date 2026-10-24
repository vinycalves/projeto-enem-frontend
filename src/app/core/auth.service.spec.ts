import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { User } from './models';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  const user: User = {
    id: 1,
    email: 'estudante@example.com',
    display_name: 'Estudante',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('logs in with e-mail and password and stores the returned user', () => {
    let received: User | undefined;

    service.login({ email: 'estudante@example.com', password: 'senha12345' }).subscribe({
      next: (result) => (received = result),
    });

    const request = http.expectOne('/api/v1/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'estudante@example.com',
      password: 'senha12345',
    });

    request.flush({ user });

    expect(received).toEqual(user);
    expect(service.user()).toEqual(user);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('restores the cookie session through GET /auth/me', () => {
    let received: User | null | undefined;

    service.ensureSession().subscribe((result) => (received = result));

    const request = http.expectOne('/api/v1/auth/me');
    expect(request.request.method).toBe('GET');
    request.flush({ user });

    expect(received).toEqual(user);
    expect(service.user()).toEqual(user);
  });

  it('treats a 401 from /auth/me as a signed-out visitor', () => {
    let received: User | null | undefined;

    service.ensureSession().subscribe((result) => (received = result));

    http
      .expectOne('/api/v1/auth/me')
      .flush(
        { error: { code: 'unauthorized', message: 'Sessão inválida.' } },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(received).toBeNull();
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('logs out and clears the local user', () => {
    service.ensureSession().subscribe();
    http.expectOne('/api/v1/auth/me').flush({ user });

    let completed = false;
    service.logout().subscribe({ next: () => (completed = true) });

    const request = http.expectOne('/api/v1/auth/logout');
    expect(request.request.method).toBe('POST');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
