import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar.component';
import { TopbarComponent } from '../layout/topbar.component';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [SidebarComponent, TopbarComponent, RouterOutlet],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'[class.horizontal-layout]': 'horizontalLayout()',
	},
	template: `
		<mm-sidebar class="sidebar" [class.top-nav]="horizontalLayout()" [class.mobile-open]="mobileNavOpen()" [active]="activeSection" />
		@if (mobileNavOpen()) { <button class="mobile-backdrop" type="button" aria-label="Close navigation" (click)="closeMobileNav()"></button> }
		<div class="main">
			<mm-topbar
				merchantName="DemoAanipayMerchant"
				language="English"
				[hasNotifications]="true"
				[horizontalLayout]="horizontalLayout()"
				(menuToggle)="toggleMobileNav()"
				(layoutToggle)="toggleLayout()"
			/>
			<main><router-outlet /></main>
		</div>
	`,
	styles: [`
		:host { display: flex; min-height: 100vh; min-width: 0; --dashboard-sidebar-w: 250px; --dashboard-topbar-h: 84px; }
		:host.horizontal-layout { flex-direction: column; }
		.sidebar { position: sticky; top: 0; height: 100vh; flex: 0 0 var(--dashboard-sidebar-w); width: var(--dashboard-sidebar-w); --mm-sidebar-w: var(--dashboard-sidebar-w); --mm-topbar-h: var(--dashboard-topbar-h); }
		:host.horizontal-layout .sidebar { position: sticky; top: 0; z-index: 20; flex: 0 0 auto; width: 100%; height: auto; }
		.mobile-backdrop { display: none; }
		.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
		.main > main { width: 100%; min-width: 0; }
		mm-topbar { position: sticky; top: 0; z-index: 10; height: var(--dashboard-topbar-h); }
		@media (max-width: 1023px) {
			:host:not(.horizontal-layout) .sidebar {
				position: fixed; inset-inline-start: 0; top: 0; z-index: 40; display: flex;
				width: min(280px, calc(100vw - 48px)); height: 100dvh; flex: 0 0 min(280px, calc(100vw - 48px));
				transform: translateX(-105%); transition: transform 180ms ease; overflow-y: auto;
				box-shadow: 12px 0 32px rgba(16, 24, 40, .14);
			}
			:host-context(html[dir='rtl']):not(.horizontal-layout) .sidebar { transform: translateX(105%); }
			:host:not(.horizontal-layout) .sidebar.mobile-open { transform: translateX(0); }
			:host-context(html[dir='rtl']):not(.horizontal-layout) .sidebar.mobile-open { transform: translateX(0); }
			:host.horizontal-layout .sidebar { position: relative; inset: auto; display: flex; height: auto; overflow: visible; transform: none; }
			:host.horizontal-layout .sidebar:not(.mobile-open) { display: none; }
			:host.horizontal-layout .sidebar.mobile-open { display: flex; }
			.mobile-backdrop { position: fixed; inset: 0; z-index: 35; display: block; border: 0; background: rgba(12, 27, 21, .32); }
		}
		@media (max-width: 767px) { :host { --dashboard-topbar-h: 64px; } }
	`],
})
export class DashboardComponent {
	private readonly router = inject(Router);
	protected readonly horizontalLayout = signal(false);
	protected readonly mobileNavOpen = signal(false);
	protected get activeSection(): string {
		if (this.router.url.includes('/invoices')) return 'invoices';
		if (this.router.url.includes('/qr-code')) return 'qr-code';
		if (this.router.url.includes('/qr-download')) return 'qr-code';
		return 'dashboard';
	}

	toggleLayout(): void {
		this.horizontalLayout.update((horizontal) => !horizontal);
		this.mobileNavOpen.set(false);
	}

	toggleMobileNav(): void {
		this.mobileNavOpen.update((open) => !open);
	}

	closeMobileNav(): void {
		this.mobileNavOpen.set(false);
	}
}
