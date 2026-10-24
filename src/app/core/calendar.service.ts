import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CalendarResponse } from './models';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);

  getCalendar(): Observable<CalendarResponse> {
    return this.http.get<CalendarResponse>('/api/v1/enem/calendar');
  }
}
