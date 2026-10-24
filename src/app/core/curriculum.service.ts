import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AreasResponse, ConceptResponse, Id, SubjectConceptsResponse } from './models';

@Injectable({ providedIn: 'root' })
export class CurriculumService {
  private readonly http = inject(HttpClient);

  getAreas(): Observable<AreasResponse> {
    return this.http.get<AreasResponse>('/api/v1/curriculum/areas');
  }

  getSubjectConcepts(subjectId: Id): Observable<SubjectConceptsResponse> {
    return this.http.get<SubjectConceptsResponse>(
      `/api/v1/curriculum/subjects/${subjectId}/concepts`,
    );
  }

  getConcept(conceptId: Id): Observable<ConceptResponse> {
    return this.http.get<ConceptResponse>(`/api/v1/curriculum/concepts/${conceptId}`);
  }
}
