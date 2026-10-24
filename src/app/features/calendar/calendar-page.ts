import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { CalendarService } from '../../core/calendar.service';
import { daysUntilFirstExam, formatDateRange, formatLongDateBR } from '../../core/dates';
import { eventKindLabel, eventKindTone } from '../../core/labels';
import { CalendarEvent } from '../../core/models';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-calendar-page',
  imports: [Loading, EmptyState],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage implements OnInit {
  private readonly calendarService = inject(CalendarService);

  protected readonly events = signal<CalendarEvent[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly daysToExam = daysUntilFirstExam();
  protected readonly firstExamLabel = formatLongDateBR('2026-11-08');
  protected readonly sortedEvents = computed(() =>
    [...this.events()].sort((a, b) => {
      if (!a.starts_on && !b.starts_on) {
        return a.title.localeCompare(b.title, 'pt-BR');
      }
      if (!a.starts_on) {
        return 1;
      }
      if (!b.starts_on) {
        return -1;
      }
      return a.starts_on.localeCompare(b.starts_on);
    }),
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.calendarService
      .getCalendar()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => this.events.set(response.events),
        error: (error: unknown) => {
          this.error.set(
            getApiErrorMessage(error, 'Não foi possível carregar o calendário do ENEM.'),
          );
        },
      });
  }

  protected kindLabel(kind: string): string {
    return eventKindLabel(kind);
  }

  protected kindClass(kind: string): string {
    return `event-kind event-kind--${eventKindTone(kind)}`;
  }

  protected dateRange(event: CalendarEvent): string {
    return formatDateRange(event.starts_on, event.ends_on);
  }

  protected countdownLabel(): string {
    if (this.daysToExam < 0) {
      return 'A data da primeira prova já passou.';
    }
    if (this.daysToExam === 0) {
      return 'A primeira prova é hoje.';
    }
    return this.daysToExam === 1 ? 'dia até a primeira prova.' : 'dias até a primeira prova.';
  }
}
