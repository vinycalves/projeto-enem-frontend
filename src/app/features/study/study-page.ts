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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { CurriculumService } from '../../core/curriculum.service';
import { ExamService } from '../../core/exam.service';
import { Area, Exam, Id, Subject } from '../../core/models';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Loading } from '../../shared/loading/loading';

const GUIDE_BY_SUBJECT: Record<string, string> = {
  portugues: 'portugues',
  ingles: 'lingua-estrangeira',
  espanhol: 'lingua-estrangeira',
  artes: 'artes',
  'educacao-fisica': 'educacao-fisica',
  historia: 'historia',
  geografia: 'geografia',
  filosofia: 'filosofia',
  sociologia: 'sociologia',
  biologia: 'biologia',
  fisica: 'fisica',
  quimica: 'quimica',
  matematica: 'matematica',
};

@Component({
  selector: 'app-study-page',
  imports: [RouterLink, Loading, EmptyState],
  templateUrl: './study-page.html',
  styleUrl: './study-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyPage implements OnInit {
  private readonly curriculum = inject(CurriculumService);
  private readonly examService = inject(ExamService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly areas = signal<Area[]>([]);
  protected readonly areasLoading = signal(true);
  protected readonly areasError = signal<string | null>(null);
  protected readonly selectedAreaId = signal<Id | null>(null);

  protected readonly exams = signal<Exam[]>([]);
  protected readonly examsLoading = signal(true);
  protected readonly examsError = signal<string | null>(null);

  protected readonly selectedArea = computed(
    () => this.areas().find((area) => area.id === this.selectedAreaId()) ?? null,
  );
  protected readonly subjects = computed(() => this.selectedArea()?.subjects ?? []);
  protected readonly areaExams = computed(() => {
    const area = this.selectedArea();
    if (!area) {
      return [];
    }
    return this.exams()
      .filter((exam) => exam.area_code === area.code)
      .sort((a, b) => b.year - a.year);
  });

  private areaParam: string | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.areaParam = params.get('area');
      this.applyQueryParams();
    });

    this.loadAreas();
    this.loadExams();
  }

  protected loadAreas(): void {
    this.areasLoading.set(true);
    this.areasError.set(null);

    this.curriculum
      .getAreas()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.areasLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.areas.set(response.areas);
          this.applyQueryParams();
        },
        error: (error: unknown) => {
          this.areasError.set(getApiErrorMessage(error, 'Não foi possível carregar o currículo.'));
        },
      });
  }

  protected loadExams(): void {
    this.examsLoading.set(true);
    this.examsError.set(null);

    this.examService
      .getExams()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.examsLoading.set(false)),
      )
      .subscribe({
        next: ({ exams }) => this.exams.set(exams),
        error: (error: unknown) => {
          this.examsError.set(
            getApiErrorMessage(error, 'Não foi possível carregar as provas oficiais.'),
          );
        },
      });
  }

  protected areaAccent(area: Area): string {
    const color = area.color?.trim();
    return color && /^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(color) ? color : 'var(--forest)';
  }

  protected queryForArea(area: Area): { area: Id } {
    return { area: area.id };
  }

  protected guideSlug(subject: Subject): string {
    return GUIDE_BY_SUBJECT[subject.code] ?? 'indice';
  }

  protected questionCountLabel(count: number): string {
    return count === 1 ? '1 questão oficial' : `${count} questões oficiais`;
  }

  private applyQueryParams(): void {
    if (this.areas().length === 0) {
      return;
    }
    const area =
      this.areas().find(
        (candidate) =>
          String(candidate.id) === this.areaParam || candidate.code === this.areaParam,
      ) ?? this.areas()[0];
    this.selectedAreaId.set(area.id);
  }
}
