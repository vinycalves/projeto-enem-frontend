import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { getApiErrorMessage } from '../../core/api-error';
import { SupportService } from '../../core/support.service';

type PixState = 'idle' | 'loading' | 'loaded' | 'empty' | 'error';
type CopyState = 'idle' | 'copied' | 'error';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.html',
  styleUrl: './about-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  private readonly support = inject(SupportService);

  protected readonly pixState = signal<PixState>('idle');
  protected readonly pixKey = signal<string | null>(null);
  protected readonly pixError = signal<string | null>(null);
  protected readonly copyState = signal<CopyState>('idle');

  /**
   * Deliberately lazy: the key is not requested on page load and never lives
   * in the bundle. It is fetched only when the visitor asks to support.
   */
  protected requestPixKey(): void {
    if (this.pixState() === 'loading') {
      return;
    }

    this.pixState.set('loading');
    this.pixError.set(null);
    this.copyState.set('idle');

    this.support.getPixKey().subscribe({
      next: (key) => {
        if (!key || key.trim().length === 0) {
          this.pixState.set('empty');
          this.pixKey.set(null);
          return;
        }
        this.pixKey.set(key.trim());
        this.pixState.set('loaded');
      },
      error: (error: unknown) => {
        this.pixState.set('error');
        this.pixError.set(getApiErrorMessage(error, 'Não foi possível buscar a chave Pix agora.'));
      },
    });
  }

  protected async copyPixKey(): Promise<void> {
    const key = this.pixKey();
    if (!key) {
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('clipboard-unavailable');
      }
      await navigator.clipboard.writeText(key);
      this.copyState.set('copied');
    } catch {
      this.copyState.set('error');
    }
  }
}
