import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ExamService } from '../../core/exam.service';
import { ExamsResponse } from '../../core/models';
import { ExamsPage } from './exams-page';

describe('ExamsPage', () => {
  let fixture: ComponentFixture<ExamsPage>;
  let root: HTMLElement;

  const payload: ExamsResponse = {
    exams: [
      {
        id: 'exam-2023',
        title: 'ENEM 2023',
        year: 2023,
        area_code: 'linguagens',
        area_name: 'Linguagens, Códigos e suas Tecnologias',
        area_color: '#2f6f5e',
        question_count: 45,
      },
      {
        id: 'exam-2022',
        title: 'ENEM 2022',
        year: 2022,
        area_code: 'linguagens',
        area_name: 'Linguagens, Códigos e suas Tecnologias',
        area_color: '#2f6f5e',
        question_count: 45,
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamsPage],
      providers: [
        provideRouter([]),
        { provide: ExamService, useValue: { getExams: () => of(payload) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamsPage);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('groups exams by area and renders the year cards', () => {
    expect(root.textContent).toContain('Linguagens, Códigos e suas Tecnologias');
    const cards = root.querySelectorAll('.exam-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('2023');
    expect(cards[1].textContent).toContain('2022');
    expect(cards[0].textContent).toContain('45 questões');
  });
});
