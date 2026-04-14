import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageHeader } from '@shared';
import { HasRoleDirective } from '../../shared/directives/has-role.directive';
import { DashboardMetrics, DepartmentMetric, PositionMetric, SalaryRangeMetric } from '../../models';
import { DashboardService, AiService } from '../../services/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatSnackBarModule,
    BaseChartDirective,
    PageHeader,
    HasRoleDirective,
  ],
})
export class Dashboard implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private aiService = inject(AiService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  // Loading state
  loading = true;

  // Dashboard metrics
  metrics: DashboardMetrics | null = null;

  // AI Insights state
  aiEnabled = environment.aiEnabled;
  aiInsight = '';
  aiInsightLoading = false;
  aiInsightError = '';

  // Chart configurations
  departmentChartData: ChartConfiguration<'pie'>['data'] | null = null;
  departmentChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value} employees`;
          },
        },
      },
    },
  };

  positionChartData: ChartConfiguration<'bar'>['data'] | null = null;
  positionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.parsed.x} employees`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  genderChartData: ChartConfiguration<'doughnut'>['data'] | null = null;
  genderChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value} employees`;
          },
        },
      },
    },
  };

  salaryChartData: ChartConfiguration<'bar'>['data'] | null = null;
  salaryChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: context => {
            return `${context.parsed.y} employees`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  ngOnInit(): void {
    this.loadDashboardMetrics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardMetrics(): void {
    this.loading = true;

    this.dashboardService.getDashboardMetrics().subscribe({
      next: metrics => {
        this.metrics = metrics;
        this.prepareCharts(metrics);
        this.loading = false;
        if (this.aiEnabled) {
          this.loadAiInsight(metrics);
        }
      },
      error: error => {
        console.error('Error loading dashboard metrics:', error);
        this.showMessage('Error loading dashboard data');
        this.loading = false;
      },
    });
  }

  private loadAiInsight(metrics: DashboardMetrics): void {
    this.aiInsightLoading = true;
    this.aiInsightError = '';
    this.aiInsight = '';

    const systemPrompt = `You are an HR analytics assistant. Analyze the following workforce metrics and provide a concise executive summary (3-4 sentences) highlighting key observations, any notable patterns, and one actionable recommendation. Be specific — reference the actual numbers.

Workforce Metrics:
${JSON.stringify(metrics, null, 2)}`;

    const question = 'Provide a brief executive summary of the current workforce.';

    this.aiService
      .chat(question, systemPrompt)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.aiInsight = response.reply;
          this.aiInsightLoading = false;
        },
        error: err => {
          this.aiInsightError =
            err?.error?.detail ?? 'AI insights unavailable. Is the API running with AiEnabled: true?';
          this.aiInsightLoading = false;
        },
      });
  }

  private prepareCharts(metrics: DashboardMetrics): void {
    this.prepareDepartmentChart(metrics.employeesByDepartment);
    this.preparePositionChart(metrics.employeesByPosition);
    this.prepareGenderChart(metrics.genderDistribution);
    this.prepareSalaryChart(metrics.employeesBySalaryRange);
  }

  private prepareDepartmentChart(data: DepartmentMetric[]): void {
    if (!data || data.length === 0) {
      this.departmentChartData = null;
      return;
    }

    this.departmentChartData = {
      labels: data.map(d => d.departmentName),
      datasets: [
        {
          data: data.map(d => d.employeeCount),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
          ],
        },
      ],
    };
  }

  private preparePositionChart(data: PositionMetric[]): void {
    if (!data || data.length === 0) {
      this.positionChartData = null;
      return;
    }

    this.positionChartData = {
      labels: data.map(p => p.positionTitle),
      datasets: [
        {
          label: 'Employees',
          data: data.map(p => p.employeeCount),
          backgroundColor: '#36A2EB',
        },
      ],
    };
  }

  private prepareGenderChart(data: { male: number; female: number }): void {
    if (!data) {
      this.genderChartData = null;
      return;
    }

    this.genderChartData = {
      labels: ['Male', 'Female'],
      datasets: [
        {
          data: [data.male, data.female],
          backgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    };
  }

  private prepareSalaryChart(data: SalaryRangeMetric[]): void {
    if (!data || data.length === 0) {
      this.salaryChartData = null;
      return;
    }

    this.salaryChartData = {
      labels: data.map(s => s.rangeName),
      datasets: [
        {
          label: 'Employees',
          data: data.map(s => s.employeeCount),
          backgroundColor: '#4BC0C0',
        },
      ],
    };
  }

  // Navigation methods
  navigateToAddEmployee(): void {
    this.router.navigate(['/employees/create']);
  }

  navigateToAddDepartment(): void {
    this.router.navigate(['/departments/create']);
  }

  navigateToAddPosition(): void {
    this.router.navigate(['/positions/create']);
  }

  navigateToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  navigateToEmployee(id: string): void {
    this.router.navigate(['/employees', id]);
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
