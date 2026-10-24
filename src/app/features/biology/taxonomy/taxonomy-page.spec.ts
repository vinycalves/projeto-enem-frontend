import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TaxonomyPage } from './taxonomy-page';

describe('TaxonomyPage', () => {
  let fixture: ComponentFixture<TaxonomyPage>;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxonomyPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TaxonomyPage);
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('shows the human taxonomic path by default', () => {
    expect(root.textContent).toContain('Homo sapiens');
    const ranks = Array.from(root.querySelectorAll('.rank-card .rank-label')).map((element) =>
      element.textContent?.trim(),
    );
    expect(ranks).toEqual([
      'Domínio',
      'Reino',
      'Filo',
      'Classe',
      'Ordem',
      'Família',
      'Gênero',
      'Espécie',
    ]);
  });

  it('switches the example and updates the hierarchy', () => {
    const maize = Array.from(root.querySelectorAll<HTMLButtonElement>('.example-button')).find(
      (button) => button.textContent?.includes('Milho'),
    );
    expect(maize).toBeTruthy();
    maize!.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('Zea mays');
    expect(root.textContent).toContain('Poaceae');
    expect(root.textContent).toContain('Plantae');
  });
});
