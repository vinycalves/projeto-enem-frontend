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
import { Subscription, finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { CurriculumService } from '../../core/curriculum.service';
import { difficultyLabel, difficultyTone } from '../../core/labels';
import { Area, ConceptListItem, Id, Subject } from '../../core/models';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-study-page',
  imports: [RouterLink, Loading, EmptyState],
  templateUrl: './study-page.html',
  styleUrl: './study-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudyPage implements OnInit {
  private readonly curriculum = inject(CurriculumService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly areas = signal<Area[]>([]);
  protected readonly areasLoading = signal(true);
  protected readonly areasError = signal<string | null>(null);

  protected readonly selectedAreaId = signal<Id | null>(null);
  protected readonly selectedSubjectId = signal<Id | null>(null);

  protected readonly concepts = signal<ConceptListItem[]>([]);
  protected readonly conceptsLoading = signal(false);
  protected readonly conceptsError = signal<string | null>(null);

  protected readonly selectedArea = computed(
    () => this.areas().find((area) => area.id === this.selectedAreaId()) ?? null,
  );
  protected readonly subjects = computed(() => this.selectedArea()?.subjects ?? []);
  protected readonly selectedSubject = computed(
    () => this.subjects().find((subject) => subject.id === this.selectedSubjectId()) ?? null,
  );

  private areaParam: string | null = null;
  private subjectParam: string | null = null;
  private conceptsRequest: Subscription | null = null;

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.areaParam = params.get('area');
      this.subjectParam = params.get('subject');
      this.applyQueryParams();
    });

    this.loadAreas();
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

  protected loadConcepts(subjectId: Id): void {
    this.conceptsRequest?.unsubscribe();
    this.conceptsLoading.set(true);
    this.conceptsError.set(null);
    this.concepts.set([]);

    this.conceptsRequest = this.curriculum
      .getSubjectConcepts(subjectId)
      .pipe(finalize(() => this.conceptsLoading.set(false)))
      .subscribe({
        next: (response) => {
          if (String(this.selectedSubjectId()) !== String(subjectId)) {
            return;
          }
          this.concepts.set(response.concepts);
        },
        error: (error: unknown) => {
          if (String(this.selectedSubjectId()) !== String(subjectId)) {
            return;
          }
          this.conceptsError.set(
            getApiErrorMessage(error, 'Não foi possível carregar os conceitos desta disciplina.'),
          );
        },
      });
  }

  protected retryConcepts(): void {
    const subjectId = this.selectedSubjectId();
    if (subjectId !== null) {
      this.loadConcepts(subjectId);
    }
  }

  protected areaAccent(area: Area): string {
    const color = area.color?.trim();
    return color && /^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(color) ? color : 'var(--forest)';
  }

  protected subjectAccent(area: Area | null): string {
    return area ? this.areaAccent(area) : 'var(--forest)';
  }

  protected queryForArea(area: Area): { area: Id } {
    return { area: area.id };
  }

  protected queryForSubject(subject: Subject): { area: Id | null; subject: Id } {
    return { area: this.selectedAreaId(), subject: subject.id };
  }

  protected conceptCountLabel(count: number): string {
    return count === 1 ? '1 conceito' : `${count} conceitos`;
  }

  protected questionCountLabel(count: number): string {
    return count === 1 ? '1 questão' : `${count} questões`;
  }

  protected difficulty(value: string): string {
    return difficultyLabel(value);
  }

  protected difficultyClass(value: string): string {
    return `difficulty difficulty--${difficultyTone(value)}`;
  }

  private applyQueryParams(): void {
    if (this.areas().length === 0) {
      return;
    }

    const area =
      this.areas().find(
        (candidate) => String(candidate.id) === this.areaParam || candidate.code === this.areaParam,
      ) ?? this.areas()[0];

    this.selectedAreaId.set(area.id);

    const subject =
      area.subjects.find(
        (candidate) =>
          String(candidate.id) === this.subjectParam || candidate.code === this.subjectParam,
      ) ?? null;

    this.selectedSubjectId.set(subject?.id ?? null);

    if (!subject) {
      this.conceptsRequest?.unsubscribe();
      this.conceptsRequest = null;
      this.concepts.set([]);
      this.conceptsError.set(null);
      this.conceptsLoading.set(false);
      return;
    }

    this.loadConcepts(subject.id);
  }
}
