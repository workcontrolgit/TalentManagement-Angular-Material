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
import { Subject } from 'rxjs';
import { debounceTime, switchMap, catchError, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs';
import { PageHeader } from '@shared';
import { AiService, NlEmployeeFilter } from '../../../services/api/ai.service';
import { EmployeeService } from '../../../services/api';
import { Employee } from '../../../models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ai-nl-search',
  standalone: true,
  templateUrl: './ai-nl-search.component.html',
  styleUrl: './ai-nl-search.component.scss',
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
    PageHeader,
  ],
})
export class AiNlSearchComponent implements OnDestroy {
  private aiService = inject(AiService);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  aiEnabled = environment.aiEnabled;

  query = '';
  loading = false;
  error = '';
  parsedExpression = '';
  results: Employee[] = [];
  displayedColumns = ['employeeNumber', 'fullName', 'positionTitle', 'departmentName', 'actions'];

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(600),
        switchMap(q => {
          if (!q.trim()) {
            this.results = [];
            this.parsedExpression = '';
            return of(null);
          }
          this.loading = true;
          this.error = '';
          return this.aiService.nlEmployeeSearch(q).pipe(
            catchError(err => {
              this.error = err?.error?.detail ?? 'Failed to parse query. Is the API running with AiEnabled: true?';
              this.loading = false;
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(filter => {
        if (!filter) {
          this.loading = false;
          return;
        }
        this.parsedExpression = filter.parsedExpression;
        this.applyFilter(filter);
      });
  }

  onQueryChange(): void {
    this.searchSubject.next(this.query);
  }

  private applyFilter(filter: NlEmployeeFilter): void {
    const params: Record<string, string> = {};
    if (filter.firstName) params['FirstName'] = filter.firstName;
    if (filter.lastName) params['LastName'] = filter.lastName;
    if (filter.email) params['Email'] = filter.email;
    if (filter.employeeNumber) params['EmployeeNumber'] = filter.employeeNumber;
    if (filter.positionTitle) params['PositionTitle'] = filter.positionTitle;

    this.employeeService.getAllPaged({ pageNumber: 1, pageSize: 50, ...params }).subscribe({
      next: response => {
        this.results = response.value;
        this.loading = false;
      },
      error: err => {
        console.error('Error loading employees:', err);
        this.error = 'Failed to load employee results.';
        this.loading = false;
      },
    });
  }

  clear(): void {
    this.query = '';
    this.results = [];
    this.parsedExpression = '';
    this.error = '';
  }

  viewEmployee(id: string): void {
    this.router.navigate(['/employees', id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
