import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CurriculumService } from './curriculum.service';
import { Area, ConceptDetail } from './models';

describe('CurriculumService', () => {
  let service: CurriculumService;
  let http: HttpTestingController;

  const area: Area = {
    id: 3,
    code: 'linguagens',
    name: 'Linguagens',
    description: 'Línguas e códigos.',
    color: '#c96f4a',
    icon: 'book',
    subjects: [
      {
        id: 7,
        code: 'portugues',
        name: 'Português',
        description: 'Leitura e escrita.',
        concept_count: 2,
      },
    ],
  };

  const concept: ConceptDetail = {
    id: 42,
    code: 'interpretacao',
    name: 'Interpretação de texto',
    summary: 'Compreender a ideia central.',
    explanation: 'Explicação do conceito.',
    difficulty: 'medio',
    subject_name: 'Português',
    area_name: 'Linguagens',
    question_count: 4,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CurriculumService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the knowledge areas', () => {
    let count = 0;

    service.getAreas().subscribe((response) => (count = response.areas.length));

    const request = http.expectOne('/api/v1/curriculum/areas');
    expect(request.request.method).toBe('GET');
    request.flush({ areas: [area] });

    expect(count).toBe(1);
  });

  it('loads concepts for a subject', () => {
    let name = '';

    service.getSubjectConcepts(7).subscribe((response) => (name = response.subject.name));

    const request = http.expectOne('/api/v1/curriculum/subjects/7/concepts');
    expect(request.request.method).toBe('GET');
    request.flush({
      subject: {
        id: 7,
        code: 'portugues',
        name: 'Português',
        description: 'Leitura e escrita.',
        area_name: 'Linguagens',
      },
      concepts: [
        {
          id: 42,
          code: 'interpretacao',
          name: 'Interpretação de texto',
          summary: 'Compreender a ideia central.',
          difficulty: 'medio',
          question_count: 4,
        },
      ],
    });

    expect(name).toBe('Português');
  });

  it('loads a concept detail', () => {
    let loaded: ConceptDetail | undefined;

    service.getConcept(42).subscribe((response) => (loaded = response.concept));

    const request = http.expectOne('/api/v1/curriculum/concepts/42');
    expect(request.request.method).toBe('GET');
    request.flush({ concept });

    expect(loaded?.name).toBe('Interpretação de texto');
  });
});
