import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CopilotUiService {
  private readonly state = signal({ open: false, question: '' });

  readonly isOpen = computed(() => this.state().open);
  readonly question = computed(() => this.state().question);

  open(question = ''): void {
    this.state.set({ open: true, question: question.trim() });
  }

  close(): void {
    this.state.set({ open: false, question: '' });
  }
}