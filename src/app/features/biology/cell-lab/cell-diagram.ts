import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CellKind, Organelle, organelleColor } from '../../../core/biology-data';
import {
  CELL_DIAGRAM_LAYOUTS,
  DiagramMarker,
  DiagramShape,
  ORGANELLE_COLOR_TOKEN,
} from './cell-diagram-layout';

interface DiagramItem {
  id: string;
  organelle: Organelle;
  index: number;
  marker: DiagramMarker;
  color: string;
  shapes: DiagramShape[];
}

@Component({
  selector: 'app-cell-diagram',
  templateUrl: './cell-diagram.html',
  styleUrl: './cell-diagram.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CellDiagram {
  readonly kind = input.required<CellKind>();
  readonly organelles = input.required<Organelle[]>();
  readonly selectedId = input.required<string>();
  readonly isolate = input(false);
  readonly showLabels = input(true);
  readonly selected = output<string>();

  protected readonly layout = computed(() => CELL_DIAGRAM_LAYOUTS[this.kind()]);
  protected readonly titleId = computed(() => `cell-diagram-title-${this.kind()}`);
  protected readonly descriptionId = computed(() => `cell-diagram-desc-${this.kind()}`);
  protected readonly items = computed<DiagramItem[]>(() => {
    const layout = this.layout();
    return this.organelles()
      .map((organelle, index) => {
        const item = layout.items[organelle.id];
        if (!item) {
          return null;
        }
        return {
          id: organelle.id,
          organelle,
          index: index + 1,
          marker: item.marker,
          color: organelleColor(this.kind(), organelle),
          shapes: item.shapes,
        };
      })
      .filter((item): item is DiagramItem => item !== null)
      .sort((a, b) => {
        const aOrder = layout.order.indexOf(a.id);
        const bOrder = layout.order.indexOf(b.id);
        return (
          (aOrder < 0 ? Number.MAX_SAFE_INTEGER : aOrder) -
          (bOrder < 0 ? Number.MAX_SAFE_INTEGER : bOrder)
        );
      });
  });

  protected fill(shape: DiagramShape, item: DiagramItem): string {
    if (shape.fill === ORGANELLE_COLOR_TOKEN) {
      return item.color;
    }
    return shape.fill ?? 'none';
  }

  protected stroke(shape: DiagramShape, item: DiagramItem): string {
    if (shape.stroke === ORGANELLE_COLOR_TOKEN) {
      return item.color;
    }
    return shape.stroke ?? 'none';
  }

  protected isDimmed(id: string): boolean {
    return this.isolate() && id !== this.selectedId() && id !== 'membrane' && id !== 'cellwall';
  }

  protected onKeydown(event: KeyboardEvent, id: string): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.selected.emit(id);
  }
}
