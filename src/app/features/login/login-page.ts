import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage, getApiErrorStatus } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { Credentials } from '../../core/models';

type AuthTab = 'login' | 'register';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly tab = signal<AuthTab>('login');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected selectTab(tab: AuthTab): void {
    if (this.submitting()) {
      return;
    }
    this.tab.set(tab);
    this.error.set(null);
  }

  protected onTabKeydown(event: KeyboardEvent, current: AuthTab): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const next: AuthTab = current === 'login' ? 'register' : 'login';
    this.selectTab(next);

    const container = (event.currentTarget as HTMLElement).parentElement;
    container?.querySelector<HTMLButtonElement>(`#tab-${next}`)?.focus();
  }

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authenticate(this.loginForm.getRawValue(), 'login');
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authenticate(this.registerForm.getRawValue(), 'register');
  }

  private authenticate(credentials: Credentials, mode: AuthTab): void {
    if (this.submitting()) {
      return;
    }

    const payload: Credentials = {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    };

    this.submitting.set(true);
    this.error.set(null);

    const request$ = mode === 'login' ? this.auth.login(payload) : this.auth.register(payload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: () => {
        void this.router.navigateByUrl(this.returnUrl());
      },
      error: (error: unknown) => {
        this.error.set(this.authErrorMessage(error, mode));
      },
    });
  }

  private authErrorMessage(error: unknown, mode: AuthTab): string {
    const status = getApiErrorStatus(error);

    if (mode === 'login' && status === 401) {
      return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
    }

    if (mode === 'register' && status === 409) {
      return 'Já existe uma conta com este e-mail. Tente entrar em vez de criar uma nova conta.';
    }

    return getApiErrorMessage(
      error,
      mode === 'login'
        ? 'Não foi possível entrar agora. Tente novamente.'
        : 'Não foi possível criar sua conta agora. Tente novamente.',
    );
  }

  private returnUrl(): string {
    const raw = this.route.snapshot.queryParamMap.get('returnUrl');
    return raw && raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  }
}
