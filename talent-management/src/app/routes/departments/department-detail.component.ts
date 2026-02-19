import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageHeader } from '@shared/components/page-header/page-header';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Department } from '../../models';
import { DepartmentService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-department-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './department-detail.component.html',
  styleUrl: './department-detail.component.scss',
})
export class DepartmentDetailComponent implements OnInit {
  private departmentService = inject(DepartmentService);
  private authService = inject(OidcAuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  department!: Department;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDepartment(id);
    }
  }

  loadDepartment(id: string): void {
    this.loading = true;

    this.departmentService.getById(id).subscribe({
      next: (department: Department) => {
        this.department = department;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading department:', error);
        this.showMessage('Error loading department');
        this.loading = false;
        this.router.navigate(['/departments']);
      },
    });
  }

  editDepartment(): void {
    this.router.navigate(['/departments', 'edit', this.department.id]);
  }

  deleteDepartment(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Department',
        message: `Are you sure you want to delete "${this.department.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.departmentService.delete(this.department.id).subscribe({
        next: () => {
          const snackBarRef = this.snackBar.open(`"${this.department.name}" has been deleted.`, 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          snackBarRef.afterDismissed().subscribe(() => this.router.navigate(['/departments']));
          snackBarRef.onAction().subscribe(() => this.router.navigate(['/departments']));
        },
        error: error => {
          console.error('Error deleting department:', error);
          this.showMessage('Failed to delete department. Please try again.');
        },
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/departments']);
  }

  canEdit(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  canDelete(): boolean {
    return this.authService.isHRAdmin();
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
