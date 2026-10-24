import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TAXONOMY_EXAMPLES, TAXONOMY_STEPS, TaxonomyExample } from '../../../core/biology-data';

@Component({
  selector: 'app-taxonomy-page',
  imports: [RouterLink],
  templateUrl: './taxonomy-page.html',
  styleUrl: './taxonomy-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaxonomyPage {
  protected readonly examples = TAXONOMY_EXAMPLES;
  protected readonly steps = TAXONOMY_STEPS;
  protected readonly selectedId = signal(TAXONOMY_EXAMPLES[0].id);
  protected readonly selected = computed<TaxonomyExample>(
    () => this.examples.find((example) => example.id === this.selectedId()) ?? this.examples[0],
  );

  protected selectExample(id: string): void {
    this.selectedId.set(id);
  }
}
