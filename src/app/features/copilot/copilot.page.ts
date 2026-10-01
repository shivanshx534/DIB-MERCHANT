import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnChanges, PLATFORM_ID, input, output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon.component';
import { MerchantCopilotService } from '../../core/services/merchant-copilot.service';

interface ChatMessage {
  role: 'assistant' | 'user';
  text: string;
}

@Component({
  selector: 'mm-copilot-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.drawer-mode]': 'drawerMode()',
  },
  template: `
    <section class="copilot-page">
      <header class="copilot-header">
        <div class="assistant-mark"><mm-icon name="sparkles" [size]="19" /></div>
        <div class="heading">
          <h1>Merchant Copilot</h1>
          <p>Answers are based on the merchant data available in this prototype.</p>
        </div>
        @if (drawerMode()) {
          <button class="close-drawer" type="button" aria-label="Close Merchant Copilot" title="Close" (click)="close.emit()">
            <mm-icon name="chevron-right" [size]="18" />
          </button>
        } @else {
          <span class="connection" aria-label="Merchant data assistant"><span></span>Data assistant</span>
        }
      </header>

      <div class="conversation" #conversation aria-live="polite" aria-relevant="additions text">
        @for (message of messages(); track $index) {
          <article class="message-row" [class.user-row]="message.role === 'user'">
            @if (message.role === 'assistant') {
              <div class="assistant-label">Merchant Copilot</div>
            }
            <div class="message" [class.user-message]="message.role === 'user'">{{ message.text }}</div>
          </article>
        }
        @if (sending()) {
          <div class="message-row" role="status">
            <div class="assistant-label">Merchant Copilot</div>
            <div class="message typing"><span></span><span></span><span></span></div>
          </div>
        }
      </div>

      <section class="suggestions" aria-label="Suggested questions">
        <p>Try asking</p>
        @for (prompt of suggestions; track prompt) {
          <button type="button" (click)="send(prompt)" [disabled]="sending()">{{ prompt }}</button>
        }
      </section>

      @if (error(); as message) {
        <p class="error" role="alert">{{ message }}</p>
      }

      <form class="composer" (ngSubmit)="sendDraft()">
        <label class="visually-hidden" for="copilot-question">Ask about your merchant data</label>
        <input
          id="copilot-question"
          name="question"
          [(ngModel)]="draftValue"
          [disabled]="sending()"
          placeholder="Ask about your merchant data..."
          autocomplete="off"
        />
        <button type="submit" aria-label="Send message" title="Send message" [disabled]="sending() || !draftValue.trim()">
          <mm-icon name="arrow-up" [size]="17" [stroke]="2.5" />
        </button>
      </form>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100%; }
    .copilot-page {
      display: flex; flex-direction: column; width: min(100%, 780px); min-height: min(760px, calc(100dvh - 112px));
      margin: 0 auto; background: var(--mm-surface); border: 1px solid var(--mm-border); border-radius: 12px;
      box-shadow: var(--mm-shadow-card); overflow: hidden;
    }
    .copilot-header { display: flex; align-items: center; gap: 12px; min-height: 76px; padding: 14px 20px; border-bottom: 1px solid var(--mm-border); }
    .assistant-mark { display: grid; place-items: center; width: 38px; height: 38px; flex: none; border-radius: 10px; background: var(--mm-brand-50); color: var(--mm-brand-600); }
    .heading { min-width: 0; flex: 1; }
    h1 { margin: 0; color: var(--mm-text-1); font-size: 17px; font-weight: 700; }
    .heading p { margin: 3px 0 0; color: var(--mm-text-3); font-size: 12px; }
    .connection { display: inline-flex; align-items: center; gap: 7px; color: var(--mm-text-3); font-size: 11px; white-space: nowrap; }
    .connection span { width: 7px; height: 7px; border-radius: 50%; background: var(--mm-brand-400); }
    .close-drawer { display: grid; place-items: center; width: 42px; height: 42px; flex: none; border: 1px solid var(--mm-border); border-radius: 50%; background: #fff; color: var(--mm-text-2); cursor: pointer; }
    .close-drawer:hover { border-color: var(--mm-brand-400); color: var(--mm-brand-600); }
    .conversation { display: flex; flex: 1; flex-direction: column; align-items: stretch; gap: 16px; min-height: 250px; padding: 22px 18px; overflow-y: auto; }
    .message-row { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; max-width: 88%; }
    .user-row { align-self: flex-end; align-items: flex-end; }
    .assistant-label { padding-inline: 3px; color: var(--mm-text-1); font-size: 12px; font-weight: 700; }
    .message { padding: 12px 14px; border-radius: 4px 12px 12px 12px; background: var(--mm-surface-muted); color: var(--mm-text-1); font-size: 13px; line-height: 1.55; overflow-wrap: anywhere; white-space: pre-wrap; }
    .user-message { border-radius: 12px 4px 12px 12px; background: var(--mm-brand-600); color: #fff; }
    .typing { display: flex; gap: 4px; align-items: center; min-width: 56px; min-height: 38px; }
    .typing span { width: 5px; height: 5px; border-radius: 50%; background: var(--mm-text-3); animation: pulse 1s infinite ease-in-out; }
    .typing span:nth-child(2) { animation-delay: 120ms; }.typing span:nth-child(3) { animation-delay: 240ms; }
    @keyframes pulse { 0%, 60%, 100% { opacity: .35; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
    .suggestions { display: grid; gap: 8px; padding: 0 18px 16px; }
    .suggestions p { margin: 0 0 1px; color: var(--mm-text-3); font-size: 11px; }
    .suggestions button { min-height: 40px; padding: 9px 12px; border: 1px solid var(--mm-border); border-radius: 8px; background: #fff; color: var(--mm-text-1); font: inherit; font-size: 12px; text-align: left; cursor: pointer; }
    .suggestions button:hover { border-color: var(--mm-brand-400); background: var(--mm-brand-50); }
    .suggestions button:disabled { cursor: wait; opacity: .6; }
    .error { margin: 0 18px 10px; color: var(--mm-danger-text); font-size: 12px; }
    .composer { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-top: 1px solid var(--mm-border); background: var(--mm-surface); }
    .composer input { min-width: 0; flex: 1; height: 42px; padding: 0 13px; border: 1px solid var(--mm-border); border-radius: 9px; outline: 0; color: var(--mm-text-1); font: inherit; font-size: 13px; }
    .composer input:focus { border-color: var(--mm-brand-600); box-shadow: 0 0 0 3px var(--mm-brand-50); }
    .composer button { display: grid; place-items: center; width: 42px; height: 42px; flex: none; border: 0; border-radius: 50%; background: #a4123f; color: #fff; cursor: pointer; }
    .composer button:disabled { opacity: .5; cursor: not-allowed; }
    .visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    :host(.drawer-mode) { width: 100%; height: 100%; min-height: 0; }
    :host(.drawer-mode) .copilot-page { width: 100%; height: 100%; min-height: 0; margin: 0; border: 0; border-radius: 0; box-shadow: none; }
    :host(.drawer-mode) .conversation { min-height: 0; }
    @media (max-width: 767px) {
      .copilot-page { min-height: calc(100dvh - 88px); border-inline: 0; border-radius: 0; }
      .copilot-header { padding: 12px 14px; }.connection { display: none; }
      .conversation { padding: 18px 12px; }.message-row { max-width: 94%; }
      .suggestions { padding-inline: 12px; }.composer { padding: 10px 12px; }
      :host(.drawer-mode) .copilot-page { min-height: 0; }
    }
  `],
})
export class CopilotPage implements OnChanges {
  private readonly copilot = inject(MerchantCopilotService);
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  readonly drawerMode = input(false);
  readonly initialQuestion = input('');
  readonly close = output<void>();
  protected readonly merchantId = 'merchant-1';
  protected readonly messages = signal<ChatMessage[]>([
    { role: 'assistant', text: 'Hello. What would you like to know about your merchant data?' },
  ]);
  protected readonly sending = signal(false);
  protected readonly error = signal('');
  protected draftValue = '';
  protected readonly suggestions = [
    'Which invoices need attention?',
    'How are payments trending?',
    'What should I do next?',
  ];

