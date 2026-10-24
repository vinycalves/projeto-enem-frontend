import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ExamsResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private readonly http = inject(HttpClient);

  getExams(): Observable<ExamsResponse> {
    return this.http.get<ExamsResponse>('/api/v1/exams');
  }
}
