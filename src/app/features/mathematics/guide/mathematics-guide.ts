import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  MATH_CHECKLIST,
  MATH_COMMON_MISTAKES,
  MATH_FORMULAS,
  MATH_STUDY_METHOD,
  MATH_STUDY_SEQUENCE,
  MATHEMATICS_GUIDE,
  MathPriority,
  MathTool,
} from './mathematics-guide-data';

type PriorityFilter = 'todas' | MathPriority;

@Component({
  selector: 'app-mathematics-guide',
  imports: [RouterLink],
  templateUrl: './mathematics-guide.html',
  styleUrl: './mathematics-guide.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MathematicsGuide {
  protected readonly blocks = MATHEMATICS_GUIDE;
  protected readonly formulas = MATH_FORMULAS;
  protected readonly studyMethod = MATH_STUDY_METHOD;
  protected readonly commonMistakes = MATH_COMMON_MISTAKES;
  protected readonly sequence = MATH_STUDY_SEQUENCE;
  protected readonly checklist = MATH_CHECKLIST;
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
      (total, block) => total + block.topics.filter((topic) => topic.priority === 'alta').length,
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

  protected priorityLabel(priority: MathPriority): string {
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

  protected toolParams(tool: MathTool): Record<string, string> {
    return tool.process ? { process: tool.process } : {};
  }
}
