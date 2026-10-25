import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { AuthService } from '../../core/auth.service';
import { CurriculumService } from '../../core/curriculum.service';
import {
  FIRST_EXAM_DATE,
  daysUntilFirstExam,
  formatDateBR,
  formatDateTimeBR,
  formatLongDateBR,
} from '../../core/dates';
import { formatAccuracy } from '../../core/labels';
import { Area, StatsResponse } from '../../core/models';
import { StatsService } from '../../core/stats.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, Loading, EmptyState],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly statsService = inject(StatsService);
  private readonly curriculumService = inject(CurriculumService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly areas = signal<Area[]>([]);
  protected readonly areasLoading = signal(true);
  protected readonly areasError = signal<string | null>(null);

  protected readonly stats = signal<StatsResponse | null>(null);
  protected readonly statsLoading = signal(true);
  protected readonly statsError = signal<string | null>(null);

  protected readonly daysToExam = daysUntilFirstExam();
  protected readonly examDateLabel = formatLongDateBR('2026-11-08');
  protected readonly examDateShort = formatDateBR('2026-11-08');
  protected readonly firstExamYear = FIRST_EXAM_DATE.getFullYear();
  protected readonly greeting = this.timeGreeting();
  protected readonly firstName = computed(() => {
    const user = this.auth.user();
    const name = user?.display_name?.trim();
    if (name) {
      return name.split(/\s+/)[0];
    }
    return user?.email.split('@')[0] ?? 'estudante';
  });

  protected readonly recentAttempts = computed(
    () => this.stats()?.recent_attempts.slice(0, 5) ?? [],
  );

  ngOnInit(): void {
    this.loadStats();
    this.loadAreas();
  }

  protected loadStats(): void {
    this.statsLoading.set(true);
    this.statsError.set(null);

    this.statsService
      .getMyStats()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.statsLoading.set(false)),
      )
      .subscribe({
        next: (response) => this.stats.set(response),
        error: (error: unknown) => {
          this.statsError.set(
            getApiErrorMessage(error, 'Não foi possível carregar suas estatísticas.'),
          );
        },
      });
  }

  protected loadAreas(): void {
    this.areasLoading.set(true);
    this.areasError.set(null);

    this.curriculumService
      .getAreas()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.areasLoading.set(false)),
      )
      .subscribe({
        next: (response) => this.areas.set(response.areas),
        error: (error: unknown) => {
          this.areasError.set(
            getApiErrorMessage(error, 'Não foi possível carregar as áreas do conhecimento.'),
          );
        },
      });
  }

  protected areaAccent(area: Area): string {
    const color = area.color?.trim();
    return color && /^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(color) ? color : 'var(--forest)';
  }

  protected accuracyLabel(): string {
    return formatAccuracy(this.stats()?.stats.accuracy);
  }

  protected examCountdownLabel(): string {
    if (this.daysToExam < 0) {
      return 'A data da primeira prova já passou';
    }
    if (this.daysToExam === 0) {
      return 'A primeira prova é hoje';
    }
    return this.daysToExam === 1 ? 'dia para a primeira prova' : 'dias para a primeira prova';
  }

  protected displayName(): string {
    return this.firstName();
  }

  protected dateTime(value: string): string {
    return formatDateTimeBR(value);
  }

  private timeGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Bom dia';
    }
    if (hour < 18) {
      return 'Boa tarde';
    }
    return 'Boa noite';
  }
}
