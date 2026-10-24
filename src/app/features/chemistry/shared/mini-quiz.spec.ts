import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiniQuiz } from './mini-quiz';

describe('MiniQuiz', () => {
  let fixture: ComponentFixture<MiniQuiz>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MiniQuiz] }).compileComponents();
    fixture = TestBed.createComponent(MiniQuiz);
    fixture.componentRef.setInput('questions', [
      {
        question: 'Pergunta de teste?',
        options: ['Correta', 'Incorreta'],
        correctIndex: 0,
        explanation: 'A primeira alternativa é a correta.',
      },
    ]);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('reveals the answer only after the user asks for it', () => {
    expect(root.querySelector('.explanation')).toBeNull();
    const firstOption = root.querySelector<HTMLInputElement>('input[type="radio"]')!;
    firstOption.checked = true;
    firstOption.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(root.querySelector('.explanation')).toBeNull();
    const reveal = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) =>
      button.textContent?.includes('Conferir respostas'),
    );
    reveal!.click();
    fixture.detectChanges();

    expect(root.querySelector('.explanation')?.textContent).toContain('Gabarito');
    expect(root.querySelector('.score')?.textContent).toContain('1 de 1');
  });
});
