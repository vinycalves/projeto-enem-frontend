import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { organellesFor } from '../../../core/biology-data';
import { CELL_DIAGRAM_LAYOUTS } from './cell-diagram-layout';
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

  it('switches to the 2D diagram and keeps organelle selection working', () => {
    const diagramButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.switch-button'),
    ).find((button) => button.textContent?.includes('Diagrama 2D'));
    expect(diagramButton).toBeTruthy();
    diagramButton!.click();
    fixture.detectChanges();

    const diagram = root.querySelector('.cell-diagram');
    expect(diagram).toBeTruthy();
    const organelles = root.querySelectorAll('.diagram-organelle');
    expect(organelles.length).toBe(10);

    const mitochondria = Array.from(organelles).find((element) =>
      element.getAttribute('aria-label')?.includes('Mitocôndria'),
    );
    expect(mitochondria).toBeTruthy();
    mitochondria!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(root.querySelector('.organelle-info h2')?.textContent).toContain('Mitocôndria');
    expect(mitochondria!.getAttribute('aria-pressed')).toBe('true');
  });

  it('supports keyboard selection and the plant diagram', () => {
    const diagramButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.switch-button'),
    ).find((button) => button.textContent?.includes('Diagrama 2D'));
    diagramButton!.click();
    fixture.detectChanges();

    const nucleus = Array.from(root.querySelectorAll('.diagram-organelle')).find((element) =>
      element.getAttribute('aria-label')?.includes('Núcleo'),
    );
    expect(nucleus).toBeTruthy();
    nucleus!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('.organelle-info h2')?.textContent).toContain('Núcleo');

    const plantButton = Array.from(root.querySelectorAll<HTMLButtonElement>('.switch-button')).find(
      (button) => button.textContent?.includes('vegetal'),
    );
    expect(plantButton).toBeTruthy();
    plantButton!.click();
    fixture.detectChanges();

    expect(root.querySelectorAll('.diagram-organelle').length).toBe(12);
    expect(root.textContent).toContain('Cloroplasto');
    expect(root.textContent).toContain('Vacúolo central');

    const chloroplast = Array.from(root.querySelectorAll('.diagram-organelle')).find((element) =>
      element.getAttribute('aria-label')?.includes('Cloroplasto'),
    );
    expect(chloroplast).toBeTruthy();
    chloroplast!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(root.querySelector('.organelle-info h2')?.textContent).toContain('Cloroplasto');
  });

  it('keeps isolate and labels controls working in the 2D diagram', () => {
    const diagramButton = Array.from(
      root.querySelectorAll<HTMLButtonElement>('.switch-button'),
    ).find((button) => button.textContent?.includes('Diagrama 2D'));
    diagramButton!.click();
    fixture.detectChanges();

    const isolateButton = Array.from(root.querySelectorAll<HTMLButtonElement>('.tool-button')).find(
      (button) => button.textContent?.includes('Isolar estrutura'),
    );
    isolateButton!.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.diagram-organelle.is-dimmed').length).toBeGreaterThan(0);

    const labelsButton = Array.from(root.querySelectorAll<HTMLButtonElement>('.tool-button')).find(
      (button) => button.textContent?.includes('Rótulos'),
    );
    expect(labelsButton).toBeTruthy();
    labelsButton!.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.diagram-label').length).toBe(0);
    expect(root.querySelectorAll('.diagram-marker').length).toBe(10);
  });

  it('has a diagram layout for every organelle of both cell types', () => {
    for (const kind of ['animal', 'vegetal'] as const) {
      for (const organelle of organellesFor(kind)) {
        expect(
          CELL_DIAGRAM_LAYOUTS[kind].items[organelle.id],
          `${kind}: ${organelle.id}`,
        ).toBeTruthy();
      }
    }
  });
});
