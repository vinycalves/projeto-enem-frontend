import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { Credentials, User } from '../../core/models';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let root: HTMLElement;
  let router: Router;

  const user: User = {
    id: 1,
    email: 'aluno@example.com',
    display_name: 'Aluno',
  };

  const authMock = {
    login: vi.fn((_credentials: Credentials) => of(user)),
    register: vi.fn((_credentials: Credentials) => of(user)),
  };

  beforeEach(async () => {
    authMock.login.mockReset();
    authMock.login.mockImplementation(() => of(user));
    authMock.register.mockReset();
    authMock.register.mockImplementation(() => of(user));

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginPage);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function fill(selector: string, value: string): void {
    const input = root.querySelector<HTMLInputElement>(selector);
    expect(input).toBeTruthy();
    input!.value = value;
    input!.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function submitLogin(): HTMLButtonElement {
    const button = root.querySelector<HTMLButtonElement>('#panel-login button[type="submit"]');
    expect(button).toBeTruthy();
    return button!;
  }

  it('shows validation messages and does not call the API for invalid data', () => {
    fill('#login-email', 'email-invalido');
    fill('#login-password', '123');
    fixture.detectChanges();

    submitLogin().click();
    fixture.detectChanges();

    expect(authMock.login).not.toHaveBeenCalled();
    const errors = Array.from(root.querySelectorAll('#panel-login .field-error')).map((element) =>
      element.textContent?.trim(),
    );
    expect(errors).toContain('Digite um e-mail válido, como voce@exemplo.com.');
    expect(errors).toContain('A senha precisa ter pelo menos 8 caracteres.');
  });

  it('submits valid credentials and navigates to the return URL', async () => {
    fill('#login-email', 'aluno@example.com');
    fill('#login-password', 'senha12345');
    fixture.detectChanges();

    submitLogin().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(authMock.login).toHaveBeenCalledWith({
      email: 'aluno@example.com',
      password: 'senha12345',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows a clear API error when the credentials are rejected', async () => {
    authMock.login.mockImplementation(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { error: { code: 'invalid_credentials', message: 'Inválido.' } },
          }),
      ),
    );

    fill('#login-email', 'aluno@example.com');
    fill('#login-password', 'senhaerrada');
    fixture.detectChanges();

    submitLogin().click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const alert = root.querySelector('#panel-login .alert--error');
    expect(alert?.textContent).toContain('E-mail ou senha incorretos.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
