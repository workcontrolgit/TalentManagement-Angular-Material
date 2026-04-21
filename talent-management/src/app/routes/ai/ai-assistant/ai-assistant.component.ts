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
import { AiService } from '../../../services/api/ai.service';
import { environment } from '../../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
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
export class AiAssistantComponent implements OnDestroy {
  private aiService = inject(AiService);
  private destroy$ = new Subject<void>();

  aiEnabled = environment.aiEnabled;

  messages: ChatMessage[] = [];
  input = '';
  loading = false;
  error = '';

  send(): void {
    const message = this.input.trim();
    if (!message || this.loading) return;

    this.messages.push({ role: 'user', content: message });
    this.input = '';
    this.loading = true;
    this.error = '';

    this.aiService
      .chat(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.messages.push({ role: 'assistant', content: response.reply });
          this.loading = false;
        },
        error: err => {
          this.error = err?.error?.detail ?? 'Failed to get a response. Is the API running with AiEnabled: true?';
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
