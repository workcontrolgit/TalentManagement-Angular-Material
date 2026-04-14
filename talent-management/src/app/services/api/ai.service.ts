import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AiChatResponse {
  reply: string;
}

export interface HrInsightResponse {
  question: string;
  answer: string;
  executionTimeMs: number;
}

/**
 * AI API Service
 * Calls /api/v1/ai/chat and /api/v1/ai/hr-insight endpoints.
 * Requires AiEnabled feature flag to be true in the .NET API.
 */
@Injectable({
  providedIn: 'root',
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * Send a message to the general-purpose AI assistant.
   * Calls POST /api/v1/ai/chat
   */
  chat(message: string, systemPrompt?: string): Observable<AiChatResponse> {
    return this.http.post<AiChatResponse>(`${this.apiUrl}/ai/chat`, {
      message,
      systemPrompt,
    });
  }

  /**
   * Ask the HR AI assistant a data-aware question.
   * Calls POST /api/v1/ai/hr-insight — the backend injects live workforce metrics.
   */
  hrInsight(question: string): Observable<HrInsightResponse> {
    return this.http.post<HrInsightResponse>(`${this.apiUrl}/ai/hr-insight`, {
      question,
    });
  }
}
