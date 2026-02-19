import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageHeader } from '@shared/components/page-header/page-header';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Employee, Gender } from '../../models';
import { EmployeeService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  employee?: Employee;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
    }
  }

  loadEmployee(id: string): void {
    this.loading = true;
    this.employeeService.getById(id).subscribe({
      next: (employee: Employee) => {
        this.employee = employee;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading employee:', error);
        this.loading = false;
        this.router.navigate(['/employees']);
      },
    });
  }

  getFullName(): string {
    if (!this.employee) return '';
    const parts = [
      this.employee.prefix,
      this.employee.firstName,
      this.employee.middleName,
      this.employee.lastName,
      this.employee.suffix,
    ].filter(Boolean);
    return parts.join(' ');
  }

  getGenderLabel(gender: Gender): string {
    return gender === Gender.Male ? 'Male' : 'Female';
  }

  editEmployee(): void {
    if (this.employee) {
      this.router.navigate(['/employees', 'edit', this.employee.id]);
    }
  }

  deleteEmployee(): void {
    if (!this.employee) return;

    const name = this.getFullName();
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Employee',
        message: `Are you sure you want to delete ${name}? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.employeeService.delete(this.employee!.id).subscribe({
        next: () => {
          const snackBarRef = this.snackBar.open(`${name} has been deleted.`, 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          snackBarRef.afterDismissed().subscribe(() => this.router.navigate(['/employees']));
          snackBarRef.onAction().subscribe(() => this.router.navigate(['/employees']));
        },
        error: error => {
          console.error('Error deleting employee:', error);
          this.snackBar.open('Failed to delete employee. Please try again.', 'Close', {
            duration: 4000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }

  canEdit(): boolean {
    return this.authService.isHRAdmin() || this.authService.isManager();
  }

  canDelete(): boolean {
    return this.authService.isHRAdmin();
  }
}
