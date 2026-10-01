import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CopilotInsight } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';

/** AI insights: each = number + cause + next step, plus a free-text question box. */
@Component({
  selector: 'mm-copilot-panel',
  standalone: true,
  imports: [IconComponent, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mm-card-head">
      <div>
        <p class="mm-eyebrow eyebrow">AI Business Pulse</p>
        <h2 class="mm-card-title">Copilot insights</h2>
      </div>
      <button type="button" class="ask-btn" (click)="openCopilot.emit()">
        <mm-icon name="sparkles" [size]="13" /> Ask Copilot
      </button>
    </header>

    <ul>
      @for (i of insights(); track i.id) {
        <li>
          <span class="dot" [class]="'dot ' + i.tone" aria-hidden="true"></span>
          <div>
            <p class="title">{{ i.title }}</p>
            <p class="body">{{ i.body }}</p>
            <a href="#">{{ i.linkLabel }} →</a>
          </div>
        </li>
      }
    </ul>

    <form class="ask" (ngSubmit)="submit()">
      <label class="mm-visually-hidden" for="copilot-q">Ask Copilot</label>
      <input id="copilot-q" name="q" [(ngModel)]="question" placeholder="Ask: “How much did I settle in August?”" />
      <button type="submit" aria-label="Send question"><mm-icon name="arrow-up" [size]="14" [stroke]="2.5" /></button>
    </form>
  `,
  styles: [`
    :host {
      display: flex; flex-direction: column; gap: 12px; padding: 18px 20px;
      border-radius: var(--mm-radius-xl); border: 1px solid var(--mm-brand-200);
      background: linear-gradient(180deg, #fff, #e8f6ef);
    }
    .eyebrow { color: var(--mm-brand-600); font-weight: 700; letter-spacing: .08em; }
    .ask-btn {
      display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px;
      border: 1px solid var(--mm-border); background: #fff; color: var(--mm-text-1); font-size: 12.5px; font-weight: 600;
    }
    .ask-btn mm-icon { color: var(--mm-brand-600); }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    li {
      display: flex; gap: 10px; padding: 12px 14px; background: #fff;
      border: 1px solid var(--mm-border); border-radius: var(--mm-radius-lg);
    }
    .dot { width: 8px; height: 8px; margin-top: 6px; border-radius: 50%; flex: none; }
    .dot.danger { background: var(--mm-danger); }
    .dot.warning { background: var(--mm-warning); }
    .dot.success { background: var(--mm-brand-600); }
    .title { font-size: 13.5px; font-weight: 600; }
    .body { font-size: 12px; color: var(--mm-text-2); margin: 3px 0; }
    li a { font-size: 12px; }
    .ask {
      display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 14px; margin-top: auto;
      background: #fff; border: 1px solid var(--mm-border); border-radius: 999px;
    }
    .ask input { flex: 1; border: 0; outline: none; font: inherit; font-size: 12.5px; background: transparent; }
    .ask button {
      display: grid; place-items: center; width: 30px; height: 30px; border: 0; border-radius: 50%;
      background: var(--mm-brand-600); color: #fff;
    }
  `],
})
export class CopilotPanelComponent {
  readonly insights = input.required<CopilotInsight[]>();
  readonly ask = output<string>();
  readonly openCopilot = output<void>();
  protected question = signal('');

  submit(): void {
    const q = this.question().trim();
    if (q) {
      this.ask.emit(q);
      this.question.set('');
    }
  }
}