  constructor() {
    const routeQuestion = this.route.snapshot.queryParamMap.get('question')?.trim();
    if (routeQuestion && isPlatformBrowser(this.platformId)) {
      this.send(routeQuestion);
    } else if (routeQuestion) {
      this.draftValue = routeQuestion;
    }
  }

  ngOnChanges(): void {
    const question = this.initialQuestion().trim();
    if (!question) return;
    if (isPlatformBrowser(this.platformId)) {
      this.send(question);
    } else {
      this.draftValue = question;
    }
  }

  sendDraft(): void {
    this.send(this.draftValue);
  }

  send(question: string): void {
    const normalizedQuestion = question.trim();
    if (!normalizedQuestion || this.sending()) return;

    this.draftValue = '';
    this.error.set('');
    this.messages.update((messages) => [...messages, { role: 'user', text: normalizedQuestion }]);
    this.sending.set(true);

    this.copilot.query(normalizedQuestion, this.merchantId).subscribe({
      next: (answer) => {
        this.messages.update((messages) => [...messages, { role: 'assistant', text: answer }]);
        this.sending.set(false);
      },
      error: (requestError: unknown) => {
        this.error.set(this.readError(requestError));
        this.sending.set(false);
      },
    });
  }

  private readError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const responseBody = error.error as { message?: unknown } | null;
      if (typeof responseBody?.message === 'string') return responseBody.message;
      if (error.status === 0) return 'Could not reach Merchant Copilot. Check that both services are running.';
    }
    return 'Merchant Copilot could not answer right now. Please try again.';
  }
}