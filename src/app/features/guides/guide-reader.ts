import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import katex from 'katex';
import { guideBySlug, GuideMeta } from './guide-meta';

interface GuideHeading {
  id: string;
  text: string;
  level: number;
}

@Component({
  selector: 'app-guide-reader',
  imports: [RouterLink],
  templateUrl: './guide-reader.html',
  styleUrl: './guide-reader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideReader implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly guide = signal<GuideMeta | null>(null);
  protected readonly html = signal<SafeHtml | null>(null);
  protected readonly headings = signal<GuideHeading[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeHeading = signal('');
  protected readonly readingProgress = signal(0);
  protected readonly showToc = signal(true);

  protected readonly title = computed(() => this.guide()?.title ?? 'Guia');

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        void this.load(slug);
      }
    });
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
  }

  protected toggleToc(): void {
    this.showToc.update((value) => !value);
  }

  private async load(slug: string): Promise<void> {
    const meta = guideBySlug(slug);
    if (!meta) {
      this.loading.set(false);
      this.error.set('Guia não encontrado.');
      return;
    }
    this.guide.set(meta);
    this.loading.set(true);
    this.error.set(null);
    this.html.set(null);
    try {
      const response = await fetch(new URL(`guias/${meta.file}`, document.baseURI).toString());
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const markdown = await response.text();
      const rendered = this.renderMarkdown(markdown);
      this.html.set(this.sanitizer.bypassSecurityTrustHtml(rendered.html));
      this.headings.set(rendered.headings);
    } catch {
      this.error.set('Não foi possível carregar o guia. Verifique se o arquivo está disponível.');
    } finally {
      this.loading.set(false);
    }
  }

  private renderMarkdown(markdown: string): { html: string; headings: GuideHeading[] } {
    const withMath = this.renderMath(markdown);
    const output = marked.parse(withMath, { async: false }) as string;
    const document = new DOMParser().parseFromString(output, 'text/html');
    const used = new Map<string, number>();
    const headings: GuideHeading[] = [];
    for (const heading of document.querySelectorAll<HTMLHeadingElement>('h2, h3')) {
      const text = heading.textContent?.trim() ?? '';
      let id = this.slugify(text);
      const count = used.get(id) ?? 0;
      used.set(id, count + 1);
      if (count > 0) {
        id = `${id}-${count + 1}`;
      }
      heading.id = id;
      headings.push({ id, text, level: Number(heading.tagName.slice(1)) });
    }
    document.querySelectorAll('a[href^="http"]').forEach((anchor) => {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    });
    document.querySelectorAll('table').forEach((table) => {
      table.setAttribute('tabindex', '0');
    });
    return { html: document.body.innerHTML, headings };
  }

  private renderMath(markdown: string): string {
    const render = (expression: string, displayMode: boolean): string => {
      try {
        return katex.renderToString(expression.trim(), {
          displayMode,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return displayMode ? `\\[${expression}\\]` : `\\(${expression}\\)`;
      }
    };
    return markdown
      .replace(/\\\[([\s\S]+?)\\\]/g, (_match, expression: string) => render(expression, true))
      .replace(/\\\(([\s\S]+?)\\\)/g, (_match, expression: string) => render(expression, false));
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  private readonly onScroll = () => {
    const content = document.querySelector<HTMLElement>('.guide-markdown');
    if (!content) {
      return;
    }
    const rect = content.getBoundingClientRect();
    const total = Math.max(rect.height - window.innerHeight, 1);
    const progress = Math.min(1, Math.max(0, -rect.top / total));
    this.readingProgress.set(progress);
    const headings = this.headings();
    let active = headings[0]?.id ?? '';
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element && element.getBoundingClientRect().top <= 120) {
        active = heading.id;
      }
    }
    this.activeHeading.set(active);
  };
}
