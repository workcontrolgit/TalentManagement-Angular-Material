import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Employee, PagedResponse, PaginationParams } from '../../models';
import { EmployeeService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-employee-list',
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
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);

  employees: Employee[] = [];
  loading = false;

  // Pagination
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  pageSizeOptions = [5, 10, 25, 50, 100];

  // Table columns
  displayedColumns: string[] = [
    'employeeNumber',
    'name',
    'email',
    'phone',
    'salary',
    'actions',
  ];

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;

    const params: PaginationParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      orderBy: 'lastName',
    };

    this.employeeService.getPagedEmployees(params).subscribe({
      next: (response: PagedResponse<Employee>) => {
        this.employees = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading employees:', error);
        this.loading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1;
    this.loadEmployees();
  }

  getFullName(employee: Employee): string {
    const parts = [
      employee.prefix,
      employee.firstName,
      employee.middleName,
      employee.lastName,
    ].filter(Boolean);
    return parts.join(' ');
  }

  viewEmployee(employee: Employee): void {
    this.router.navigate(['/employees', employee.id]);
  }

  editEmployee(employee: Employee): void {
    this.router.navigate(['/employees', 'edit', employee.id]);
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete ${this.getFullName(employee)}?`)) {
      this.employeeService.delete(employee.id).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: error => {
          console.error('Error deleting employee:', error);
        },
      });
    }
  }

  createEmployee(): void {
    this.router.navigate(['/employees', 'create']);
  }

  canEdit(): boolean {
    return this.authService.isHRAdmin();
  }

  canDelete(): boolean {
    return this.authService.isHRAdmin();
  }

  canCreate(): boolean {
    return this.authService.isHRAdmin();
  }
}
