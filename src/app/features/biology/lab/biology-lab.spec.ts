import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BiologyLab } from './biology-lab';

describe('BiologyLab', () => {
  let fixture: ComponentFixture<BiologyLab>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiologyLab],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BiologyLab);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('renders the default Punnett cross with the 3:1 ratio', () => {
    const cells = Array.from(root.querySelectorAll('.punnett-cell')).map((cell) =>
      cell.textContent?.trim(),
    );
    expect(cells).toEqual(['AA', 'Aa', 'Aa', 'aa']);
    expect(root.querySelector('.bio-phenotypes')?.textContent).toContain('75%');
  });

  it('handles homozygous parents without duplicate track keys', () => {
    const selects = root.querySelectorAll<HTMLSelectElement>('.bio-field select');
    expect(selects.length).toBe(2);

    for (const [index, value] of ['AA', 'aa'].entries()) {
      selects[index].value = value;
      selects[index].dispatchEvent(new Event('change'));
    }
    fixture.detectChanges();

    const cells = Array.from(root.querySelectorAll('.punnett-cell')).map((cell) =>
      cell.textContent?.trim(),
    );
    expect(cells).toEqual(['Aa', 'Aa', 'Aa', 'Aa']);
    expect(root.querySelector('.bio-phenotypes')?.textContent).toContain('100%');
  });

  it('switches between the genetics, evolution, ecology and physiology modules', () => {
    const tab = (label: string): HTMLButtonElement =>
      Array.from(root.querySelectorAll<HTMLButtonElement>('.bio-tabs button')).find((button) =>
        button.textContent?.includes(label),
      )!;

    tab('Evolução').click();
    fixture.detectChanges();
    expect(root.querySelector('#hwe-title')).toBeTruthy();
    expect(root.textContent).toContain('Hardy-Weinberg');

    tab('Ecologia').click();
    fixture.detectChanges();
    expect(root.querySelector('#population-title')).toBeTruthy();
    expect(root.querySelector('#trophic-title')).toBeTruthy();

    tab('Fisiologia').click();
    fixture.detectChanges();
    expect(root.querySelector('#enzyme-title')).toBeTruthy();
    expect(root.querySelector('app-bio-chart svg')).toBeTruthy();
  });
});
