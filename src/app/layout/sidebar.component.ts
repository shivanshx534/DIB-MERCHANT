import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/ui/icon.component';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  hasChildren?: boolean;
  route?: string;
  children?: NavItem[];
}

/** Existing IA — unchanged from the current portal. */
export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  {
    id: 'accept-payments', label: 'Accept Payments', icon: 'card', hasChildren: true,
    children: [
      { id: 'invoices', label: 'Payment Invoice', icon: 'file', route: '/dashboard/invoices' },
      { id: 'qr-code', label: 'QR Code', icon: 'qr', route: '/dashboard/qr-code' },
    ],
  },
  { id: 'request', label: 'Request', icon: 'message', hasChildren: true },
  { id: 'developer', label: 'Developer Settings', icon: 'code', hasChildren: true },
  { id: 'reports', label: 'Reports', icon: 'report', hasChildren: true },
  { id: 'settings', label: 'Settings', icon: 'settings', hasChildren: true },
];

@Component({
  selector: 'mm-sidebar',
  standalone: true,
  imports: [IconComponent, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="brand">
      <div class="logo" aria-hidden="true">M</div>
      <div class="brand-text">
        <strong>MAPS Merchant</strong>
        <span>Dubai Islamic Bank</span>
      </div>
      <button class="collapse" type="button" aria-label="Collapse sidebar" (click)="collapse.emit()">
        <mm-icon name="chevron-left" [size]="14" />
      </button>
    </div>

    <nav aria-label="Main">
      <ul>
        @for (item of items; track item.id) {
          <li>
            <a [routerLink]="item.children?.length ? null : (item.route || '/dashboard')" class="nav-item" [class.active]="item.id === active()"
              [attr.aria-current]="item.id === active() ? 'page' : null"
              [attr.aria-expanded]="item.children?.length ? isExpanded(item.id) : null"
              (click)="item.children?.length ? toggleChildren($event, item.id) : null">
              <mm-icon [name]="item.icon" [size]="18" />
              <span>{{ item.label }}</span>
              @if (item.hasChildren) {
                <mm-icon class="chev" name="chevron-right" [size]="14" />
              }
            </a>
            @if (item.children?.length) {
              <ul class="subnav">
                @for (child of item.children; track child.id) {
                  <li>
                    <a [routerLink]="child.route || '/dashboard'" class="subnav-item"
                       [class.active]="child.id === active()"
                       [attr.aria-current]="child.id === active() ? 'page' : null">
                      <mm-icon [name]="child.icon" [size]="16" />
                      <span>{{ child.label }}</span>
                    </a>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    </nav>

    <p class="powered">Powered by FSS</p>
  `,
  styles: [`
    :host {
      display: flex; flex-direction: column;
      width: var(--mm-sidebar-w); min-height: 100%;
      background: var(--mm-surface); border-right: 1px solid var(--mm-border);
    }
    :host(.top-nav) {
      width: 100%; min-height: auto; flex-direction: row; border-right: 0;
      border-bottom: 1px solid var(--mm-border); overflow: visible;
    }
    :host(.top-nav) .brand, :host(.top-nav) .powered { display: none; }
    :host(.top-nav) nav { flex: 1; padding: 0 18px; overflow: visible; }
    :host(.top-nav) nav > ul { display: flex; align-items: stretch; gap: 4px; flex-wrap: wrap; overflow: visible; }
    :host(.top-nav) nav > ul > li { position: relative; }
    :host(.top-nav) .nav-item { height: 52px; border-radius: 0; white-space: nowrap; }
    :host(.top-nav) .nav-item.active { background: transparent; border-bottom: 2px solid var(--mm-brand-600); }
    :host(.top-nav) .subnav { position: absolute; top: 100%; left: 0; z-index: 100; display: none !important; visibility: visible; opacity: 1; width: 190px; margin: 0; padding: 8px; border: 1px solid var(--mm-border); border-radius: 0 0 var(--mm-radius-sm) var(--mm-radius-sm); background: var(--mm-surface); box-shadow: var(--mm-shadow-float); }
    :host(.top-nav) nav > ul > li:hover > .subnav, :host(.top-nav) nav > ul > li:focus-within > .subnav { display: grid !important; }
    :host(.top-nav) .subnav-item { min-height: 36px; }
    .brand {
      display: flex; align-items: center; gap: 10px;
      height: var(--mm-topbar-h); padding: 0 18px;
      border-bottom: 1px solid var(--mm-border);
    }
    .logo {
      display: grid; place-items: center; width: 34px; height: 34px; border-radius: var(--mm-radius-sm);
      background: var(--mm-brand-600); color: #fff; font-weight: 700;
    }
    .brand-text { display: flex; flex-direction: column; flex: 1; line-height: 1.2; }
    .brand-text strong { font-size: 14px; }
    .brand-text span { font-size: 11px; color: var(--mm-text-3); }
    .collapse {
      display: grid; place-items: center; width: 26px; height: 26px;
      border: 1px solid var(--mm-border); border-radius: 50%; background: var(--mm-surface); color: var(--mm-text-2);
    }
    nav { flex: 1; padding: 10px; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px; border-radius: var(--mm-radius-sm);
      color: var(--mm-text-2); font-size: 14px; font-weight: 600;
    }
    .nav-item:hover { background: var(--mm-surface-muted); text-decoration: none; }
    .nav-item.active { background: var(--mm-brand-50); color: var(--mm-brand-600); }
    .nav-item span { flex: 1; }
    .chev { color: var(--mm-text-3); }
    .subnav { display: grid; gap: 2px; margin: 2px 0 4px 22px; padding: 0 0 0 14px; border-left: 1px solid var(--mm-border); }
    .subnav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--mm-radius-sm); color: var(--mm-text-2); font-size: 13px; }
    .subnav-item:hover { background: var(--mm-surface-muted); text-decoration: none; }
    .subnav-item.active { background: var(--mm-brand-50); color: var(--mm-brand-600); }
    .subnav-item span { flex: 1; }
    .powered { padding: 14px; text-align: center; font-size: 11px; color: var(--mm-text-3); }
  `],
})
export class SidebarComponent {
  readonly active = input('dashboard');
  readonly collapse = output<void>();
  private readonly expanded = signal<Record<string, boolean>>({});
  protected readonly items = NAV_ITEMS;

  isExpanded(id: string): boolean {
    const item = this.items.find((navItem) => navItem.id === id);
    return this.expanded()[id] ?? Boolean(item?.children?.some((child) => child.id === this.active()));
  }

  toggleChildren(event: MouseEvent, id: string): void {
    event.preventDefault();
    this.expanded.update((current) => ({ ...current, [id]: !this.isExpanded(id) }));
  }
}
