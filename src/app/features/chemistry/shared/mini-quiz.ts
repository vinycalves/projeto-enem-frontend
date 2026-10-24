import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { VisualizationQuizQuestion } from '../../../core/api/models/visualization-quiz-question';

@Component({
  selector: 'app-mini-quiz',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (questions().length > 0) {
      <section class="mini-quiz" aria-labelledby="mini-quiz-title">
        <p class="eyebrow">Mini-verificação</p>
        <h2 id="mini-quiz-title">Confira se o conceito ficou claro</h2>

        @for (question of questions(); track $index; let questionIndex = $index) {
          <fieldset class="question">
            <legend>{{ questionIndex + 1 }}. {{ question.question }}</legend>
            @for (option of question.options; track $index; let optionIndex = $index) {
              <label class="option" [class.is-correct]="revealed() && optionIndex === question.correctIndex"
                     [class.is-wrong]="revealed() && selected()[questionIndex] === optionIndex && optionIndex !== question.correctIndex">
                <input
                  type="radio"
                  [name]="'quiz-' + questionIndex"
                  [checked]="selected()[questionIndex] === optionIndex"
                  (change)="choose(questionIndex, optionIndex)"
                />
                <span>{{ option }}</span>
              </label>
            }
            @if (revealed()) {
              <p class="explanation">
                <strong>Gabarito:</strong> {{ question.explanation }}
              </p>
            }
          </fieldset>
        }

        <div class="quiz-actions">
          <button class="quiz-button" type="button" (click)="reveal()" [disabled]="revealed()">
            Conferir respostas
          </button>
          @if (revealed()) {
            <button class="quiz-link" type="button" (click)="reset()">Tentar novamente</button>
            <span class="score" role="status">{{ score() }} de {{ questions().length }} corretas</span>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .mini-quiz {
      display: grid;
      gap: 0.65rem;
      padding: 0.9rem 1rem;
      border: 1px solid var(--line);
      background: var(--card);
    }

    h2 {
      margin: 0.1rem 0 0.2rem;
      font-size: 1rem;
    }

    .question {
      display: grid;
      gap: 0.32rem;
      margin: 0;
      padding: 0.55rem 0;
      border: 0;
      border-top: 1px solid var(--line);
    }

    legend {
      padding: 0.45rem 0 0.2rem;
      color: var(--ink);
      font-size: 0.76rem;
      font-weight: 700;
      line-height: 1.45;
    }

    .option {
      display: flex;
      gap: 0.45rem;
      align-items: start;
      padding: 0.32rem 0.4rem;
      color: var(--ink-soft);
      font-size: 0.72rem;
      line-height: 1.4;
      cursor: pointer;
    }

    .option:hover {
      background: var(--paper-deep);
    }

    .option.is-correct {
      background: #e2f3e8;
      color: var(--forest);
      font-weight: 700;
    }

    .option.is-wrong {
      background: #fbe9e4;
      color: var(--terracotta-deep);
    }

    .option input {
      margin-top: 0.12rem;
      accent-color: var(--forest);
    }

    .explanation {
      margin: 0.2rem 0 0;
      padding: 0.45rem 0.5rem;
      background: var(--paper-deep);
      color: var(--ink-soft);
      font-size: 0.7rem;
      line-height: 1.5;
    }

    .quiz-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .quiz-button {
      padding: 0.4rem 0.6rem;
      border: 1px solid var(--forest);
      background: var(--forest);
      color: #fffdf6;
      cursor: pointer;
      font: inherit;
      font-size: 0.7rem;
      font-weight: 700;
    }

    .quiz-button:disabled {
      opacity: 0.6;
      cursor: default;
    }

    .quiz-link {
      border: 0;
      background: transparent;
      color: var(--forest);
      cursor: pointer;
      font: inherit;
      font-size: 0.7rem;
      font-weight: 700;
      text-decoration: underline;
    }

    .score {
      color: var(--ink-soft);
      font-size: 0.7rem;
    }
  `,
})
export class MiniQuiz {
  readonly questions = input<VisualizationQuizQuestion[]>([]);
  protected readonly selected = signal<Record<number, number>>({});
  protected readonly revealed = signal(false);
  protected readonly score = computed(() =>
    this.questions().reduce(
      (total, question, index) => total + (this.selected()[index] === question.correctIndex ? 1 : 0),
      0,
    ),
  );

  protected choose(questionIndex: number, optionIndex: number): void {
    if (this.revealed()) {
      return;
    }
    this.selected.update((current) => ({ ...current, [questionIndex]: optionIndex }));
  }

  protected reveal(): void {
    this.revealed.set(true);
  }

  protected reset(): void {
    this.selected.set({});
    this.revealed.set(false);
  }
}
