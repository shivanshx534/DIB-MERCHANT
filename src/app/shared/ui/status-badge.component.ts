import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from './icon.component';

export type BadgeStatus =
  | 'success' | 'failed' | 'pending' | 'refunded'
  | 'paid' | 'processing' | 'on-hold';

const MAP: Record<BadgeStatus, { label: string; tone: string; icon: string }> = {
  success: { label: 'Success', tone: 'success', icon: 'check' },
  paid: { label: 'Paid', tone: 'success', icon: 'check' },
  failed: { label: 'Failed', tone: 'danger', icon: 'x' },
  'on-hold': { label: 'On hold', tone: 'danger', icon: 'alert' },
  pending: { label: 'Pending', tone: 'neutral', icon: 'clock' },
  processing: { label: 'Processing', tone: 'warning', icon: 'clock' },
  refunded: { label: 'Refunded', tone: 'warning', icon: 'refund' },
};

/** Status pill — always icon + text so it never relies on colour alone. */
@Component({
  selector: 'mm-status-badge',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="mm-chip" [class]="'mm-chip mm-chip--' + cfg().tone">
      <mm-icon [name]="cfg().icon" [size]="11" [stroke]="2.5" />
      {{ cfg().label }}
    </span>
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<BadgeStatus>();
  protected readonly cfg = computed(() => MAP[this.status()]);
}
