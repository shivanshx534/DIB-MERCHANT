import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../layout/sidebar.component';
import { TopbarComponent } from '../layout/topbar.component';
import { CopilotPage } from '../features/copilot/copilot.page';
import { CopilotUiService } from '../core/services/copilot-ui.service';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [SidebarComponent, TopbarComponent, RouterOutlet, CopilotPage],
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
				(copilot)="openCopilot()"
			/>
			<main><router-outlet /></main>
		</div>
		@if (copilotUi.isOpen()) {
			<button class="copilot-backdrop" type="button" aria-label="Close Merchant Copilot" (click)="closeCopilot()"></button>
			<aside class="copilot-drawer" role="dialog" aria-modal="true" aria-label="Merchant Copilot">
				<mm-copilot-page [drawerMode]="true" [initialQuestion]="copilotUi.question()" (close)="closeCopilot()" />
			</aside>
		}
	`,
	styles: [`
		:host { display: flex; min-height: 100vh; --dashboard-sidebar-w: 250px; --dashboard-topbar-h: 84px; }
		:host.horizontal-layout { flex-direction: column; }
		.sidebar { position: sticky; top: 0; height: 100vh; flex: 0 0 var(--dashboard-sidebar-w); width: var(--dashboard-sidebar-w); --mm-sidebar-w: var(--dashboard-sidebar-w); --mm-topbar-h: var(--dashboard-topbar-h); }
		:host.horizontal-layout .sidebar { position: sticky; top: 0; z-index: 20; flex: 0 0 auto; width: 100%; height: auto; }
		.mobile-backdrop { display: none; }
		.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
		mm-topbar { position: sticky; top: 0; z-index: 10; height: var(--dashboard-topbar-h); }
		.copilot-backdrop { position: fixed; inset: 0; z-index: 39; border: 0; background: rgba(20, 35, 29, .08); animation: backdrop-in 180ms ease-out; }
		.copilot-drawer { position: fixed; inset: 0 0 0 auto; z-index: 40; width: min(500px, 100vw); height: 100dvh; transform: none !important; background: var(--mm-surface); border-left: 1px solid var(--mm-border); box-shadow: -16px 0 36px rgba(16, 24, 40, .14); }
		@keyframes backdrop-in { from { opacity: 0; } to { opacity: 1; } }
		@media (max-width: 1023px) { :host:not(.horizontal-layout) .sidebar { display: none; } }
		@media (max-width: 900px) {
			:host:not(.horizontal-layout) .sidebar { position: relative; inset: auto; z-index: 20; display: flex; width: 122px; height: 100vh; flex: 0 0 122px; transform: none; overflow-y: auto; }
			:host:not(.horizontal-layout) .sidebar.mobile-open { display: flex; }
			:host:not(.horizontal-layout) mm-topbar { display: none; }
			:host:not(.horizontal-layout) .sidebar .brand { height: 64px; gap: 5px; padding: 8px 6px; }
			:host:not(.horizontal-layout) .sidebar .brand-text { font-size: 10px; }
			:host:not(.horizontal-layout) .sidebar .brand-text span { font-size: 8px; }
			:host:not(.horizontal-layout) .sidebar .collapse { display: none; }
			:host:not(.horizontal-layout) .sidebar nav { padding: 8px 4px; }
			:host:not(.horizontal-layout) .sidebar .nav-item { gap: 5px; padding: 8px 4px; font-size: 10px; }
			:host:not(.horizontal-layout) .sidebar .nav-item span { white-space: normal; }
			:host:not(.horizontal-layout) .sidebar .subnav { margin-left: 8px; padding-left: 4px; }
			:host.horizontal-layout .sidebar { position: relative; inset: auto; display: flex; height: auto; overflow: visible; transform: none; }
			:host.horizontal-layout .sidebar:not(.mobile-open) { display: none; }
			:host.horizontal-layout .sidebar.mobile-open { display: flex; }
			.mobile-backdrop { position: fixed; inset: 0; z-index: 35; display: block; border: 0; background: rgba(12, 27, 21, .28); }
		}
		@media (max-width: 767px) { :host { --dashboard-topbar-h: 64px; } }
		@media (prefers-reduced-motion: reduce) { .copilot-backdrop, .copilot-drawer { animation: none; } }
	`],
})
export class DashboardComponent {
	private readonly router = inject(Router);
	protected readonly copilotUi = inject(CopilotUiService);
	protected readonly horizontalLayout = signal(false);
	protected readonly mobileNavOpen = signal(false);
	protected get activeSection(): string {
		if (this.router.url.includes('/copilot')) return 'copilot';
		if (this.router.url.includes('/invoices')) return 'invoices';
		if (this.router.url.includes('/qr-code')) return 'qr-code';
		if (this.router.url.includes('/qr-download')) return 'qr-code';
		return 'dashboard';
	}

	openCopilot(): void {
		this.copilotUi.open();
	}

	closeCopilot(): void {
		this.copilotUi.close();
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
