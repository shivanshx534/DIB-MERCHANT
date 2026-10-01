import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AttentionItem, Priority } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';

const PRIORITY: Record<Priority, { label: string; chip: string; tile: string }> = {
  high: { label: 'High', chip: 'mm-chip--danger', tile: 'danger' },
  medium: { label: 'Medium', chip: 'mm-chip--warning', tile: 'warning' },
  low: { label: 'Low', chip: 'mm-chip--neutral', tile: 'neutral' },
};

/**
 * Prioritised to-do list aggregated from Accept Payments, Request and Settings.
 * Rules: only actionable items (deadline or money at stake); sorted high → low;
 * items disappear once resolved; empty state = "You're all caught up".
 */
@Component({
  selector: 'mm-attention-list',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mm-card-head head">
      <h2 class="mm-card-title">
        Needs your attention
        @if (items().length) { <span class="count" [attr.aria-label]="items().length + ' items'">{{ items().length }}</span> }
      </h2>
      <a href="#">View all</a>
    </header>

    @if (items().length) {
      <ul>
        @for (it of items(); track it.id) {
          <li>
            <span class="tile" [class]="'tile ' + p(it).tile"><mm-icon [name]="it.icon" [size]="16" /></span>
            <div class="text">
              <p class="title">{{ it.title }} <span class="mm-chip" [class]="'mm-chip ' + p(it).chip">{{ p(it).label }}</span></p>
              <p class="meta">{{ it.meta }}</p>
            </div>
            <button type="button" class="mm-btn mm-btn--sm" [class.mm-btn--primary]="it.action.primary"
                    (click)="act.emit(it)">{{ it.action.label }}</button>
          </li>
        }
      </ul>
    } @else {
      <p class="empty"><mm-icon name="check" [size]="14" /> You’re all caught up</p>
    }
  `,
  styles: [`
    :host { display: flex; flex-direction: column; padding: 18px 20px 8px; }
    .head { padding-bottom: 8px; }
    .count {
      display: inline-grid; place-items: center; min-width: 20px; height: 20px; margin-left: 6px; padding: 0 6px;
      border-radius: 999px; background: var(--mm-danger); color: #fff; font-size: 11px; vertical-align: 2px;
    }
    .head a { font-size: 13px; }
    ul { list-style: none; margin: 0; padding: 0; }
    li { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--mm-border); }
    li:last-child { border-bottom: 0; }
    .tile { display: grid; place-items: center; width: 36px; height: 36px; flex: none; border-radius: var(--mm-radius-md); }
    .tile.danger { background: var(--mm-danger-bg); color: var(--mm-danger-text); }
    .tile.warning { background: var(--mm-warning-bg); color: var(--mm-warning-text); }
    .tile.neutral { background: var(--mm-canvas); color: var(--mm-text-2); }
    .text { flex: 1; min-width: 0; }
    .title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 14px; font-weight: 600; }
    .meta { font-size: 12px; color: var(--mm-text-3); margin-top: 2px; }
    .empty { display: flex; align-items: center; gap: 8px; padding: 16px 0; color: var(--mm-brand-600); font-weight: 600; }
    @media (max-width: 900px) { :host { padding: 9px 10px 4px; border-radius: 10px; }.head { padding-bottom: 3px; }.head h2 { font-size: 11px; }li { gap: 6px; padding: 6px 0; }.tile { width: 20px; height: 20px; }.title { gap: 3px; font-size: 8px; }.meta { font-size: 7px; }.head a, li button { font-size: 7px; min-height: 22px; padding: 0 7px; } }
  `],
  host: { class: 'mm-card' },
})
export class AttentionListComponent {
  readonly items = input.required<AttentionItem[]>();
  readonly act = output<AttentionItem>();
  protected p = (it: AttentionItem) => PRIORITY[it.priority];
}
