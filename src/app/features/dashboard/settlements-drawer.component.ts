import {
  AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, input, output, viewChild,
} from '@angular/core';
import { SettlementDetail } from '../../core/models/dashboard.models';
import { AedPipe } from '../../shared/pipes/aed.pipe';
import { IconComponent } from '../../shared/ui/icon.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge.component';

/**
 * Opened by "View settlements" in Money in motion. Slides over the dashboard — no navigation change.
 * A11y: role=dialog + aria-modal, focus moves to the close button, Esc and backdrop click close it.
 * For production, prefer @angular/cdk Dialog/Overlay for a full focus trap.
 */
@Component({
  selector: 'mm-settlements-drawer',
  standalone: true,
  imports: [AedPipe, IconComponent, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="close.emit()"></div>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="settle-title">
      <header>
        <div>
          <h2 id="settle-title">Settlements</h2>
          <p>Payouts to Dubai Islamic Bank ••4521 · Daily, T+1</p>
        </div>
        <button #closeBtn type="button" class="close" aria-label="Close" (click)="close.emit()">
          <mm-icon name="x" [size]="14" />
        </button>
      </header>

      <div class="body">
        @if (d().onHold; as hold) {
          <div class="alert" role="status">
            <span class="alert-icon" aria-hidden="true">!</span>
            <div class="alert-text">
              <strong>{{ hold.amount | aed }} from {{ hold.date }} is on hold</strong>
              <small>{{ hold.reason }}</small>
            </div>
            <a href="#">Upload</a>
          </div>
        }

        <section class="next">
          <div class="row">
            <span class="mm-eyebrow eyebrow">Next payout</span>
            <mm-status-badge [status]="d().status" />
          </div>
          <p class="amount mm-num">{{ d().amount | aed }}</p>
          <p class="arrives">{{ d().arrivesAt }} · {{ d().id }}</p>
          <ol class="steps">
            @for (s of d().steps; track s.label) {
              <li [class]="s.state">
                <i aria-hidden="true"></i>
                <strong>{{ s.label }}</strong>
                <small>{{ s.time }}</small>
              </li>
            }
          </ol>
        </section>

        <section class="breakdown">
          <div class="row"><h3>How we got to this amount</h3><small>{{ d().transactionsCount }} transactions</small></div>
          <dl>
            @for (l of d().lines; track l.label; let first = $first) {
              <div class="line"><dt>{{ l.label }}</dt><dd class="mm-num" [class.gross]="first">{{ first ? (l.amount | aed) : (l.amount | aed: 'signed') }}</dd></div>
            }
            <div class="line total"><dt>Net payout</dt><dd class="mm-num">{{ net() | aed }}</dd></div>
          </dl>
        </section>

        <section class="recent">
          <div class="row"><h3>Recent payouts</h3><small>This month: {{ d().settledThisMonth | aed: 'compact' }}</small></div>
          <ul>
            @for (p of d().recent; track p.id) {
              <li>
                <span class="when"><strong>{{ p.date }}</strong><small>{{ p.id }}</small></span>
                <span class="mm-num val">{{ p.amount | aed }}</span>
                <mm-status-badge [status]="p.status" />
                <mm-icon name="chevron-right" [size]="14" />
              </li>
            }
          </ul>
        </section>
      </div>

      <footer>
        <button type="button" class="mm-btn"><mm-icon name="download" [size]="14" /> Download statement</button>
        <button type="button" class="mm-btn mm-btn--primary">See all transactions</button>
      </footer>
    </aside>
  `,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 100; }
    .backdrop { position: absolute; inset: 0; background: rgba(15, 26, 23, .45); animation: fade .2s ease-out; }
    .drawer {
      position: absolute; top: 0; right: 0; bottom: 0; width: min(540px, 100vw);
      display: flex; flex-direction: column; background: var(--mm-surface); box-shadow: var(--mm-shadow-drawer);
      animation: slide .3s ease-out;
    }
    @keyframes slide { from { transform: translateX(100%); } }
    @keyframes fade { from { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .drawer, .backdrop { animation: none; } }
    header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 20px 16px 24px; border-bottom: 1px solid var(--mm-border); }
    header h2 { font-size: 19px; font-weight: 700; }
    header p { font-size: 12.5px; color: var(--mm-text-3); margin-top: 2px; }
    .close { display: grid; place-items: center; width: 32px; height: 32px; border: 1px solid var(--mm-border); border-radius: 8px; background: #fff; color: var(--mm-text-2); }
    .body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; padding: 20px 24px; }
    .row { display: flex; justify-content: space-between; align-items: center; }
    .row small { font-size: 12px; color: var(--mm-text-3); }
    h3 { font-size: 13.5px; font-weight: 700; }
    .alert { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #fdf6e7; border: 1px solid var(--mm-warning-border); }
    .alert-icon { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: var(--mm-warning); color: #fff; font-weight: 700; font-size: 12px; flex: none; }
    .alert-text { flex: 1; }
    .alert-text strong { display: block; font-size: 12.5px; }
    .alert-text small { font-size: 11.5px; color: var(--mm-text-2); }
    .alert a { font-size: 12.5px; }
    .next { display: flex; flex-direction: column; gap: 6px; padding: 16px 18px; border-radius: 14px; background: var(--mm-brand-50); }
    .eyebrow { color: var(--mm-brand-600); letter-spacing: .05em; }
    .amount { font-size: 28px; font-weight: 700; }
    .arrives { font-size: 12.5px; color: var(--mm-text-2); }
    .steps { list-style: none; margin: 8px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); }
    .steps li { display: flex; flex-direction: column; gap: 3px; font-size: 11.5px; }
    .steps li:nth-child(2), .steps li:nth-child(3) { align-items: center; }
    .steps li:last-child { align-items: flex-end; }
    .steps i { width: 10px; height: 10px; border-radius: 50%; background: #fff; border: 1.5px solid #9fb3ac; }
    .steps li.current i { border: 3px solid var(--mm-warning); }
    .steps li.done i { background: var(--mm-brand-600); border-color: var(--mm-brand-600); }
    .steps strong { font-weight: 500; color: var(--mm-text-2); }
    .steps li.current strong { font-weight: 600; color: var(--mm-text-1); }
    .steps small { font-size: 10.5px; color: var(--mm-text-3); }
    .breakdown dl { margin: 10px 0 0; display: grid; gap: 10px; }
    .line { display: flex; justify-content: space-between; font-size: 12.5px; }
    .line dt { color: var(--mm-text-2); }
    .line dd { margin: 0; font-weight: 500; color: var(--mm-text-2); }
    .line dd.gross { font-weight: 600; color: var(--mm-text-1); }
    .line.total { padding-top: 10px; border-top: 1px solid var(--mm-border); font-size: 13.5px; }
    .line.total dt { font-weight: 600; color: var(--mm-text-1); }
    .line.total dd { font-size: 15px; font-weight: 700; color: var(--mm-brand-600); }
    .recent { border-top: 1px solid var(--mm-border); padding-top: 20px; }
    .recent ul { list-style: none; margin: 8px 0 0; padding: 0; }
    .recent li { display: flex; align-items: center; gap: 12px; padding: 9px 0; color: var(--mm-text-3); }
    .when { flex: 1; }
    .when strong { display: block; font-size: 12.5px; font-weight: 500; color: var(--mm-text-1); }
    .when small { font-size: 11px; }
    .val { font-size: 13px; font-weight: 600; color: var(--mm-text-1); }
    footer { display: flex; gap: 10px; padding: 14px 24px 18px; border-top: 1px solid var(--mm-border); }
    footer .mm-btn { flex: 1; justify-content: center; }
  `],
})
export class SettlementsDrawerComponent implements AfterViewInit {
  readonly d = input.required<SettlementDetail>({ alias: 'detail' });
  readonly close = output<void>();
  private readonly closeBtn = viewChild.required<ElementRef<HTMLButtonElement>>('closeBtn');

  protected readonly net = computed(() => this.d().lines.reduce((s, l) => s + l.amount, 0));

  ngAfterViewInit(): void {
    this.closeBtn().nativeElement.focus();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close.emit();
  }
}
