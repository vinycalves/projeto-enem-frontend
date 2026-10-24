import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <span class="empty-mark" aria-hidden="true">◇</span>
      <h3>{{ heading() }}</h3>
      <p>{{ message() }}</p>
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly heading = input('Nada por aqui ainda');
  readonly message = input('Quando houver conteúdo, ele aparecerá neste espaço.');
}
