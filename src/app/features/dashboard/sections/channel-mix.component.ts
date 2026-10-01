import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChannelShare } from '../../../core/models/dashboard.models';
import { AedPipe } from '../../../shared/pipes/aed.pipe';
import { IconComponent } from '../../../shared/ui/icon.component';

/**
 * Donut of sales by channel. Keep to ≤5 slices; group smaller ones into "Other".
 * Each slice is a circle with stroke-dasharray (no chart library needed).
 */
@Component({
  selector: 'mm-channel-mix',
  standalone: true,
  imports: [AedPipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <h2 class="mm-card-title">How customers pay</h2>
      <p class="mm-card-sub">Share of today’s sales by channel</p>
    </header>

    <div class="body">
      <svg viewBox="0 0 170 170" class="donut" role="img" [attr.aria-label]="aria()">
        @for (s of slices(); track s.id) {
          <circle cx="85" cy="85" [attr.r]="R" fill="none" [attr.stroke]="s.color" stroke-width="27"
                  [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset" transform="rotate(-90 85 85)" />
        }
        <text x="85" y="70" text-anchor="middle" class="c-sub">Today</text>
        <text x="85" y="92" text-anchor="middle" class="c-val">{{ total() | aed: 'compact' }}</text>
        <text x="85" y="110" text-anchor="middle" class="c-sub">{{ paymentsCount() }} payments</text>
      </svg>

      <ul class="legend">
        @for (c of channels(); track c.id) {
          <li>
            <i [style.background]="c.color"></i>
            <span class="name">{{ c.label }}<small>{{ c.amount | aed: 'compact' }}</small></span>
            <strong class="mm-num">{{ c.percent }}%</strong>
          </li>
        }
      </ul>
    </div>

    @if (tip()) {
      <p class="tip"><mm-icon name="sparkles" [size]="12" /> {{ tip() }}</p>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 14px; min-width: 0; padding: 18px 20px; }
    .body { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: clamp(16px, 4vw, 48px); flex: 1; min-width: 0; }
    .donut { width: 170px; height: 170px; flex: none; }
    .c-sub { font-size: 11px; fill: var(--mm-text-3); }
    .c-val { font-size: 16px; font-weight: 700; fill: var(--mm-text-1); }
    .legend { list-style: none; margin: 0; padding: 0; width: min(250px, 100%); min-width: 0; display: grid; gap: 12px; }
    .legend li { display: flex; align-items: center; gap: 8px; }
    .legend i { width: 10px; height: 10px; border-radius: 3px; flex: none; }
    .name { flex: 1; min-width: 0; overflow-wrap: anywhere; font-size: 12.5px; font-weight: 500; }
    .name small { display: block; font-size: 11px; font-weight: 400; color: var(--mm-text-3); }
    .legend strong { font-size: 13px; }
    .tip {
      display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--mm-radius-md);
      background: var(--mm-brand-50); color: var(--mm-brand-700); font-size: 12px; font-weight: 500;
    }
    @media (max-width: 900px) { :host { gap: 12px; padding: 16px; }.donut { width: 150px; height: 150px; }.legend { gap: 10px; }.tip { padding: 9px 11px; font-size: 12px; } }
    @media (max-width: 599px) { .body { flex-direction: column; gap: 16px; }.donut { width: 144px; height: 144px; }.legend { width: 100%; } }
  `],
  host: { class: 'mm-card' },
})
export class ChannelMixComponent {
  readonly channels = input.required<ChannelShare[]>();
  readonly paymentsCount = input(0);
  readonly tip = input<string | null>('Accept tap-to-pay on your phone, no terminal needed. Learn more');

  protected readonly R = 71.5;
  private readonly C = 2 * Math.PI * this.R;
  private readonly GAP = 2.5; // px gap between slices

  protected readonly total = computed(() => this.channels().reduce((s, c) => s + c.amount, 0));
  protected readonly slices = computed(() => {
    let acc = 0;
    return this.channels().map((c) => {
      const len = (c.percent / 100) * this.C;
      const s = { id: c.id, color: c.color, dash: `${Math.max(0, len - this.GAP)} ${this.C}`, offset: -acc };
      acc += len;
      return s;
    });
  });
  protected readonly aria = computed(() =>
    'Sales by channel: ' + this.channels().map((c) => `${c.label} ${c.percent}%`).join(', '),
  );
}
