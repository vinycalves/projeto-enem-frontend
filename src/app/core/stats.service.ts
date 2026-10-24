import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { StatsResponse } from './models';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);

  getMyStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>('/api/v1/me/stats');
  }
}
