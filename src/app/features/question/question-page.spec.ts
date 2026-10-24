import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Answer, Attempt, Discussion, QuestionDetail, QuestionResponse } from '../../core/models';
import { QuestionService } from '../../core/question.service';
import { QuestionPage } from './question-page';

describe('QuestionPage', () => {
  let fixture: ComponentFixture<QuestionPage>;
  let root: HTMLElement;

  const question: QuestionDetail = {
    id: 10,
    code: 'ENEM-2024-01',
    statement: 'Qual é a alternativa correta desta questão de teste?',
    options: [
      { label: 'A', text: 'Primeira alternativa' },
      { label: 'B', text: 'Segunda alternativa' },
      { label: 'C', text: 'Terceira alternativa' },
      { label: 'D', text: 'Quarta alternativa' },
      { label: 'E', text: 'Quinta alternativa' },
    ],
    difficulty: 'medio',
    concept_id: 42,
    concept_name: 'Interpretação de texto',
    subject_name: 'Português',
    area_name: 'Linguagens',
    source: 'ENEM 2024',
    license: 'CC BY',
    has_attempted: false,
    last_attempt_is_correct: null,
  };

  const attempt: Attempt = {
    id: 99,
    is_correct: false,
    selected_option: 'B',
    created_at: '2026-10-24T12:00:00Z',
  };

  const discussion: Discussion = {
    question_id: 10,
    comments: [],
  };

  const answer: Answer = {
    correct_option: 'A',
    explanation: 'Explicação de teste que só deve aparecer após clicar em revelar.',
    source: 'ENEM 2024',
    license: 'CC BY',
  };

  const questionMock = {
    getQuestion: vi.fn((_id: number | string) => of({ question } as QuestionResponse)),
    submitAttempt: vi.fn((_id: number | string, _option: string) => of({ attempt })),
    getDiscussion: vi.fn((_id: number | string) => of(discussion)),
    getAnswer: vi.fn((_id: number | string) => of({ answer })),
    addComment: vi.fn(),
    reportComment: vi.fn(),
  };

  beforeEach(async () => {
    questionMock.getQuestion.mockClear();
    questionMock.submitAttempt.mockClear();
    questionMock.getDiscussion.mockClear();
    questionMock.getAnswer.mockClear();

    await TestBed.configureTestingModule({
      imports: [QuestionPage],
      providers: [
        provideRouter([]),
        { provide: QuestionService, useValue: questionMock },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ id: '10' })) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionPage);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function findButton(label: string): HTMLButtonElement | undefined {
    return Array.from(root.querySelectorAll('button')).find((button) =>
      button.textContent?.includes(label),
    );
  }

  it('submits a selected option without revealing the answer, then reveals it on request', async () => {
    expect(root.textContent).toContain('Qual é a alternativa correta');
    expect(root.querySelector('.answer-section')).toBeNull();
    expect(questionMock.getAnswer).not.toHaveBeenCalled();

    const input = root.querySelector<HTMLInputElement>('input[type="radio"][value="B"]');
    expect(input).toBeTruthy();
    input!.click();
    fixture.detectChanges();

    const submit = findButton('Responder');
    expect(submit).toBeTruthy();
    expect(submit!.disabled).toBe(false);
    submit!.click();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(questionMock.submitAttempt).toHaveBeenCalledWith(10, 'B');
    expect(root.textContent).toContain('Sua resposta não está correta.');
    expect(root.querySelector('.answer-section')).toBeNull();
    expect(questionMock.getDiscussion).toHaveBeenCalledWith(10);

    const reveal = findButton('Ver resposta e explicação');
    expect(reveal).toBeTruthy();
    reveal!.click();

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(questionMock.getAnswer).toHaveBeenCalledWith(10);
    const answerSection = root.querySelector('.answer-section');
    expect(answerSection?.textContent).toContain('Alternativa A');
    expect(answerSection?.textContent).toContain(
      'Explicação de teste que só deve aparecer após clicar em revelar.',
    );
    expect(root.textContent).toContain('Discussão da questão');
  });
});
