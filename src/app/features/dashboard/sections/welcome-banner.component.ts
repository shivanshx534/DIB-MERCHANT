import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WelcomeFeature } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';
import { AedPipe } from '../../../shared/pipes/aed.pipe';

const FEATURE_ICON: Record<WelcomeFeature['icon'], string> = {
  shield: 'shield', growth: 'growth', percent: 'percent', headset: 'headset',
};

/**
 * Brand banner. Recommendation: show on the first visits only, or let the merchant dismiss it
 * (persist the dismissal server-side per user).
 */
@Component({
  selector: 'mm-welcome-banner',
  standalone: true,
  imports: [IconComponent, AedPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="pattern" aria-hidden="true">
      <defs>
        <pattern id="mm-star" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M40 10 L46.6 24.1 L61.2 18.8 L55.9 33.4 L70 40 L55.9 46.6 L61.2 61.2 L46.6 55.9 L40 70 L33.4 55.9 L18.8 61.2 L24.1 46.6 L10 40 L24.1 33.4 L18.8 18.8 L33.4 24.1 Z"
                fill="none" stroke="#fff" stroke-opacity=".08" />
        </pattern>
        <linearGradient id="mm-fade" x1="0" x2="1">
          <stop offset=".35" stop-color="#095c38" />
          <stop offset=".6" stop-color="#0b6a40" stop-opacity="0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#mm-star)" />
      <rect width="100%" height="100%" fill="url(#mm-fade)" />
    </svg>

    <div class="content">
      <h2>{{ title() }}</h2>
      <p class="sub">{{ subtitle() }}</p>
      <ul class="features">
        @for (f of features(); track f.title) {
          <li>
            <span class="f-icon"><mm-icon [name]="iconFor(f)" [size]="16" /></span>
            <span><strong>{{ f.title }}</strong><small>{{ f.description }}</small></span>
          </li>
        }
      </ul>
    </div>

    <div class="illustration" aria-hidden="true">
      <div class="float security"><span class="badge"><mm-icon name="shield" [size]="14" /></span>Bank-Grade Security</div>
      <div class="float support"><span class="badge light"><mm-icon name="headset" [size]="12" /></span>24/7 Support</div>
      <div class="collections">
        <div class="c-head">
          <div><small>Today’s collections</small><strong>{{ collected() | aed }}</strong></div>
          <span class="mm-chip mm-chip--success">▲ 12.4%</span>
        </div>
        <svg viewBox="0 0 244 64" preserveAspectRatio="none">
          <defs><linearGradient id="mm-area" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0e7a4a" stop-opacity=".22"/><stop offset="1" stop-color="#0e7a4a" stop-opacity="0"/></linearGradient></defs>
          <path d="M0 44.8 C13.6 44.8 13.6 37.1 27.1 37.1 C40.7 37.1 40.7 39.7 54.2 39.7 C67.8 39.7 67.8 28.8 81.3 28.8 C94.9 28.8 94.9 32 108.4 32 C122 32 122 20.5 135.6 20.5 C149.1 20.5 149.1 24.3 162.7 24.3 C176.2 24.3 176.2 12.8 189.8 12.8 C203.3 12.8 203.3 16.6 216.9 16.6 C230.4 16.6 230.4 5.1 244 5.1 L244 64 L0 64 Z" fill="url(#mm-area)"/>
          <path d="M0 44.8 C13.6 44.8 13.6 37.1 27.1 37.1 C40.7 37.1 40.7 39.7 54.2 39.7 C67.8 39.7 67.8 28.8 81.3 28.8 C94.9 28.8 94.9 32 108.4 32 C122 32 122 20.5 135.6 20.5 C149.1 20.5 149.1 24.3 162.7 24.3 C176.2 24.3 176.2 12.8 189.8 12.8 C203.3 12.8 203.3 16.6 216.9 16.6 C230.4 16.6 230.4 5.1 244 5.1" fill="none" stroke="#0e7a4a" stroke-width="2.5"/>
        </svg>
      </div>
      <div class="float payout">
        <span class="badge tint"><mm-icon name="check" [size]="13" /></span>
        <span><small>Payout received</small><strong>{{ lastPayout() | aed }}</strong></span>
      </div>
    </div>

    @if (dismissible()) {
      <button type="button" class="dismiss" aria-label="Dismiss banner" (click)="dismiss.emit()">
        <mm-icon name="x" [size]="14" />
      </button>
    }
  `,
  styles: [`
    :host {
      position: relative; display: grid; grid-template-columns: 55% 45%; gap: 0;
      height: 300px; padding: 24px 22px 18px; border-radius: 14px; overflow: hidden; color: #fff;
      background: linear-gradient(90deg, var(--mm-brand-700), var(--mm-brand-600));
    }
    .pattern { position: absolute; inset: 0; width: 100%; height: 100%; }
    .content { position: relative; display: flex; flex-direction: column; gap: 0; }
    h2 { margin: 0 0 5px; font-size: 28px; line-height: 1.15; font-weight: 700; letter-spacing: 0; }
    .sub { margin: 0 0 12px; font-size: 14px; line-height: 1.25; opacity: .8; }
    .features { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .features li {
      display: flex; align-items: center; gap: 10px; height: 50px; padding: 7px 10px; border-radius: 11px;
      background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
    }
    .features strong { display: block; font-size: 12px; line-height: 1.15; }.features small { display: block; margin-top: 2px; font-size: 10px; line-height: 1.1; opacity: .72; }
    .f-icon { display: grid; place-items: center; width: 30px; height: 30px; flex: none; border-radius: 50%; background: rgba(255,255,255,.16); }
    .illustration { position: relative; min-width: 0; height: 100%; min-height: 0; overflow: hidden; color: var(--mm-text-1); }
    .collections {
      position: absolute; left: 18%; top: 58px; width: min(300px, 72%); padding: 13px 16px;
      background: #fff; border-radius: 14px; box-shadow: var(--mm-shadow-float);
    }
    .c-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .c-head small { display: block; font-size: 11px; color: var(--mm-text-3); }
    .c-head strong { font-size: 19px; }
    .collections svg { width: 100%; height: 58px; display: block; }
    .float {
      position: absolute; display: flex; align-items: center; gap: 10px; padding: 8px 14px 8px 10px;
      background: #fff; border-radius: var(--mm-radius-lg); box-shadow: var(--mm-shadow-float);
      font-size: 12px; font-weight: 600;
    }
    .security { left: 2%; top: 8px; max-width: 48%; }.support { right: 0; top: 14px; max-width: 42%; color: #fff; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.3); border-radius: 999px; box-shadow: none; padding: 6px 12px 6px 8px; }.payout { right: 0; left: auto; bottom: 0; top: auto; max-width: 48%; white-space: nowrap; }
    .payout small { display: block; font-size: 10.5px; font-weight: 400; color: var(--mm-text-3); }
    .payout strong { font-size: 13px; }
    .badge { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--mm-brand-600); color: #fff; }
    .badge.light { width: 24px; height: 24px; background: #fff; color: var(--mm-brand-600); }
    .badge.tint { background: var(--mm-brand-50); color: var(--mm-brand-600); }
    .dismiss {
      position: absolute; top: 12px; right: 12px; display: grid; place-items: center; width: 28px; height: 28px;
      border: 0; border-radius: 50%; background: rgba(255,255,255,.12); color: #fff;
    }
    @media (max-width: 1279px) {
      :host { grid-template-columns: minmax(0, 1.2fr) minmax(220px, .8fr); height: 270px; padding: 24px 16px 18px 22px; }
      .illustration { display: block; transform: scale(.82); transform-origin: right center; }
    }
    @media (max-width: 900px) {
      :host { grid-template-columns: minmax(0, 1.1fr) minmax(170px, .9fr); height: 220px; padding: 18px 10px 16px 16px; border-radius: 10px; }
      .illustration { transform: scale(.62); transform-origin: right center; margin-left: -48px; }
      .content { gap: 4px; }
      h2 { font-size: 18px; }
      .sub { margin-bottom: 5px; font-size: 9px; }
      .features { gap: 4px; }
      .features li { gap: 5px; padding: 5px 6px; border-radius: 7px; }
      .features strong { font-size: 8px; }.features small { font-size: 7px; }.f-icon { width: 18px; height: 18px; }
    }
    @media (max-width: 600px) { :host { grid-template-columns: 1fr; padding-right: 16px; }.illustration { display: none; } }
    @media (max-width: 767px) { .features { grid-template-columns: 1fr 1fr; } h2 { font-size: 18px; } }
  `],
})
export class WelcomeBannerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly features = input.required<WelcomeFeature[]>();
  readonly collected = input(0);
  readonly lastPayout = input(0);
  readonly dismissible = input(true);
  readonly dismiss = output<void>();
  protected iconFor = (f: WelcomeFeature) => FEATURE_ICON[f.icon];
}
