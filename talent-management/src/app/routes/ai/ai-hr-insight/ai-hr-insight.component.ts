import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageHeader } from '@shared';
import { AiService, HrInsightResponse } from '../../../services/api/ai.service';
import { environment } from '../../../../environments/environment';

export interface HrMessage {
  role: 'user' | 'assistant';
  content: string;
  executionTimeMs?: number;
}

@Component({
  selector: 'app-ai-hr-insight',
  standalone: true,
  templateUrl: './ai-hr-insight.component.html',
  styleUrl: './ai-hr-insight.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    PageHeader,
  ],
})
export class AiHrInsightComponent implements OnDestroy {
  private aiService = inject(AiService);
  private destroy$ = new Subject<void>();

  aiEnabled = environment.aiEnabled;

  messages: HrMessage[] = [];
  input = '';
  loading = false;
  error = '';

  send(): void {
    const question = this.input.trim();
    if (!question || this.loading) return;

    this.messages.push({ role: 'user', content: question });
    this.input = '';
    this.loading = true;
    this.error = '';

    this.aiService
      .hrInsight(question)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: HrInsightResponse) => {
          this.messages.push({
            role: 'assistant',
            content: result.answer,
            executionTimeMs: result.executionTimeMs,
          });
          this.loading = false;
        },
        error: err => {
          this.error = err?.error?.detail ?? 'Failed to get HR insights. Is the API running with AiEnabled: true?';
          this.loading = false;
        },
      });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  clear(): void {
    this.messages = [];
    this.error = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
