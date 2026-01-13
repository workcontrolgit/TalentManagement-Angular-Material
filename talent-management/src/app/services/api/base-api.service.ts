import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginationParams, PagedResponse, QueryParams } from '../../models';

/**
 * Base API Service
 * Provides common HTTP methods for all entity services
 */
export abstract class BaseApiService<T> {
  protected http = inject(HttpClient);
  protected apiUrl = environment.apiUrl;

  /**
   * Abstract property for entity endpoint
   * Must be implemented by derived classes
   */
  protected abstract readonly endpoint: string;

  /**
   * Get list of entities
   */
  getAll(params?: QueryParams): Observable<T[]> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<T[]>(`${this.apiUrl}/${this.endpoint}`, { params: httpParams });
  }

  /**
   * Get entity by ID
   */
  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }

  /**
   * Create new entity
   */
  create(data: Partial<T>): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${this.endpoint}`, data);
  }

  /**
   * Update existing entity
   */
  update(id: string, data: Partial<T>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${this.endpoint}/${id}`, data);
  }

  /**
   * Delete entity
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${this.endpoint}/${id}`);
  }

  /**
   * Get paged list of entities
   */
  getPaged(params?: PaginationParams): Observable<PagedResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.post<PagedResponse<T>>(
      `${this.apiUrl}/${this.endpoint}/Paged`,
      {},
      { params: httpParams }
    );
  }

  /**
   * Build HttpParams from query parameters
   */
  protected buildHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }
}
