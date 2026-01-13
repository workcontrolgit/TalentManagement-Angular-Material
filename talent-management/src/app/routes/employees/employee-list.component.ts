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
import { MatSort, MatSortModule } from '@angular/material/sort';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Employee } from '../../models';
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
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Employee>([]);
  loading = false;

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

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEmployees(): void {
    this.loading = true;

    this.employeeService.getAll().subscribe({
      next: (employees: Employee[]) => {
        this.dataSource.data = employees;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading employees:', error);
        this.loading = false;
      },
    });
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
