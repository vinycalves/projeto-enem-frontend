import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DnaVisualization } from './dna-visualization';

describe('DnaVisualization', () => {
  let fixture: ComponentFixture<DnaVisualization>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DnaVisualization],
    }).compileComponents();

    fixture = TestBed.createComponent(DnaVisualization);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('starts on DNA and exposes a clear DNA/RNA toggle', () => {
    const buttons = root.querySelectorAll<HTMLButtonElement>('.molecule-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('DNA');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(root.textContent).toContain('Timina');
  });

  it('switches to RNA and updates the copy and base labels', () => {
    const buttons = root.querySelectorAll<HTMLButtonElement>('.molecule-button');
    buttons[1].click();
    fixture.detectChanges();

    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(root.textContent).toContain('Uracila');
    expect(root.textContent).toContain('Fita simples');
    expect(root.textContent).toContain('não corresponde a um transcrito real');
    expect(root.textContent).not.toContain('Timina');
  });

  it('does not offer automatic rotation and keeps manual controls', () => {
    expect(root.textContent).toContain('Sem rotação automática');
    const reset = root.querySelector<HTMLButtonElement>('.dna-reset');
    expect(reset).toBeTruthy();
    expect(reset!.textContent).toContain('Recentralizar');
    expect(() => reset!.click()).not.toThrow();
  });
});
