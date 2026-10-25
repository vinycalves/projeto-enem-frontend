import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAtom,
  lucideBookOpen,
  lucideBookText,
  lucideBrain,
  lucideChevronDown,
  lucideCpu,
  lucideDna,
  lucideDumbbell,
  lucideFeather,
  lucideFileCheck2,
  lucideFlaskConical,
  lucideGlobe2,
  lucideHouse,
  lucideLandmark,
  lucideLanguages,
  lucideLibraryBig,
  lucideMenu,
  lucidePalette,
  lucidePenLine,
  lucideSigma,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';
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
  imports: [RouterLink, RouterLinkActive, NgIcon],
  providers: [
    provideIcons({
      lucideAtom,
      lucideBookOpen,
      lucideBookText,
      lucideBrain,
      lucideChevronDown,
      lucideCpu,
      lucideDna,
      lucideDumbbell,
      lucideFeather,
      lucideFileCheck2,
      lucideFlaskConical,
      lucideGlobe2,
      lucideHouse,
      lucideLandmark,
      lucideLanguages,
      lucideLibraryBig,
      lucideMenu,
      lucidePalette,
      lucidePenLine,
      lucideSigma,
      lucideUsers,
      lucideX,
    }),
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header implements OnDestroy {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private closeStudyTimer?: ReturnType<typeof setTimeout>;

  protected readonly menuOpen = signal(false);
  protected readonly studyMenuOpen = signal(false);
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
    this.closeStudyMenu();
  }

  protected openStudyMenu(): void {
    if (this.closeStudyTimer) {
      clearTimeout(this.closeStudyTimer);
      this.closeStudyTimer = undefined;
    }
    this.studyMenuOpen.set(true);
  }

  protected scheduleStudyMenuClose(): void {
    if (this.closeStudyTimer) {
      clearTimeout(this.closeStudyTimer);
    }
    this.closeStudyTimer = setTimeout(() => {
      this.studyMenuOpen.set(false);
      this.closeStudyTimer = undefined;
    }, 450);
  }

  protected cancelStudyMenuClose(): void {
    if (this.closeStudyTimer) {
      clearTimeout(this.closeStudyTimer);
      this.closeStudyTimer = undefined;
    }
    this.studyMenuOpen.set(true);
  }

  protected closeStudyMenu(): void {
    if (this.closeStudyTimer) {
      clearTimeout(this.closeStudyTimer);
      this.closeStudyTimer = undefined;
    }
    this.studyMenuOpen.set(false);
  }

  ngOnDestroy(): void {
    if (this.closeStudyTimer) {
      clearTimeout(this.closeStudyTimer);
    }
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
