import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Answer, Attempt } from './models';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let service: QuestionService;
  let http: HttpTestingController;

  const attempt: Attempt = {
    id: 9,
    is_correct: true,
    selected_option: 'B',
    created_at: '2026-10-24T12:00:00Z',
  };

  const answer: Answer = {
    correct_option: 'B',
    explanation: 'A alternativa B é a correta.',
    source: 'ENEM 2024',
    license: 'CC BY',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuestionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('submits an attempt with the selected option', () => {
    let received: Attempt | undefined;

    service.submitAttempt(10, 'B').subscribe((response) => (received = response.attempt));

    const request = http.expectOne('/api/v1/questions/10/attempts');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ selected_option: 'B' });
    request.flush({ attempt });

    expect(received).toEqual(attempt);
  });

  it('fetches the answer and explanation only through the answer endpoint', () => {
    let received: Answer | undefined;

    service.getAnswer(10).subscribe((response) => (received = response.answer));

    const request = http.expectOne('/api/v1/questions/10/answer');
    expect(request.request.method).toBe('GET');
    request.flush({ answer });

    expect(received?.correct_option).toBe('B');
    expect(received?.explanation).toBe('A alternativa B é a correta.');
  });

  it('loads questions filtered by concept', () => {
    service.getQuestions(42).subscribe();

    const request = http.expectOne((req) => req.url === '/api/v1/questions');
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('concept_id')).toBe('42');
    request.flush({ questions: [] });
  });

  it('posts comments and reports', () => {
    service.addComment(10, 'Meu raciocínio', 'B').subscribe();
    const commentRequest = http.expectOne('/api/v1/questions/10/comments');
    expect(commentRequest.request.method).toBe('POST');
    expect(commentRequest.request.body).toEqual({
      body: 'Meu raciocínio',
      option_label: 'B',
    });
    commentRequest.flush({
      comment: {
        id: 1,
        author: 'Estudante',
        option_label: 'B',
        body: 'Meu raciocínio',
        created_at: '2026-10-24T12:00:00Z',
        is_own: true,
      },
    });

    service.reportComment(1, 'Conteúdo ofensivo').subscribe();
    const reportRequest = http.expectOne('/api/v1/comments/1/report');
    expect(reportRequest.request.method).toBe('POST');
    expect(reportRequest.request.body).toEqual({ reason: 'Conteúdo ofensivo' });
    reportRequest.flush(null, { status: 204, statusText: 'No Content' });
  });
});
