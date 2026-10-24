import { Injectable } from '@angular/core';

/**
 * Permite que uma visualização proponha mudanças nos parâmetros exibidos no
 * painel lateral sem conhecer o componente hospedeiro.
 */
@Injectable({ providedIn: 'root' })
export class VisualizationParamsBridge {
  private handler?: (patch: Record<string, unknown>) => void;

  connect(handler: (patch: Record<string, unknown>) => void): void {
    this.handler = handler;
  }

  update(patch: Record<string, unknown>): void {
    this.handler?.(patch);
  }
}
