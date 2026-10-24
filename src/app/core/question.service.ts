import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AnswerResponse,
  AttemptResponse,
  CommentResponse,
  Discussion,
  Id,
  QuestionResponse,
  QuestionsResponse,
} from './models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly http = inject(HttpClient);

  getQuestions(conceptId: Id): Observable<QuestionsResponse> {
    const params = new HttpParams().set('concept_id', String(conceptId));
    return this.http.get<QuestionsResponse>('/api/v1/questions', { params });
  }

  getQuestion(questionId: Id): Observable<QuestionResponse> {
    return this.http.get<QuestionResponse>(`/api/v1/questions/${questionId}`);
  }

  submitAttempt(questionId: Id, selectedOption: string): Observable<AttemptResponse> {
    return this.http.post<AttemptResponse>(`/api/v1/questions/${questionId}/attempts`, {
      selected_option: selectedOption,
    });
  }

  getDiscussion(questionId: Id): Observable<Discussion> {
    return this.http.get<Discussion>(`/api/v1/questions/${questionId}/discussion`);
  }

  addComment(questionId: Id, body: string, optionLabel?: string): Observable<CommentResponse> {
    return this.http.post<CommentResponse>(`/api/v1/questions/${questionId}/comments`, {
      body,
      ...(optionLabel ? { option_label: optionLabel } : {}),
    });
  }

  reportComment(commentId: Id, reason: string): Observable<void> {
    return this.http.post<void>(`/api/v1/comments/${commentId}/report`, { reason });
  }

  getAnswer(questionId: Id): Observable<AnswerResponse> {
    return this.http.get<AnswerResponse>(`/api/v1/questions/${questionId}/answer`);
  }
}
