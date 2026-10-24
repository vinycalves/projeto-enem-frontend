import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../core/api-error';
import { ExamService } from '../../core/exam.service';
import { Exam } from '../../core/models';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Loading } from '../../shared/loading/loading';

interface ExamGroup {
  areaCode: string;
  areaName: string;
  areaColor: string;
  exams: Exam[];
}

@Component({
  selector: 'app-exams-page',
  imports: [RouterLink, Loading, EmptyState],
  templateUrl: './exams-page.html',
  styleUrl: './exams-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamsPage implements OnInit {
  private readonly examService = inject(ExamService);

  protected readonly exams = signal<Exam[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly groups = computed<ExamGroup[]>(() => {
    const groups = new Map<string, ExamGroup>();

    for (const exam of this.exams()) {
      const group = groups.get(exam.area_code) ?? {
        areaCode: exam.area_code,
        areaName: exam.area_name,
        areaColor: exam.area_color,
        exams: [],
      };
      group.exams.push(exam);
      groups.set(exam.area_code, group);
    }

    return [...groups.values()].map((group) => ({
      ...group,
      exams: [...group.exams].sort((a, b) => b.year - a.year),
    }));
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.examService
      .getExams()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ exams }) => this.exams.set(exams),
        error: (error: unknown) => {
          this.error.set(getApiErrorMessage(error, 'Não foi possível carregar as provas oficiais.'));
        },
      });
  }

  protected areaAccent(exam: Exam): string {
    const color = exam.area_color?.trim();
    return color && /^(#[0-9a-f]{3,8}|[a-z]+)$/i.test(color) ? color : 'var(--forest)';
  }

  protected questionCountLabel(count: number): string {
    return count === 1 ? '1 questão' : `${count} questões`;
  }
}
