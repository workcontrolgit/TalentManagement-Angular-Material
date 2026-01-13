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
import { Department, PagedResponse, PaginationParams } from '../../models';
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './department-list.component.html',
  styleUrl: './department-list.component.scss',
})
export class DepartmentListComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);

  departments: Department[] = [];
  loading = false;

  // Pagination
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  pageSizeOptions = [5, 10, 25, 50];

  // Table columns
  displayedColumns: string[] = ['name', 'actions'];

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;

    const params: PaginationParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      orderBy: 'name',
    };

    this.departmentService.getPaged(params).subscribe({
      next: (response: PagedResponse<Department>) => {
        this.departments = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading departments:', error);
        this.loading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1;
    this.loadDepartments();
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
