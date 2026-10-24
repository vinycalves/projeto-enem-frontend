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

  it('toggles the expanded viewer when native fullscreen is unavailable', () => {
    const fullscreenButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.tool-button'),
    ).find((button) => button.textContent?.includes('Tela cheia'));
    expect(fullscreenButton).toBeTruthy();

    fullscreenButton!.click();
    fixture.detectChanges();

    const card = root.querySelector('.viewport-card');
    expect(card?.classList.contains('is-expanded')).toBe(true);
    expect(fullscreenButton!.textContent).toContain('Sair da tela cheia');

    fullscreenButton!.click();
    fixture.detectChanges();

    expect(card?.classList.contains('is-expanded')).toBe(false);
    expect(fullscreenButton!.textContent).toContain('Tela cheia');
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
