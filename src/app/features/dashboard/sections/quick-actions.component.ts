import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { QuickAction } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';

@Component({
  selector: 'mm-quick-actions',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="list" role="group" aria-label="Quick actions">
      @for (a of actions(); track a.id) {
        <button type="button" class="mm-btn" [class.mm-btn--primary]="a.primary" (click)="action.emit(a.id)">
          <mm-icon [name]="a.icon" [size]="14" [class.accent]="!a.primary" />
          {{ a.label }}
        </button>
      }
    </div>
    <a href="#" class="customise" (click)="$event.preventDefault(); customise.emit()">Customise</a>
  `,
  styles: [`
    :host { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .list { display: flex; gap: 12px; flex-wrap: wrap; flex: 1; }
    .accent { color: var(--mm-brand-600); }
    .customise { font-size: 13px; }
  `],
})
export class QuickActionsComponent {
  readonly actions = input.required<QuickAction[]>();
  readonly action = output<QuickAction['id']>();
  readonly customise = output<void>();
}
