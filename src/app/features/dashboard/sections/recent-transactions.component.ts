import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { Transaction } from '../../../core/models/dashboard.models';
import { AedPipe } from '../../../shared/pipes/aed.pipe';
import { IconComponent } from '../../../shared/ui/icon.component';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge.component';

type Filter = 'all' | 'failed' | 'refunded';

/** Latest payments. Full search / export stays in Reports. Row click opens the transaction details. */
@Component({
  selector: 'mm-recent-transactions',
  standalone: true,
  imports: [AedPipe, IconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mm-card-head">
      <div>
        <h2 class="mm-card-title">Recent transactions</h2>
        <p class="mm-card-sub">Live · updated {{ updatedAt() }}</p>
      </div>
      <div class="tools">
        <div class="mm-segmented" role="tablist" aria-label="Filter transactions">
          <button type="button" role="tab" [attr.aria-selected]="filter() === 'all'" (click)="filter.set('all')">All</button>
          <button type="button" role="tab" [attr.aria-selected]="filter() === 'failed'" (click)="filter.set('failed')">
            Failed <span class="count danger">{{ counts().failed }}</span>
          </button>
          <button type="button" role="tab" [attr.aria-selected]="filter() === 'refunded'" (click)="filter.set('refunded')">
            Refunds <span class="count">{{ counts().refunds }}</span>
          </button>
        </div>
        <a href="#">View all transactions →</a>
      </div>
    </header>

    <table>
      <caption class="mm-visually-hidden">Recent transactions</caption>
      <thead>
        <tr>
          <th scope="col" class="c-time">Time</th>
          <th scope="col">Customer / reference</th>
          <th scope="col" class="c-chan">Channel</th>
          <th scope="col" class="c-stat">Status</th>
          <th scope="col" class="c-amt">Amount</th>
          <th scope="col" class="c-act"><span class="mm-visually-hidden">Open</span></th>
        </tr>
      </thead>
      <tbody>
        @for (t of rows(); track t.id) {
          <tr [class.is-failed]="t.status === 'failed'" (click)="open.emit(t)" tabindex="0" (keydown.enter)="open.emit(t)">
            <td class="c-time"><strong>{{ t.time }}</strong><small>{{ t.day }}</small></td>
            <td>
              <div class="cust">
                <span class="kind" aria-hidden="true"><mm-icon [name]="kindIcon(t)" [size]="14" /></span>
                <span><strong>{{ t.customer }}</strong><small>{{ t.reference }}</small></span>
              </div>
            </td>
            <td class="c-chan">{{ t.channel }}</td>
            <td class="c-stat"><mm-status-badge [status]="t.status" /></td>
            <td class="c-amt mm-num" [class.refund]="t.status === 'refunded'" [class.void]="t.status === 'failed'">
              {{ t.amount | aed }}
            </td>
            <td class="c-act"><mm-icon name="chevron-right" [size]="14" /></td>
          </tr>
        } @empty {
          <tr><td colspan="6" class="empty">No transactions for this filter</td></tr>
        }
      </tbody>
    </table>

    <footer>
      <span>Showing {{ rows().length }} of {{ total() }} transactions today</span>
      <a href="#"><mm-icon name="download" [size]="13" /> Download today’s report</a>
    </footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 12px; min-width: 0; padding: 18px 20px 12px; }
    .tools { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .tools a { font-size: 13px; }
    .count { margin-left: 2px; padding: 1px 6px; border-radius: 999px; background: var(--mm-neutral-bg); font-size: 10.5px; font-weight: 600; }
    .count.danger { background: var(--mm-danger-bg); color: var(--mm-danger-text); }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      padding: 8px 12px; background: var(--mm-canvas); text-align: left;
      font-size: 10.5px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--mm-text-3);
    }
    thead th.c-amt { text-align: right; }
    thead th:first-child { border-radius: 8px 0 0 8px; }
    thead th:last-child { border-radius: 0 8px 8px 0; }
    tbody tr { cursor: pointer; border-bottom: 1px solid var(--mm-border); }
    tbody tr:last-child { border-bottom: 0; }
    tbody tr:hover { background: var(--mm-surface-muted); }
    tbody tr.is-failed { background: #fffafa; }
    td { padding: 11px 12px; font-size: 12.5px; color: var(--mm-text-2); vertical-align: middle; }
    td strong { display: block; font-size: 13px; font-weight: 500; color: var(--mm-text-1); }
    td small { display: block; font-size: 11px; color: var(--mm-text-3); }
    .c-time { width: 96px; }
    .c-chan { width: 210px; }
    .c-stat { width: 130px; }
    .c-amt { width: 150px; text-align: right; font-size: 13.5px; font-weight: 600; color: var(--mm-text-1); }
    .c-amt.refund { color: var(--mm-warning-text); }
    .c-amt.void { color: var(--mm-text-3); text-decoration: line-through; }
    .c-act { width: 28px; text-align: right; color: var(--mm-text-3); }
    .cust { display: flex; align-items: center; gap: 10px; }
    .kind { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; background: var(--mm-canvas); color: var(--mm-text-2); }
    .empty { text-align: center; padding: 24px; color: var(--mm-text-3); }
    footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px 16px; padding: 6px 12px 0; font-size: 12px; color: var(--mm-text-3); }
    footer a { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; }
    @media (max-width: 1023px) { .c-chan { display: none; } }
    @media (max-width: 767px) { .c-time, .c-stat { display: none; } .tools { flex-wrap: wrap; } }
  `],
  host: { class: 'mm-card' },
})
export class RecentTransactionsComponent {
  readonly transactions = input.required<Transaction[]>();
  readonly total = input(0);
  readonly counts = input({ failed: 0, refunds: 0 });
  readonly updatedAt = input('18:42');
  readonly open = output<Transaction>();

  protected readonly filter = signal<Filter>('all');
  protected readonly rows = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.transactions() : this.transactions().filter((t) => t.status === f);
  });
  protected kindIcon = (t: Transaction) => (t.kind === 'invoice' ? 'file' : t.kind === 'qr' ? 'qr' : 'card');
}
