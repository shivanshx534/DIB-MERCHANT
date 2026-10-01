import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Period } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'mm-page-header',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="greeting">
      <p class="hello">{{ greeting() }}</p>
      <h1>{{ merchantName() }}</h1>
      <p class="date">{{ dateLabel() }} · Here’s how your business is doing today</p>
    </div>

    <div class="controls">
      <div class="mm-segmented period" role="tablist" aria-label="Period">
        @for (p of periods; track p.id) {
          <button type="button" role="tab" [attr.aria-selected]="p.id === period()"
                  (click)="periodChange.emit(p.id)">{{ p.label }}</button>
        }
      </div>
      <button type="button" class="compare" aria-haspopup="listbox">
        {{ compareLabel() }} <mm-icon name="chevron-down" [size]="12" />
      </button>
    </div>
  `,
  styles: [`
    :host { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .hello { font-size: 13px; color: var(--mm-text-3); }
    h1 { font-size: 22px; font-weight: 700; margin: 2px 0; }
    .date { font-size: 13px; color: var(--mm-text-2); }
    .controls { display: flex; align-items: center; gap: 10px; }
    .period { background: var(--mm-surface); border: 1px solid var(--mm-border); }
    .period button { padding: 7px 14px; font-size: 13px; }
    .period button[aria-selected='true'] { background: var(--mm-brand-50); color: var(--mm-brand-600); border-color: transparent; }
    .compare {
      display: inline-flex; align-items: center; gap: 6px; padding: 10px 12px;
      border: 1px solid var(--mm-border); border-radius: var(--mm-radius-md); background: var(--mm-surface);
      font-size: 13px; font-weight: 500; color: var(--mm-text-2);
    }
  `],
})
export class PageHeaderComponent {
  readonly greeting = input.required<string>();
  readonly merchantName = input.required<string>();
  readonly dateLabel = input.required<string>();
  readonly compareLabel = input.required<string>();
  readonly period = input<Period>('today');
  readonly periodChange = output<Period>();

  protected readonly periods: { id: Period; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: '7D' },
    { id: '30d', label: '30D' },
    { id: 'custom', label: 'Custom' },
  ];
}
