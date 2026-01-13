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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeader } from '@shared/components/page-header/page-header';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { Position, PaginationParams, PagedResponse } from '../../models';
import { PositionService } from '../../services/api';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';

@Component({
  selector: 'app-position-list',
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    FormsModule,
    PageHeader,
    HasRoleDirective,
  ],
  templateUrl: './position-list.component.html',
  styleUrl: './position-list.component.scss',
})
export class PositionListComponent implements OnInit {
  private positionService = inject(PositionService);
  private authService = inject(OidcAuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  positions: Position[] = [];
  loading = false;
  totalCount = 0;
  pageSize = 10;
  pageNumber = 1;
  pageSizeOptions = [5, 10, 25, 50];
  displayedColumns: string[] = ['positionNumber', 'positionTitle', 'departmentId', 'salaryRangeId', 'actions'];

  ngOnInit(): void {
    this.loadPositions();
  }

  loadPositions(): void {
    this.loading = true;
    const params: PaginationParams = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      orderBy: 'positionTitle',
    };

    this.positionService.getPaged(params).subscribe({
      next: (response: PagedResponse<Position>) => {
        this.positions = response.items;
        this.totalCount = response.totalCount;
        this.loading = false;
      },
      error: error => {
        console.error('Error loading positions:', error);
        this.loading = false;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageNumber = event.pageIndex + 1;
    this.loadPositions();
  }

  createPosition(): void {
    this.router.navigate(['/positions/create']);
  }

  editPosition(position: Position): void {
    this.router.navigate(['/positions/edit', position.id]);
  }

  deletePosition(position: Position): void {
    if (confirm(`Are you sure you want to delete ${position.positionTitle}?`)) {
      this.positionService.delete(position.id).subscribe({
        next: () => {
          this.loadPositions();
          this.showMessage('Position deleted successfully');
        },
        error: error => {
          console.error('Error deleting position:', error);
          this.showMessage('Error deleting position');
        },
      });
    }
  }

  addMockData(): void {
    const rowCount = prompt('How many mock positions would you like to add?', '10');
    if (rowCount) {
      const count = parseInt(rowCount, 10);
      if (count > 0 && count <= 100) {
        this.loading = true;
        this.positionService.addMockPositions({ rowCount: count }).subscribe({
          next: () => {
            this.showMessage(`${count} mock positions added successfully`);
            this.loadPositions();
          },
          error: error => {
            console.error('Error adding mock positions:', error);
            this.showMessage('Error adding mock positions');
            this.loading = false;
          },
        });
      } else {
        this.showMessage('Please enter a number between 1 and 100');
      }
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
