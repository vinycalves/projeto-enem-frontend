import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface ParamDefinition {
  id: string;
  label: string;
  kind: 'slider' | 'toggle' | 'select' | string;
  min?: number | null;
  max?: number | null;
  step?: number | null;
  default: unknown;
  unit?: string | null;
  options?: string[] | null;
}

@Component({
  selector: 'app-parameter-panel',
  templateUrl: './parameter-panel.html',
  styleUrl: './parameter-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParameterPanel {
  readonly params = input<ParamDefinition[]>([]);
  readonly values = input<Record<string, unknown>>({});
  readonly changed = output<Record<string, unknown>>();
  readonly reset = output<void>();

  protected numberValue(id: string, fallback: number): number {
    const value = Number(this.values()[id]);
    return Number.isFinite(value) ? value : fallback;
  }

  protected isOn(id: string): boolean {
    return this.values()[id] !== false;
  }

  protected stringValue(id: string, fallback: string): string {
    const value = this.values()[id];
    return typeof value === 'string' ? value : fallback;
  }

  protected defaultString(param: ParamDefinition): string {
    return param.default == null ? '' : String(param.default);
  }

  protected defaultNumber(param: ParamDefinition): number {
    const value = Number(param.default);
    return Number.isFinite(value) ? value : 0;
  }

  protected updateNumber(id: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emit({ ...this.values(), [id]: Number(target.value) });
  }

  protected updateToggle(id: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emit({ ...this.values(), [id]: target.checked });
  }

  protected updateSelect(id: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.emit({ ...this.values(), [id]: target.value });
  }

  private emit(values: Record<string, unknown>): void {
    this.changed.emit(values);
  }
}
