import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAtom,
  lucideBookText,
  lucideBrain,
  lucideCpu,
  lucideDna,
  lucideDumbbell,
  lucideFeather,
  lucideFlaskConical,
  lucideGlobe2,
  lucideLandmark,
  lucideLanguages,
  lucideLibraryBig,
  lucidePalette,
  lucidePenLine,
  lucideSigma,
  lucideUsers,
} from '@ng-icons/lucide';
import { GUIDE_AREAS, GUIDE_META, GuideArea } from './guide-meta';

type AreaFilter = GuideArea | 'todas';

@Component({
  selector: 'app-guide-library',
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({
      lucideAtom,
      lucideBookText,
      lucideBrain,
      lucideCpu,
      lucideDna,
      lucideDumbbell,
      lucideFeather,
      lucideFlaskConical,
      lucideGlobe2,
      lucideLandmark,
      lucideLanguages,
      lucideLibraryBig,
      lucidePalette,
      lucidePenLine,
      lucideSigma,
      lucideUsers,
    }),
  ],
  templateUrl: './guide-library.html',
  styleUrl: './guide-library.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideLibrary {
  protected readonly guides = GUIDE_META;
  protected readonly areas = GUIDE_AREAS;
  protected readonly search = signal('');
  protected readonly area = signal<AreaFilter>('todas');
  protected readonly subjectGuides = computed(() => this.guides.filter((guide) => guide.area !== 'geral'));
  protected readonly filtered = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('pt-BR');
    const area = this.area();
    return this.guides.filter((guide) => {
      const areaMatches = area === 'todas' || guide.area === area;
      if (!areaMatches) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        guide.title.toLocaleLowerCase('pt-BR').includes(query) ||
        guide.description.toLocaleLowerCase('pt-BR').includes(query) ||
        guide.priority.toLocaleLowerCase('pt-BR').includes(query)
      );
    });
  });

  protected setArea(area: AreaFilter): void {
    this.area.set(area);
  }

  protected setSearch(value: string): void {
    this.search.set(value);
  }

  protected clear(): void {
    this.search.set('');
    this.area.set('todas');
  }
}
