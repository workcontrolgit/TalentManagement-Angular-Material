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

export interface NlEmployeeFilter {
  originalQuery: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeNumber: string;
  positionTitle: string;
  parsedExpression: string;
  executionTimeMs: number;
}

export interface SemanticPositionResult {
  id: string;
  positionNumber: string;
  positionTitle: string;
  positionDescription: string;
  departmentName: string;
  salaryRangeName: string;
  score: number;
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

  /**
   * Parse a natural language employee search query into structured filter parameters.
   * Calls POST /api/v1/ai/nl-employee-search
   */
  nlEmployeeSearch(query: string): Observable<NlEmployeeFilter> {
    return this.http.post<NlEmployeeFilter>(`${this.apiUrl}/ai/nl-employee-search`, { query });
  }

  /**
   * Find positions semantically similar to a natural-language query.
   * Calls POST /api/v1/positions/semantic-search
   * Requires VectorSearchEnabled feature flag on the .NET API.
   */
  semanticPositionSearch(queryText: string, topK = 10): Observable<SemanticPositionResult[]> {
    return this.http.post<SemanticPositionResult[]>(`${this.apiUrl}/positions/semantic-search`, {
      queryText,
      topK,
    });
  }
}
