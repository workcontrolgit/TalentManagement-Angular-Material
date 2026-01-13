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
import { Department } from '../../models';
import { DepartmentService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-department-list',
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
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit, AfterViewInit {
  private departmentService = inject(DepartmentService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Department>([]);
  loading = false;

  // Table columns
  displayedColumns: string[] = ['name', 'actions'];

  ngOnInit(): void {
    this.loadDepartments();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartments(): void {
    this.loading = true;

    this.departmentService.getAll().subscribe({
      next: (departments: Department[]) => {
        this.dataSource.data = departments;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading departments:', error);
        this.loading = false;
      },
    });
  }

  viewDepartment(department: Department): void {
    this.router.navigate(['/departments', department.id]);
  }

  editDepartment(department: Department): void {
    this.router.navigate(['/departments', 'edit', department.id]);
  }

  deleteDepartment(department: Department): void {
    if (confirm(`Are you sure you want to delete ${department.name}?`)) {
      this.departmentService.delete(department.id).subscribe({
        next: () => {
          this.loadDepartments();
        },
        error: error => {
          console.error('Error deleting department:', error);
        },
      });
    }
  }

  createDepartment(): void {
    this.router.navigate(['/departments', 'create']);
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
