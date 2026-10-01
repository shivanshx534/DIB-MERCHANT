import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { Period } from '../../core/models/dashboard.models';
import { DashboardService } from '../../core/services/dashboard.service';
import { PageHeaderComponent } from './sections/page-header.component';
import { WelcomeBannerComponent } from './sections/welcome-banner.component';
import { SalesTrendComponent } from './sections/sales-trend.component';
import { ChannelMixComponent } from './sections/channel-mix.component';
import { PaymentHealthComponent } from './sections/payment-health.component';
import { RecentTransactionsComponent } from './sections/recent-transactions.component';

/**
 * Merchant dashboard (Figma: "Dashboard v2 — Merchant cockpit", node 2133:14).
 * Section order is intentional: money → key numbers → to-dos → trend → payments → breakdowns.
 */
@Component({
  selector: 'mm-dashboard-page',
  standalone: true,
  imports: [
    PageHeaderComponent, WelcomeBannerComponent, SalesTrendComponent,
    ChannelMixComponent, PaymentHealthComponent, RecentTransactionsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as d) {
      <mm-page-header
        [greeting]="d.greeting" [merchantName]="d.merchant.name" [dateLabel]="d.dateLabel"
        [compareLabel]="d.compareLabel" [period]="period()" (periodChange)="period.set($event)" />

      <div class="banner-trend">
        @if (showWelcome()) {
          <mm-welcome-banner
            [title]="d.welcome.title" [subtitle]="d.welcome.subtitle" [features]="d.welcome.features"
            [collected]="d.settlement.collectedToday" [lastPayout]="d.settlement.lastPayout.amount"
            (dismiss)="showWelcome.set(false)" />
        }
        <mm-sales-trend [data]="d.salesTrend" />
      </div>

      <div class="row halves">
        <mm-channel-mix [channels]="d.channels" [paymentsCount]="d.settlement.paymentsCount" />
        <mm-payment-health [health]="d.health" />
      </div>

      <mm-recent-transactions [transactions]="d.transactions" [total]="d.transactionsTotal" [counts]="d.counts" />

    } @else {
      <div class="skeleton" aria-busy="true" aria-label="Loading dashboard">
        @for (i of [1, 2, 3, 4]; track i) { <div class="sk"></div> }
      </div>
    }

  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 24px; width: 100%; margin: 0; padding: 32px clamp(24px, 3.25vw, 54px) 32px 32px; }
    mm-page-header { margin-top: -8px; }
    .row { display: grid; gap: 16px; }
    .banner-trend { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(320px, .85fr); gap: 16px; align-items: stretch; }
    .two-one { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .halves { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .mobile-hide { display: block; }
    .skeleton { display: grid; gap: 24px; }
    .sk { height: 180px; border-radius: 16px; background: linear-gradient(90deg, #eef1f0, #f7f9f8, #eef1f0); background-size: 200% 100%; animation: sh 1.2s infinite linear; }
    @keyframes sh { to { background-position: -200% 0; } }
    @media (max-width: 1279px) { .banner-trend { grid-template-columns: 1fr; } }
    @media (max-width: 1023px) { .halves { grid-template-columns: 1fr; } }
    @media (max-width: 900px) { :host { padding: 14px 16px 24px; gap: 10px; } .mobile-hide { display: none; } .two-one, .halves { grid-template-columns: 1fr; gap: 10px; } }
    @media (max-width: 767px) { :host { padding: 14px 12px 20px; gap: 12px; } }
  `],
})
export class DashboardPage {
  private readonly api = inject(DashboardService);

  protected readonly period = signal<Period>('today');
  protected readonly showWelcome = signal(true);

  protected readonly data = toSignal(
    toObservable(this.period).pipe(switchMap((p) => this.api.getDashboard(p))),
  );

}
