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
import { difficultyLabel, difficultyTone } from '../../core/labels';
import { ConceptDetail, Id, QuestionListItem } from '../../core/models';
import { QuestionService } from '../../core/question.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Loading } from '../../shared/loading/loading';

interface PrerequisiteView {
  name: string;
  summary?: string;
}

@Component({
  selector: 'app-concept-page',
  imports: [RouterLink, Loading, EmptyState],
  templateUrl: './concept-page.html',
  styleUrl: './concept-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConceptPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly curriculum = inject(CurriculumService);
  private readonly questionService = inject(QuestionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly concept = signal<ConceptDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly questions = signal<QuestionListItem[]>([]);
  protected readonly questionsLoading = signal(true);
  protected readonly questionsError = signal<string | null>(null);

  protected readonly practiceQuestion = computed(() => {
    const questions = this.questions();
    return questions.find((question) => !question.has_attempted) ?? questions[0] ?? null;
  });

  protected readonly prerequisites = computed<PrerequisiteView[]>(() => {
    const raw = this.concept()?.prerequisites;
    if (!raw) {
      return [];
    }

    return raw.map((item) =>
      typeof item === 'string' ? { name: item } : { name: item.name, summary: item.summary },
    );
  });

  private currentId: Id | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.loading.set(false);
        this.error.set('Não foi possível identificar este conceito.');
        return;
      }
      this.currentId = id;
      this.load(id);
    });
  }

  protected retry(): void {
    if (this.currentId !== null) {
      this.load(this.currentId);
    }
  }

  protected loadQuestions(conceptId: Id): void {
    this.questionsLoading.set(true);
    this.questionsError.set(null);

    this.questionService
      .getQuestions(conceptId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.questionsLoading.set(false)),
      )
      .subscribe({
        next: (response) => this.questions.set(response.questions),
        error: (error: unknown) => {
          this.questionsError.set(
            getApiErrorMessage(error, 'Não foi possível carregar as questões deste conceito.'),
          );
        },
      });
  }

  protected difficulty(value: string): string {
    return difficultyLabel(value);
  }

  protected difficultyClass(value: string): string {
    return `difficulty difficulty--${difficultyTone(value)}`;
  }

  protected questionCountLabel(count: number): string {
    return count === 1 ? '1 questão' : `${count} questões`;
  }

  protected attemptLabel(question: QuestionListItem): string {
    if (!question.has_attempted) {
      return 'Ainda não respondida';
    }
    return question.last_attempt_is_correct
      ? 'Acertou na última tentativa'
      : 'Errou na última tentativa';
  }

  private load(id: Id): void {
    this.loading.set(true);
    this.error.set(null);
    this.concept.set(null);

    this.curriculum
      .getConcept(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => this.concept.set(response.concept),
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error, 'Não foi possível carregar este conceito.'));
        },
      });

    this.loadQuestions(id);
  }
}
