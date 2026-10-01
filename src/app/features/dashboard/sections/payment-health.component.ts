import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PaymentHealth } from '../../../core/models/dashboard.models';
import { AedPipe } from '../../../shared/pipes/aed.pipe';

@Component({
  selector: 'mm-payment-health',
  standalone: true,
  imports: [AedPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>
      <h2 class="mm-card-title">Payment health</h2>
      <p class="mm-card-sub">Why payments failed today</p>
    </header>

    <div class="body">
      <div class="summary">
        <svg viewBox="0 0 125 125" class="ring" role="img" [attr.aria-label]="'Success rate ' + h().successRate + '%'">
          <circle cx="62.5" cy="62.5" r="54" fill="none" stroke="var(--mm-canvas)" stroke-width="14" />
          <circle cx="62.5" cy="62.5" r="54" fill="none" stroke="var(--mm-brand-600)" stroke-width="14"
                  [attr.stroke-dasharray]="dash()" transform="rotate(-90 62.5 62.5)" />
          <text x="62.5" y="69" text-anchor="middle" class="ring-val">{{ h().successRate }}%</text>
        </svg>
        <p class="lbl">Success rate</p>
        <p class="failed">{{ h().failedCount }} failed payments</p>
        <p class="recover">≈ {{ h().recoverableAmount | aed }} recoverable</p>
      </div>

      <div class="reasons">
        <p class="mm-eyebrow head">Why payments failed</p>
        <ul>
          @for (r of h().reasons; track r.label; let i = $index) {
            <li>
              <span class="name">{{ r.label }}</span>
              <span class="track"><span class="fill" [class.strong]="r.percent > 25" [style.width.%]="(r.percent / maxPct()) * 100"></span></span>
              <strong class="mm-num">{{ r.percent }}%</strong>
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 14px; min-width: 0; padding: 18px 20px; }
    .body { display: flex; align-items: center; flex-wrap: wrap; gap: clamp(16px, 3vw, 36px); flex: 1; min-width: 0; padding-inline-start: 8px; }
    .summary { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .ring { width: 125px; height: 125px; margin-bottom: 14px; }
    .ring-val { font-size: 22px; font-weight: 700; fill: var(--mm-text-1); }
    .lbl { font-size: 12px; color: var(--mm-text-3); }
    .failed { font-size: 15px; font-weight: 700; }
    .recover { font-size: 12px; font-weight: 600; color: var(--mm-danger); }
    .reasons { flex: 1; }
    .head { color: var(--mm-text-3); font-weight: 700; margin-bottom: 16px; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 16px; }
    li { display: flex; align-items: center; gap: 10px; }
    .name { flex: 0 0 min(140px, 38%); overflow-wrap: anywhere; font-size: 12.5px; color: var(--mm-text-2); }
    .track { flex: 1; height: 7px; border-radius: 4px; background: var(--mm-canvas); overflow: hidden; }
    .fill { display: block; height: 100%; border-radius: 4px; background: var(--mm-danger-soft); }
    .fill.strong { background: var(--mm-danger); }
    li strong { width: 34px; text-align: right; font-size: 12.5px; }
    @media (max-width: 900px) { :host { gap: 12px; padding: 16px; }.body { gap: 18px; }.ring { width: 112px; height: 112px; margin-bottom: 8px; }ul { gap: 12px; } }
    @media (max-width: 599px) { .body { flex-direction: column; align-items: stretch; padding-inline-start: 0; }.summary { align-self: center; }.name { flex-basis: 38%; }.track { min-width: 24px; } }
  `],
  host: { class: 'mm-card' },
})
export class PaymentHealthComponent {
  readonly h = input.required<PaymentHealth>({ alias: 'health' });
  private readonly C = 2 * Math.PI * 54;
  protected readonly dash = computed(() => `${(this.h().successRate / 100) * this.C} ${this.C}`);
  protected readonly maxPct = computed(() => Math.max(...this.h().reasons.map((r) => r.percent)));
}
