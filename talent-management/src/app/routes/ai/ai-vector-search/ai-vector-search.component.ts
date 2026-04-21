import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { PageHeader } from '@shared';
import { AiService, SemanticPositionResult } from '../../../services/api/ai.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ai-vector-search',
  standalone: true,
  templateUrl: './ai-vector-search.component.html',
  styleUrl: './ai-vector-search.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule,
    PageHeader,
  ],
})
export class AiVectorSearchComponent implements OnDestroy {
  private aiService = inject(AiService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  aiEnabled = environment.aiEnabled;

  query = '';
  loading = false;
  error = '';
  results: SemanticPositionResult[] = [];
  displayedColumns = ['score', 'positionNumber', 'positionTitle', 'departmentName', 'salaryRangeName', 'actions'];

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(600),
        switchMap(q => {
          if (!q.trim()) {
            this.results = [];
            return of(null);
          }
          this.loading = true;
          this.error = '';
          return this.aiService.semanticPositionSearch(q).pipe(
            catchError(err => {
              this.error = err?.error?.detail ?? 'Failed to search. Is the API running with VectorSearchEnabled: true?';
              this.loading = false;
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        if (results === null) {
          this.loading = false;
          return;
        }
        this.results = results;
        this.loading = false;
      });
  }

  onQueryChange(): void {
    this.searchSubject.next(this.query);
  }

  clear(): void {
    this.query = '';
    this.results = [];
    this.error = '';
  }

  viewPosition(id: string): void {
    this.router.navigate(['/positions', id]);
  }

  scorePercent(score: number): string {
    return `${Math.round(score * 100)}%`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
