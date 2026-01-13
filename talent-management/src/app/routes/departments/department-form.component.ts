import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { Department, CreateDepartmentCommand, UpdateDepartmentCommand } from '../../models';
import { DepartmentService } from '../../services/api';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
  ],
  templateUrl: './department-form.component.html',
  styleUrl: './department-form.component.scss',
})
export class DepartmentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private departmentService = inject(DepartmentService);

  departmentForm!: FormGroup;
  loading = false;
  isEditMode = false;
  departmentId?: string;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.departmentForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  checkEditMode(): void {
    this.departmentId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.departmentId;

    if (this.isEditMode && this.departmentId) {
      this.loadDepartment(this.departmentId);
    }
  }

  loadDepartment(id: string): void {
    this.loading = true;
    this.departmentService.getById(id).subscribe({
      next: (department: Department) => {
        this.departmentForm.patchValue({
          name: department.name,
        });
        this.loading = false;
      },
      error: error => {
        console.error('Error loading department:', error);
        this.showMessage('Error loading department');
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.departmentId) {
      const command: UpdateDepartmentCommand = {
        id: this.departmentId,
        ...this.departmentForm.value,
      };

      this.departmentService.updateDepartment(command).subscribe({
        next: () => {
          this.showMessage('Department updated successfully');
          this.router.navigate(['/departments']);
        },
        error: error => {
          console.error('Error updating department:', error);
          this.showMessage('Error updating department');
          this.loading = false;
        },
      });
    } else {
      const command: CreateDepartmentCommand = this.departmentForm.value;

      this.departmentService.createDepartment(command).subscribe({
        next: () => {
          this.showMessage('Department created successfully');
          this.router.navigate(['/departments']);
        },
        error: error => {
          console.error('Error creating department:', error);
          this.showMessage('Error creating department');
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/departments']);
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  getFormTitle(): string {
    return this.isEditMode ? 'Edit Department' : 'Create Department';
  }
}
