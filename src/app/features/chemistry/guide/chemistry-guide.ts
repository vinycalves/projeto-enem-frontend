import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CHEMISTRY_GUIDE,
  ESSENTIAL_FORMULAS,
  GuidePriority,
  GuideTool,
  STUDY_METHOD,
} from './chemistry-guide-data';

type PriorityFilter = 'todas' | GuidePriority;

@Component({
  selector: 'app-chemistry-guide',
  imports: [RouterLink],
  templateUrl: './chemistry-guide.html',
  styleUrl: './chemistry-guide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChemistryGuide {
  protected readonly blocks = CHEMISTRY_GUIDE;
  protected readonly formulas = ESSENTIAL_FORMULAS;
  protected readonly studyMethod = STUDY_METHOD;
  protected readonly search = signal('');
  protected readonly priority = signal<PriorityFilter>('todas');
  protected readonly totalTopics = computed(() =>
    this.blocks.reduce((total, block) => total + block.topics.length, 0),
  );
  protected readonly interactiveTopics = computed(() =>
    this.blocks.reduce(
      (total, block) => total + block.topics.filter((topic) => topic.tool !== undefined).length,
      0,
    ),
  );
  protected readonly highTopics = computed(() =>
    this.blocks.reduce(
      (total, block) =>
        total + block.topics.filter((topic) => topic.priority === 'alta').length,
      0,
    ),
  );
  protected readonly filteredBlocks = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('pt-BR');
    const priority = this.priority();
    return this.blocks
      .map((block) => {
        const blockMatches = !query || block.title.toLocaleLowerCase('pt-BR').includes(query);
        const topics = block.topics.filter((topic) => {
          const priorityMatches = priority === 'todas' || topic.priority === priority;
          if (!priorityMatches) {
            return false;
          }
          if (!query || blockMatches) {
            return true;
          }
          return (
            topic.title.toLocaleLowerCase('pt-BR').includes(query) ||
            topic.bullets.some((bullet) => bullet.toLocaleLowerCase('pt-BR').includes(query)) ||
            topic.formulas?.some((formula) => formula.toLocaleLowerCase('pt-BR').includes(query))
          );
        });
        return { ...block, topics };
      })
      .filter((block) => block.topics.length > 0);
  });
  protected readonly activeFilters = computed(
    () => this.search().trim().length > 0 || this.priority() !== 'todas',
  );

  protected priorityLabel(priority: GuidePriority): string {
    return { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[priority];
  }

  protected setPriority(priority: PriorityFilter): void {
    this.priority.set(priority);
  }

  protected setSearch(value: string): void {
    this.search.set(value);
  }

  protected clearFilters(): void {
    this.search.set('');
    this.priority.set('todas');
  }

  protected toolParams(tool: GuideTool): Record<string, string> {
    return tool.process ? { process: tool.process } : {};
  }
}
