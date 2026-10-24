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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage, getApiErrorStatus } from '../../core/api-error';
import { formatDateTimeBR } from '../../core/dates';
import { difficultyLabel, difficultyTone } from '../../core/labels';
import { Answer, Attempt, Comment, Discussion, Id, QuestionDetail } from '../../core/models';
import { QuestionService } from '../../core/question.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Loading } from '../../shared/loading/loading';

interface CommentGroup {
  label: string | null;
  title: string;
  comments: Comment[];
}

const REPORT_REASONS = [
  'Conteúdo ofensivo',
  'Spam ou repetição',
  'Informação incorreta',
  'Outro motivo',
] as const;

@Component({
  selector: 'app-question-page',
  imports: [ReactiveFormsModule, RouterLink, Loading, EmptyState],
  templateUrl: './question-page.html',
  styleUrl: './question-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly questionService = inject(QuestionService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly question = signal<QuestionDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly selectedOption = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly attempt = signal<Attempt | null>(null);
  protected readonly attemptError = signal<string | null>(null);

  protected readonly discussion = signal<Discussion | null>(null);
  protected readonly discussionLoading = signal(false);
  protected readonly discussionError = signal<string | null>(null);

  protected readonly answer = signal<Answer | null>(null);
  protected readonly revealing = signal(false);
  protected readonly revealError = signal<string | null>(null);

  protected readonly commentForm = this.fb.group({
    body: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]],
    option_label: [''],
  });
  protected readonly commentSubmitting = signal(false);
  protected readonly commentError = signal<string | null>(null);
  protected readonly commentSuccess = signal<string | null>(null);

  protected readonly reportingId = signal<Id | null>(null);
  protected readonly reportReason = signal<string>(REPORT_REASONS[0]);
  protected readonly reportedIds = signal<ReadonlySet<Id>>(new Set<Id>());
  protected readonly reportError = signal<string | null>(null);
  protected readonly reportSuccess = signal<string | null>(null);

  protected readonly reportReasons = REPORT_REASONS;
  protected readonly optionsLocked = computed(() => this.attempt() !== null);
  protected readonly hasAttempted = computed(
    () => this.question()?.has_attempted === true || this.attempt() !== null,
  );
  protected readonly comments = computed(() => this.discussion()?.comments ?? []);
  protected readonly commentGroups = computed<CommentGroup[]>(() => {
    const comments = this.comments();
    const optionLabels = this.question()?.options.map((option) => option.label) ?? [];
    const knownLabels = new Set(optionLabels);
    const extraLabels = comments
      .map((comment) => comment.option_label)
      .filter((label): label is string => typeof label === 'string' && !knownLabels.has(label));

    const orderedLabels = [
      ...optionLabels.sort((a, b) => a.localeCompare(b, 'pt-BR')),
      ...[...new Set(extraLabels)].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    ];

    const buckets = new Map<string | null, Comment[]>();
    buckets.set(null, []);

    for (const comment of comments) {
      const key = comment.option_label;
      if (!buckets.has(key)) {
        buckets.set(key, []);
      }
      buckets.get(key)?.push(comment);
    }

    const groups: CommentGroup[] = [];
    const general = buckets.get(null) ?? [];
    if (general.length > 0) {
      groups.push({ label: null, title: 'Comentários gerais', comments: general });
    }

    for (const label of orderedLabels) {
      const grouped = buckets.get(label) ?? [];
      if (grouped.length > 0) {
        groups.push({
          label,
          title: `Sobre a alternativa ${label}`,
          comments: grouped,
        });
      }
    }

    return groups;
  });

  private currentId: Id | null = null;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (!id) {
        this.loading.set(false);
        this.error.set('Não foi possível identificar esta questão.');
        return;
      }
      this.currentId = id;
      this.loadQuestion(id);
    });
  }

  protected retry(): void {
    if (this.currentId !== null) {
      this.loadQuestion(this.currentId);
    }
  }

  protected loadDiscussion(questionId?: Id): void {
    const id = questionId ?? this.question()?.id;
    if (id === undefined) {
      return;
    }

    this.discussionLoading.set(true);
    this.discussionError.set(null);

    this.questionService
      .getDiscussion(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.discussionLoading.set(false)),
      )
      .subscribe({
        next: (discussion) => this.discussion.set(discussion),
        error: (error: unknown) => {
          const status = getApiErrorStatus(error);
          this.discussion.set(null);
          this.discussionError.set(
            status === 403
              ? 'A discussão é liberada depois que você responde a esta questão.'
              : getApiErrorMessage(error, 'Não foi possível carregar a discussão.'),
          );
        },
      });
  }

  protected selectOption(label: string): void {
    if (!this.optionsLocked()) {
      this.selectedOption.set(label);
      this.attemptError.set(null);
    }
  }

  protected submitAttempt(): void {
    const question = this.question();
    const option = this.selectedOption();

    if (!question || !option || this.submitting() || this.attempt()) {
      return;
    }

    this.submitting.set(true);
    this.attemptError.set(null);

    this.questionService
      .submitAttempt(question.id, option)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: ({ attempt }) => {
          this.attempt.set(attempt);
          this.question.update((current) =>
            current
              ? {
                  ...current,
                  has_attempted: true,
                  last_attempt_is_correct: attempt.is_correct,
                }
              : current,
          );
          this.loadDiscussion(question.id);
        },
        error: (error: unknown) => {
          this.attemptError.set(
            getApiErrorMessage(error, 'Não foi possível registrar sua resposta. Tente novamente.'),
          );
        },
      });
  }

  protected revealAnswer(): void {
    const question = this.question();
    if (!question || !this.hasAttempted() || this.answer() || this.revealing()) {
      return;
    }

    this.revealing.set(true);
    this.revealError.set(null);

    this.questionService
      .getAnswer(question.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.revealing.set(false)),
      )
      .subscribe({
        next: ({ answer }) => this.answer.set(answer),
        error: (error: unknown) => {
          const status = getApiErrorStatus(error);
          this.revealError.set(
            status === 403
              ? 'Responda à questão antes de ver a resposta e a explicação.'
              : getApiErrorMessage(error, 'Não foi possível carregar a resposta.'),
          );
        },
      });
  }

  protected submitComment(): void {
    const question = this.question();
    if (!question || !this.hasAttempted() || this.commentSubmitting()) {
      return;
    }

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const value = this.commentForm.getRawValue();
    const body = value.body.trim();

    if (body.length < 2) {
      this.commentError.set('Escreva um comentário com pelo menos 2 caracteres.');
      return;
    }

    this.commentSubmitting.set(true);
    this.commentError.set(null);
    this.commentSuccess.set(null);

    this.questionService
      .addComment(question.id, body, value.option_label || undefined)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.commentSubmitting.set(false)),
      )
      .subscribe({
        next: ({ comment }) => {
          this.discussion.update((current) =>
            current
              ? { ...current, comments: [...current.comments, comment] }
              : { question_id: question.id, comments: [comment] },
          );
          this.commentForm.reset({ body: '', option_label: '' });
          this.commentSuccess.set('Comentário publicado. Obrigado por contribuir com a discussão.');
        },
        error: (error: unknown) => {
          this.commentError.set(
            getApiErrorMessage(error, 'Não foi possível publicar seu comentário.'),
          );
        },
      });
  }

  protected openReport(commentId: Id): void {
    this.reportingId.set(commentId);
    this.reportError.set(null);
    this.reportSuccess.set(null);
  }

  protected cancelReport(): void {
    this.reportingId.set(null);
    this.reportError.set(null);
  }

  protected setReportReason(event: Event): void {
    this.reportReason.set((event.target as HTMLSelectElement).value);
  }

  protected confirmReport(commentId: Id): void {
    if (this.reportingId() !== commentId) {
      return;
    }

    this.reportError.set(null);

    this.questionService
      .reportComment(commentId, this.reportReason())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.reportedIds.update((ids) => {
            const next = new Set(ids);
            next.add(commentId);
            return next;
          });
          this.reportingId.set(null);
          this.reportSuccess.set('Denúncia registrada. Obrigado por avisar.');
        },
        error: (error: unknown) => {
          this.reportError.set(getApiErrorMessage(error, 'Não foi possível registrar a denúncia.'));
        },
      });
  }

  protected difficulty(value: string): string {
    return difficultyLabel(value);
  }

  protected languageLabel(language: string | null | undefined): string {
    if (language === 'ingles') {
      return 'Inglês';
    }
    if (language === 'espanhol') {
      return 'Espanhol';
    }
    return language ?? '';
  }

  protected difficultyClass(value: string): string {
    return `difficulty difficulty--${difficultyTone(value)}`;
  }

  protected dateTime(value: string): string {
    return formatDateTimeBR(value);
  }

  protected groupId(group: CommentGroup): string {
    return `comments-${group.label ?? 'gerais'}`;
  }

  private loadQuestion(id: Id): void {
    this.loading.set(true);
    this.error.set(null);
    this.question.set(null);
    this.selectedOption.set(null);
    this.attempt.set(null);
    this.attemptError.set(null);
    this.answer.set(null);
    this.revealError.set(null);
    this.discussion.set(null);
    this.discussionError.set(null);
    this.reportingId.set(null);
    this.reportError.set(null);
    this.reportSuccess.set(null);
    this.commentError.set(null);
    this.commentSuccess.set(null);
    this.commentForm.reset({ body: '', option_label: '' });

    this.questionService
      .getQuestion(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ question }) => {
          this.question.set(question);
          if (question.has_attempted) {
            this.loadDiscussion(question.id);
          }
        },
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error, 'Não foi possível carregar esta questão.'));
        },
      });
  }
}
