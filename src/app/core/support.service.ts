import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { PixResponse } from './models';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private readonly http = inject(HttpClient);

  /**
   * The Pix key lives only in the backend. This request happens when the
   * visitor explicitly asks to support the project, never during page load.
   */
  getPixKey(): Observable<string | null> {
    return this.http.get<PixResponse>('/api/v1/support/pix').pipe(
      map((response) => response.key),
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      }),
    );
  }
}
