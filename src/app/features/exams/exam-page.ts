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

@Component({
  selector: 'app-exam-page',
  imports: [RouterLink, Loading, EmptyState],
  templateUrl: './exam-page.html',
  styleUrl: './exam-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly curriculum = inject(CurriculumService);
  private readonly questionService = inject(QuestionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly exam = signal<ConceptDetail | null>(null);
  protected readonly questions = signal<QuestionListItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly firstUnanswered = computed(
    () => this.questions().find((question) => !question.has_attempted) ?? this.questions()[0] ?? null,
  );

  private currentId: Id | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.loading.set(false);
        this.error.set('Não foi possível identificar esta prova.');
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

  protected difficulty(value: string): string {
    return difficultyLabel(value);
  }

  protected difficultyClass(value: string): string {
    return `difficulty difficulty--${difficultyTone(value)}`;
  }

  protected languageLabel(question: QuestionListItem): string {
    if (question.language === 'ingles') {
      return 'Inglês';
    }
    if (question.language === 'espanhol') {
      return 'Espanhol';
    }
    return '';
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
    this.exam.set(null);
    this.questions.set([]);

    this.curriculum
      .getConcept(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ concept }) => this.exam.set(concept),
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error, 'Não foi possível carregar esta prova.'));
        },
      });

    this.questionService
      .getQuestions(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ questions }) => this.questions.set(questions),
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error, 'Não foi possível carregar as questões.'));
        },
      });
  }
}
