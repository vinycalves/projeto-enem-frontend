import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api/api';
import { listSubjects } from '../../core/api/fn/crate-subjects/list-subjects';
import { listTopics } from '../../core/api/fn/crate-topics/list-topics';
import {
  ListVisualizations$Params,
  listVisualizations,
} from '../../core/api/fn/crate-visualizations/list-visualizations';
import { SubjectDto } from '../../core/api/models/subject-dto';
import { TopicDto } from '../../core/api/models/topic-dto';
import { VisualizationSummary } from '../../core/api/models/visualization-summary';
import { getApiErrorMessage } from '../../core/api-error';

@Component({
  selector: 'app-catalog-page',
  imports: [RouterLink],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage implements OnInit {
  private readonly api = inject(Api);

  protected readonly items = signal<VisualizationSummary[]>([]);
  protected readonly subjects = signal<SubjectDto[]>([]);
  protected readonly topics = signal<TopicDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly total = signal(0);

  protected readonly subject = signal('');
  protected readonly dimension = signal('');
  protected readonly topic = signal('');
  protected readonly difficulty = signal('');
  protected readonly search = signal('');

  ngOnInit(): void {
    void this.loadFilters();
    void this.load();
  }

  protected async loadFilters(): Promise<void> {
    try {
      const [subjects, topics] = await Promise.all([
        this.api.invoke(listSubjects),
        this.api.invoke(listTopics),
      ]);
      this.subjects.set(subjects.subjects);
      this.topics.set(topics.subjects.flatMap((subject) => subject.topics));
    } catch {
      // Filters remain usable with empty options; the catalog error handles the main state.
    }
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const params: ListVisualizations$Params = {
      subject: this.subject() || null,
      dimension: this.dimension() || null,
      topic: this.topic() || null,
      difficulty: this.difficulty() || null,
      q: this.search().trim() || null,
      page: 1,
      per_page: 24,
    };

    try {
      const response = await this.api.invoke(listVisualizations, params);
      this.items.set(response.items);
      this.total.set(response.total);
    } catch (error) {
      this.error.set(getApiErrorMessage(error, 'Não foi possível carregar o catálogo.'));
    } finally {
      this.loading.set(false);
    }
  }

  protected setSubject(value: string): void {
    this.subject.set(value);
    void this.load();
  }

  protected setDimension(value: string): void {
    this.dimension.set(value);
    void this.load();
  }

  protected setTopic(value: string): void {
    this.topic.set(value);
    void this.load();
  }

  protected setDifficulty(value: string): void {
    this.difficulty.set(value);
    void this.load();
  }

  protected setSearch(value: string): void {
    this.search.set(value);
  }

  protected submitSearch(event: Event): void {
    event.preventDefault();
    void this.load();
  }

  protected clearFilters(): void {
    this.subject.set('');
    this.dimension.set('');
    this.topic.set('');
    this.difficulty.set('');
    this.search.set('');
    void this.load();
  }

  protected difficultyLabel(value: string): string {
    return (
      {
        basico: 'Básico',
        intermediario: 'Intermediário',
        avancado: 'Avançado',
      }[value] ?? value
    );
  }

  protected dimensionLabel(value: string): string {
    return value === '3d' ? '3D' : '2D';
  }
}
