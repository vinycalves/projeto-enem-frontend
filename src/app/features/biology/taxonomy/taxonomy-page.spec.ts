import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TAXONOMY_EXAMPLES } from '../../../core/biology-data';
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

  it('offers at least five animal and five plant examples with the full hierarchy', () => {
    const animals = TAXONOMY_EXAMPLES.filter((example) => example.group === 'Animalia');
    const plants = TAXONOMY_EXAMPLES.filter((example) => example.group === 'Plantae');
    const rankLabels = [
      'Domínio',
      'Reino',
      'Filo',
      'Classe',
      'Ordem',
      'Família',
      'Gênero',
      'Espécie',
    ];

    expect(animals.length).toBeGreaterThanOrEqual(5);
    expect(plants.length).toBeGreaterThanOrEqual(5);

    for (const example of [...animals, ...plants]) {
      expect(example.commonName.trim().length).toBeGreaterThan(0);
      expect(example.scientificName.trim().length).toBeGreaterThan(0);
      expect(example.ranks.map((rank) => rank.rank)).toEqual(rankLabels);
      expect(example.ranks[7].name).toBe(example.scientificName);
      expect(example.ranks.every((rank) => rank.note.trim().length > 0)).toBe(true);
    }
  });

  it('renders the new animal and plant examples with their scientific names', () => {
    const expected = [
      { name: 'Onça-pintada', scientific: 'Panthera onca' },
      { name: 'Abelha-europeia', scientific: 'Apis mellifera' },
      { name: 'Tucano-toco', scientific: 'Ramphastos toco' },
      { name: 'Sapo-cururu', scientific: 'Rhinella marina' },
      { name: 'Café-arábica', scientific: 'Coffea arabica' },
      { name: 'Feijão-comum', scientific: 'Phaseolus vulgaris' },
      { name: 'Laranjeira-doce', scientific: 'Citrus × sinensis' },
      { name: 'Samambaia-das-taipas', scientific: 'Pteridium aquilinum' },
    ];

    for (const item of expected) {
      const button = Array.from(root.querySelectorAll<HTMLButtonElement>('.example-button')).find(
        (candidate) => candidate.textContent?.includes(item.name),
      );
      expect(button, item.name).toBeTruthy();
      button!.click();
      fixture.detectChanges();
      expect(root.textContent).toContain(item.scientific);
    }
  });

  it('shows the taxonomic ranks for a newly added example', () => {
    const toad = Array.from(root.querySelectorAll<HTMLButtonElement>('.example-button')).find(
      (button) => button.textContent?.includes('Sapo-cururu'),
    );
    expect(toad).toBeTruthy();
    toad!.click();
    fixture.detectChanges();

    expect(root.textContent).toContain('Rhinella marina');
    expect(root.textContent).toContain('Bufonidae');
    expect(root.textContent).toContain('Anura');
    expect(root.querySelectorAll('.rank-card').length).toBe(8);
  });

  it('marks examples without a primary source as didactic', () => {
    const source = root.querySelector('.example-source');
    expect(source?.textContent).toContain('Exemplo didático');
    expect(source?.textContent).toContain('sem fonte primária específica');
  });
});
