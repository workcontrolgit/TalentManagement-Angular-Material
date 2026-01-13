import { Component, OnInit, inject, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { PageHeader } from '@shared/components/page-header/page-header';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { SalaryRange } from '../../models';
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
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './salary-range-list.component.html',
  styleUrl: './salary-range-list.component.scss',
})
export class SalaryRangeListComponent implements OnInit, AfterViewInit {
  private salaryRangeService = inject(SalaryRangeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<SalaryRange>([]);
  loading = false;
  displayedColumns: string[] = ['name', 'minSalary', 'maxSalary', 'actions'];

  ngOnInit(): void {
    this.loadSalaryRanges();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSalaryRanges(): void {
    this.loading = true;

    this.salaryRangeService.getAll().subscribe({
      next: (salaryRanges: SalaryRange[]) => {
        this.dataSource.data = salaryRanges;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading salary ranges:', error);
        this.loading = false;
      },
    });
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
