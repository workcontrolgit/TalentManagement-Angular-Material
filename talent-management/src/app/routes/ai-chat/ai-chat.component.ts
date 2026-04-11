import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PageHeader } from '@shared';
import { AiService } from '../../services/api/ai.service';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  executionTimeMs?: number;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    PageHeader,
  ],
})
export class AiChatComponent implements OnDestroy {
  private aiService = inject(AiService);
  private destroy$ = new Subject<void>();

  aiEnabled = environment.aiEnabled;

  // General chat state
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;
  chatError = '';

  // HR insight state
  hrMessages: ChatMessage[] = [];
  hrInput = '';
  hrLoading = false;
  hrError = '';

  sendChat(): void {
    const message = this.chatInput.trim();
    if (!message || this.chatLoading) return;

    this.chatMessages.push({ role: 'user', content: message });
    this.chatInput = '';
    this.chatLoading = true;
    this.chatError = '';

    this.aiService
      .chat(message)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: response => {
          this.chatMessages.push({ role: 'assistant', content: response.reply });
          this.chatLoading = false;
        },
        error: err => {
          this.chatError = err?.error?.detail ?? 'Failed to get a response. Is the API running with AiEnabled: true?';
          this.chatLoading = false;
        },
      });
  }

  sendHrInsight(): void {
    const question = this.hrInput.trim();
    if (!question || this.hrLoading) return;

    this.hrMessages.push({ role: 'user', content: question });
    this.hrInput = '';
    this.hrLoading = true;
    this.hrError = '';

    this.aiService
      .hrInsight(question)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          if (result.succeeded && result.data) {
            this.hrMessages.push({
              role: 'assistant',
              content: result.data.answer,
              executionTimeMs: result.data.executionTimeMs,
            });
          } else {
            this.hrError = result.message ?? 'Unexpected response from HR insights endpoint.';
          }
          this.hrLoading = false;
        },
        error: err => {
          this.hrError = err?.error?.detail ?? 'Failed to get HR insights. Is the API running with AiEnabled: true?';
          this.hrLoading = false;
        },
      });
  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendChat();
    }
  }

  onHrKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendHrInsight();
    }
  }

  clearChat(): void {
    this.chatMessages = [];
    this.chatError = '';
  }

  clearHr(): void {
    this.hrMessages = [];
    this.hrError = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
