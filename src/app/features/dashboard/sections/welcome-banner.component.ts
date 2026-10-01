import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WelcomeFeature } from '../../../core/models/dashboard.models';
import { IconComponent } from '../../../shared/ui/icon.component';

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
  imports: [IconComponent],
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


    @if (dismissible()) {
      <button type="button" class="dismiss" aria-label="Dismiss banner" (click)="dismiss.emit()">
        <mm-icon name="x" [size]="14" />
      </button>
    }
  `,
  styles: [`
    :host {
      position: relative; display: block; min-height: 220px; padding: 24px 22px 18px; border-radius: 14px; overflow: hidden; color: #fff;
      background: linear-gradient(90deg, var(--mm-brand-700), var(--mm-brand-600));
    }
    .pattern { position: absolute; inset: 0; width: 100%; height: 100%; }
    .content { position: relative; display: flex; flex-direction: column; gap: 0; max-width: 520px; }
    h2 { margin: 0 0 5px; font-size: 28px; line-height: 1.15; font-weight: 700; letter-spacing: 0; }
    .sub { margin: 0 0 12px; font-size: 14px; line-height: 1.25; opacity: .8; }
    .features { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .features li {
      display: flex; align-items: center; gap: 10px; height: 50px; padding: 7px 10px; border-radius: 11px;
      background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
    }
    .features strong { display: block; font-size: 12px; line-height: 1.15; }.features small { display: block; margin-top: 2px; font-size: 10px; line-height: 1.1; opacity: .72; }
    .f-icon { display: grid; place-items: center; width: 30px; height: 30px; flex: none; border-radius: 50%; background: rgba(255,255,255,.16); }
    .dismiss {
      position: absolute; top: 12px; right: 12px; display: grid; place-items: center; width: 28px; height: 28px;
      border: 0; border-radius: 50%; background: rgba(255,255,255,.12); color: #fff;
    }
    @media (max-width: 900px) {
      :host { min-height: 180px; padding: 18px 10px 16px 16px; border-radius: 10px; }
      .content { gap: 4px; }
      h2 { font-size: 18px; }
      .sub { margin-bottom: 5px; font-size: 9px; }
      .features { gap: 4px; }
      .features li { gap: 5px; padding: 5px 6px; border-radius: 7px; }
      .features strong { font-size: 8px; }.features small { font-size: 7px; }.f-icon { width: 18px; height: 18px; }
    }
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
