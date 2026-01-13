import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import {
  Employee,
  CreateEmployeeCommand,
  UpdateEmployeeCommand,
  Gender,
  Department,
  Position,
  SalaryRange,
} from '../../models';
import { EmployeeService, DepartmentService, PositionService, SalaryRangeService } from '../../services/api';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PageHeader,
  ],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private positionService = inject(PositionService);
  private salaryRangeService = inject(SalaryRangeService);

  employeeForm!: FormGroup;
  loading = false;
  isEditMode = false;
  employeeId?: string;

  departments: Department[] = [];
  positions: Position[] = [];
  salaryRanges: SalaryRange[] = [];

  genderOptions = [
    { value: Gender.Male, label: 'Male' },
    { value: Gender.Female, label: 'Female' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadDependencies();
    this.checkEditMode();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      employeeNumber: ['', [Validators.required, Validators.maxLength(50)]],
      prefix: ['', Validators.maxLength(10)],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', Validators.maxLength(100)],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      suffix: ['', Validators.maxLength(10)],
      dateOfBirth: [null, Validators.required],
      gender: [Gender.Male, Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      address: ['', Validators.maxLength(500)],
      hireDate: [null, Validators.required],
      salary: [0, [Validators.required, Validators.min(0)]],
      departmentId: ['', Validators.required],
      positionId: ['', Validators.required],
      salaryRangeId: ['', Validators.required],
    });
  }

  loadDependencies(): void {
    this.departmentService.getAll().subscribe({
      next: departments => {
        this.departments = departments;
      },
      error: error => {
        console.error('Error loading departments:', error);
        this.showMessage('Error loading departments');
      },
    });

    this.positionService.getAll().subscribe({
      next: positions => {
        this.positions = positions;
      },
      error: error => {
        console.error('Error loading positions:', error);
        this.showMessage('Error loading positions');
      },
    });

    this.salaryRangeService.getAll().subscribe({
      next: salaryRanges => {
        this.salaryRanges = salaryRanges;
      },
      error: error => {
        console.error('Error loading salary ranges:', error);
        this.showMessage('Error loading salary ranges');
      },
    });
  }

  checkEditMode(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEditMode = !!this.employeeId;

    if (this.isEditMode && this.employeeId) {
      this.loadEmployee(this.employeeId);
    }
  }

  loadEmployee(id: string): void {
    this.loading = true;
    this.employeeService.getById(id).subscribe({
      next: (employee: Employee) => {
        this.employeeForm.patchValue({
          employeeNumber: employee.employeeNumber,
          prefix: employee.prefix,
          firstName: employee.firstName,
          middleName: employee.middleName,
          lastName: employee.lastName,
          suffix: employee.suffix,
          dateOfBirth: employee.dateOfBirth,
          gender: employee.gender,
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          address: employee.address,
          hireDate: employee.hireDate,
          salary: employee.salary,
          departmentId: employee.departmentId,
          positionId: employee.positionId,
          salaryRangeId: employee.salaryRangeId,
        });
        this.loading = false;
      },
      error: error => {
        console.error('Error loading employee:', error);
        this.showMessage('Error loading employee');
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.employeeId) {
      const command: UpdateEmployeeCommand = {
        id: this.employeeId,
        ...this.employeeForm.value,
      };

      this.employeeService.updateEmployee(command).subscribe({
        next: () => {
          this.showMessage('Employee updated successfully');
          this.router.navigate(['/employees']);
        },
        error: error => {
          console.error('Error updating employee:', error);
          this.showMessage('Error updating employee');
          this.loading = false;
        },
      });
    } else {
      const command: CreateEmployeeCommand = this.employeeForm.value;

      this.employeeService.createEmployee(command).subscribe({
        next: () => {
          this.showMessage('Employee created successfully');
          this.router.navigate(['/employees']);
        },
        error: error => {
          console.error('Error creating employee:', error);
          this.showMessage('Error creating employee');
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/employees']);
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  getFormTitle(): string {
    return this.isEditMode ? 'Edit Employee' : 'Create Employee';
  }
}
