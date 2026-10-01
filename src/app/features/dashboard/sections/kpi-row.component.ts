import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Kpi } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';
import { SparklineComponent } from '../../../shared/ui/sparkline.component';

@Component({
  selector: 'mm-kpi-row',
  standalone: true,
  imports: [IconComponent, SparklineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 class="heading">Business overview <span>{{ compareLabel() }}</span></h2>
    <ul class="grid">
      @for (k of kpis(); track k.id) {
        <li class="mm-card kpi" [class.flagged]="!!k.flagged">
          <div class="top">
            <span class="icon" [style.background]="k.iconColor"><mm-icon [name]="k.icon" [size]="15" [stroke]="2.5" /></span>
            <span class="label">{{ k.label }}</span>
            @if (k.flagged) { <span class="mm-chip mm-chip--warning flag">⚠ {{ k.flagged }}</span> }
          </div>
          <p class="value mm-num">{{ k.value }}</p>
          <p class="delta">
            <span class="mm-chip" [class.mm-chip--success]="k.deltaTone === 'success'"
                  [class.mm-chip--danger]="k.deltaTone === 'danger'">{{ k.delta }}</span>
            <span class="caption">{{ k.caption }}</span>
          </p>
          <mm-sparkline [values]="k.sparkline"
                        [color]="k.deltaTone === 'danger' && k.id === 'refunds' ? 'var(--mm-danger)' : 'var(--mm-brand-600)'" />
        </li>
      }
    </ul>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 12px; }
    .heading { font-size: 16px; font-weight: 700; }
    .heading span { margin-left: 8px; font-size: 13px; font-weight: 400; color: var(--mm-text-3); }
    .grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .kpi { display: flex; flex-direction: column; gap: 10px; padding: 16px 18px; }
    .kpi.flagged { border: 1.5px solid var(--mm-warning); }
    .top { display: flex; align-items: center; gap: 10px; }
    .icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%; color: #fff; }
    .label { flex: 1; font-size: 13px; font-weight: 500; color: var(--mm-text-2); }
    .value { font-size: 22px; font-weight: 700; }
    .delta { display: flex; align-items: center; gap: 8px; }
    .caption { font-size: 12px; color: var(--mm-text-3); }
    @media (max-width: 1279px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 599px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class KpiRowComponent {
  readonly kpis = input.required<Kpi[]>();
  readonly compareLabel = input('Compared with last Friday');
}
