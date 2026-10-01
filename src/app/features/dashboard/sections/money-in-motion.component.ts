import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SettlementSummary } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AedPipe } from '../../../shared/pipes/aed.pipe';

/**
 * Collected → Pending settlement → Next payout.
 * Only the payout stage is filled green: it is the answer the merchant came for.
 * Rule: nextPayoutAmount must equal collected − refunds − fees − VAT − reserves
 * (the breakdown is shown in the settlements drawer).
 */
@Component({
  selector: 'mm-money-in-motion',
  standalone: true,
  imports: [IconComponent, AedPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mm-card-head">
      <div>
        <h2 class="mm-card-title">Money in motion</h2>
        <p class="mm-card-sub">Where today’s money is right now</p>
      </div>
      <button type="button" class="pill" (click)="viewSettlements.emit()">
        View settlements <mm-icon name="arrow-right" [size]="13" />
      </button>
    </header>

    <ol class="stages">
      <li class="stage">
        <span class="mm-eyebrow label"><i class="dot ok"></i>Collected today</span>
        <strong class="mm-num">{{ s().collectedToday | aed }}</strong>
        <small>{{ s().paymentsCount }} payments · all channels</small>
      </li>
      <li class="arrow" aria-hidden="true"><mm-icon name="arrow-right" [size]="18" /></li>
      <li class="stage">
        <span class="mm-eyebrow label"><i class="dot warn"></i>Pending settlement</span>
        <strong class="mm-num">{{ s().pendingSettlement | aed }}</strong>
        <small>Batch closes {{ s().batchClosesAt }} · settles {{ s().settlementCycle }}</small>
      </li>
      <li class="arrow" aria-hidden="true"><mm-icon name="arrow-right" [size]="18" /></li>
      <li class="stage payout">
        <span class="mm-eyebrow label"><i class="dot light"></i>Next payout</span>
        <strong>{{ s().nextPayoutDate | date: 'EEE, d MMM' }}</strong>
        <small class="mm-num">{{ s().nextPayoutAmount | aed }} → {{ s().bankAccountMasked }}</small>
      </li>
    </ol>

    <p class="last">
      <mm-icon name="check" [size]="12" />
      Last payout {{ s().lastPayout.amount | aed }} received on {{ s().lastPayout.date | date: 'EEE, d MMM' }}
    </p>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 18px; padding: 22px 26px; }
    .pill {
      display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px;
      border: 1px solid var(--mm-border); background: var(--mm-surface); color: var(--mm-brand-600);
      font-size: 13px; font-weight: 600;
    }
    .stages { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; gap: 12px; }
    .stage {
      flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 16px 18px;
      border-radius: var(--mm-radius-lg); background: var(--mm-surface-muted); border: 1px solid var(--mm-border);
    }
    .stage strong { font-size: 22px; font-weight: 700; }
    .stage small { font-size: 12px; color: var(--mm-text-3); }
    .label { display: flex; align-items: center; gap: 6px; color: var(--mm-text-3); }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot.ok { background: var(--mm-brand-600); }
    .dot.warn { background: var(--mm-warning); }
    .dot.light { background: var(--mm-brand-accent); }
    .payout {
      background: var(--mm-brand-600); border-color: var(--mm-brand-600); color: #fff;
      box-shadow: 0 8px 20px -6px rgba(14,122,74,.25);
    }
    .payout .label, .payout small { color: rgba(255,255,255,.88); }
    .arrow { color: var(--mm-text-disabled); }
    .last { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--mm-brand-600); }
    @media (max-width: 1023px) {
      .stages { flex-direction: column; align-items: stretch; }
      .arrow { transform: rotate(90deg); align-self: center; }
    }
  `],
  host: { class: 'mm-card' },
})
export class MoneyInMotionComponent {
  readonly s = input.required<SettlementSummary>({ alias: 'summary' });
  readonly viewSettlements = output<void>();
}
