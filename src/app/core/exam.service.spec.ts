import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ExamService } from './exam.service';
import { ExamsResponse } from './models';

describe('ExamService', () => {
  let service: ExamService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExamService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the official exams', () => {
    const payload: ExamsResponse = {
      exams: [
        {
          id: 'exam-1',
          title: 'ENEM 2023',
          year: 2023,
          area_code: 'linguagens',
          area_name: 'Linguagens',
          area_color: '#2f6f5e',
          question_count: 45,
        },
      ],
    };

    let result: ExamsResponse | undefined;
    service.getExams().subscribe((response) => (result = response));

    const request = http.expectOne('/api/v1/exams');
    expect(request.request.method).toBe('GET');
    request.flush(payload);

    expect(result).toEqual(payload);
  });
});
