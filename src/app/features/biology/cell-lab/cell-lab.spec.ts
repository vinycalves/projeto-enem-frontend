import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CellLab } from './cell-lab';

describe('CellLab', () => {
  let fixture: ComponentFixture<CellLab>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellLab],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CellLab);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('lists the animal cell organelles and updates the detail panel', () => {
    const buttons = root.querySelectorAll<HTMLButtonElement>('.organelle-button');
    expect(buttons.length).toBe(10);

    const mitochondria = Array.from(buttons).find((button) =>
      button.textContent?.includes('Mitocôndria'),
    );
    expect(mitochondria).toBeTruthy();
    mitochondria!.click();
    fixture.detectChanges();

    expect(root.querySelector('.organelle-info h2')?.textContent).toContain('Mitocôndria');
    expect(root.querySelector('.organelle-info')?.textContent).toContain('respiração celular');
  });

  it('switches to the plant cell and shows plant-specific organelles', () => {
    const plantButton = Array.from(root.querySelectorAll<HTMLButtonElement>('.switch-button')).find(
      (button) => button.textContent?.includes('vegetal'),
    );
    expect(plantButton).toBeTruthy();
    plantButton!.click();
    fixture.detectChanges();

    expect(root.querySelectorAll('.organelle-button').length).toBe(12);
    expect(root.textContent).toContain('Cloroplasto');
    expect(root.textContent).toContain('Vacúolo central');
    expect(root.textContent).toContain('Peroxissomo');
    expect(root.textContent).not.toContain('Lisossomo');
  });
});
