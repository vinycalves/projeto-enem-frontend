import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { GUIDE_META, GuideArea } from '../../features/guides/guide-meta';

interface StudyMenuGroup {
  label: string;
  area: GuideArea;
  items: typeof GUIDE_META;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);
  protected readonly signingOut = signal(false);
  protected readonly logoutError = signal<string | null>(null);

  private readonly menuAreas: Array<{ label: string; area: GuideArea }> = [
    { label: 'Matemática', area: 'matematica' },
    { label: 'Ciências da Natureza', area: 'natureza' },
    { label: 'Ciências Humanas', area: 'humanas' },
    { label: 'Linguagens', area: 'linguagens' },
    { label: 'Redação', area: 'redacao' },
  ];

  protected readonly studyGroups: StudyMenuGroup[] = this.menuAreas.map((group) => ({
    ...group,
    items: GUIDE_META.filter((guide) => guide.area === group.area),
  }));

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected firstName(displayName: string, email: string): string {
    const name = displayName.trim();
    if (name.length > 0) {
      return name.split(/\s+/)[0];
    }
    return email.split('@')[0] ?? 'estudante';
  }

  protected signOut(): void {
    if (this.signingOut()) {
      return;
    }

    this.signingOut.set(true);
    this.logoutError.set(null);

    this.auth
      .logout()
      .pipe(finalize(() => this.signingOut.set(false)))
      .subscribe({
        next: () => {
          this.closeMenu();
          void this.router.navigate(['/']);
        },
        error: (error: unknown) => {
          this.logoutError.set(
            getApiErrorMessage(error, 'Não foi possível sair agora. Tente novamente.'),
          );
        },
      });
  }
}
