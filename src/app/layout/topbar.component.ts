import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from '../shared/ui/icon.component';

@Component({
  selector: 'mm-topbar',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="menu-toggle" aria-label="Open navigation" (click)="menuToggle.emit()">
      <mm-icon name="menu" [size]="18" />
    </button>
    <label class="search">
      <mm-icon name="search" [size]="15" />
      <span class="mm-visually-hidden">Search</span>
      <input type="search" placeholder="Search..." />
    </label>

    <div class="actions">
      <button type="button" class="icon-btn copilot" aria-label="Open Copilot" (click)="copilot.emit()">
        <mm-icon name="sparkles" [size]="16" />
      </button>
      <button
        type="button"
        class="icon-btn layout-toggle"
        [attr.aria-label]="horizontalLayout() ? 'Switch to sidebar navigation' : 'Switch to top navigation'"
        [attr.title]="horizontalLayout() ? 'Use sidebar navigation' : 'Use top navigation'"
        [attr.aria-pressed]="horizontalLayout()"
        (click)="layoutToggle.emit()"
      >
        <mm-icon name="layout" [size]="16" />
      </button>
      <button type="button" class="icon-btn" aria-label="Notifications">
        <mm-icon name="bell" [size]="16" />
        @if (hasNotifications()) { <span class="dot" aria-hidden="true"></span> }
      </button>
      <button type="button" class="profile" aria-label="Account menu">
        <span class="avatar" aria-hidden="true">{{ initials() }}</span>
        <span class="who">
          <strong>{{ merchantName() }}</strong>
          <span>{{ language() }}</span>
        </span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex; align-items: center; justify-content: space-between; gap: 14px;
      height: var(--mm-topbar-h); padding: 0 20px;
      background: var(--mm-surface); border-bottom: 1px solid var(--mm-border);
    }
    .search {
      display: flex; align-items: center; gap: 8px; width: 360px; max-width: 45%;
      padding: 8px 12px; border: 1px solid var(--mm-border); border-radius: var(--mm-radius-md);
      background: var(--mm-canvas); color: var(--mm-text-3);
    }
    .search input { flex: 1; min-width: 0; width: 100%; border: 0; background: transparent; font: inherit; font-size: 13px; outline: none; color: var(--mm-text-1); }
    .menu-toggle { display: none; place-items: center; width: 36px; height: 36px; flex: none; border: 1px solid var(--mm-border); border-radius: 8px; background: var(--mm-surface); color: var(--mm-text-2); }
    .actions { display: flex; align-items: center; gap: 10px; }
    .icon-btn {
      position: relative; display: grid; place-items: center; width: 36px; height: 36px;
      border: 1px solid var(--mm-border); border-radius: 50%; background: var(--mm-surface); color: var(--mm-text-2);
    }
    .copilot { border-color: var(--mm-brand-600); color: var(--mm-brand-600); }
    .layout-toggle[aria-pressed='true'] { background: var(--mm-brand-50); border-color: var(--mm-brand-600); color: var(--mm-brand-600); }
    .dot { position: absolute; top: 7px; right: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--mm-danger); }
    .profile { display: flex; align-items: center; gap: 10px; border: 0; background: none; padding: 0; text-align: left; }
    .avatar {
      display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%;
      background: var(--mm-brand-600); color: #fff; font-size: 13px; font-weight: 700;
    }
    .who { display: flex; flex-direction: column; line-height: 1.2; }
    .who strong { font-size: 13px; }
    .who span { font-size: 12px; color: var(--mm-text-3); }
    @media (max-width: 900px) { .menu-toggle { display: grid; } }
    @media (max-width: 767px) { :host { padding: 0 16px; } .who { display: none; } .search { width: auto; max-width: none; flex: 1; min-width: 0; } }
  `],
})
export class TopbarComponent {
  readonly merchantName = input.required<string>();
  readonly language = input('English');
  readonly hasNotifications = input(false);
  readonly horizontalLayout = input(false);
  readonly copilot = output<void>();
  readonly menuToggle = output<void>();
  readonly layoutToggle = output<void>();
  protected initials = () =>
    this.merchantName().replace(/[^A-Z]/g, '').slice(0, 2) || this.merchantName().slice(0, 2).toUpperCase();
}
