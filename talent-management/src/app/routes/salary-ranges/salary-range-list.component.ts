import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { SalaryRange, PaginationParams, PagedResponse } from '../../models';
import { SalaryRangeService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';

@Component({
  selector: 'app-salary-range-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './salary-range-list.component.html',
  styleUrl: './salary-range-list.component.scss',
})
export class SalaryRangeListComponent implements OnInit {
  private salaryRangeService = inject(SalaryRangeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  salaryRanges: SalaryRange[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  pageSizeOptions = [5, 10, 25, 50];
  displayedColumns: string[] = ['name', 'minSalary', 'maxSalary', 'actions'];

  ngOnInit(): void {
    this.loadSalaryRanges();
  }

  loadSalaryRanges(): void {
    this.loading = true;
    const params: PaginationParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      orderBy: 'name',
    };

    this.salaryRangeService.getPaged(params).subscribe({
      next: (response: PagedResponse<SalaryRange>) => {
        this.salaryRanges = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading salary ranges:', error);
        this.loading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1;
    this.loadSalaryRanges();
  }

  createSalaryRange(): void {
    this.router.navigate(['/salary-ranges/create']);
  }

  editSalaryRange(salaryRange: SalaryRange): void {
    this.router.navigate(['/salary-ranges/edit', salaryRange.id]);
  }

  deleteSalaryRange(salaryRange: SalaryRange): void {
    if (confirm(`Are you sure you want to delete ${salaryRange.name}?`)) {
      this.salaryRangeService.delete(salaryRange.id).subscribe({
        next: () => {
          this.loadSalaryRanges();
          this.showMessage('Salary range deleted successfully');
        },
        error: error => {
          console.error('Error deleting salary range:', error);
          this.showMessage('Error deleting salary range');
        },
      });
    }
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  canEdit(): boolean {
    return this.authService.hasRole('HRAdmin') || this.authService.hasRole('Manager');
  }
}
