import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { SalesTrend } from '../../../core/models/dashboard.models';
import { areaPath, scale, smoothPath } from '../../../shared/utils/chart.utils';
import { AedPipe } from '../../../shared/pipes/aed.pipe';

type Metric = 'net' | 'txns' | 'ticket';

/**
 * Replaces the old "Payment report" chart.
 * Current period (solid + area) vs previous period (dashed), refunds as bars.
 * Pure SVG — swap for your charting lib (ngx-echarts / Highcharts) if preferred; keep the encodings.
 */
@Component({
  selector: 'mm-sales-trend',
  standalone: true,
  imports: [AedPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="mm-card-head">
      <div>
        <h2 class="mm-card-title">Sales trend</h2>
        <p class="mm-card-sub">This week vs last week · refunds shown as bars</p>
      </div>
      <div class="mm-segmented" role="tablist" aria-label="Metric">
        @for (m of metrics; track m.id) {
          <button type="button" role="tab" [attr.aria-selected]="metric() === m.id" (click)="metric.set(m.id)">{{ m.label }}</button>
        }
      </div>
    </header>

    <figure>
      <div class="scroll" tabindex="0" aria-label="Sales trend chart, scroll horizontally">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="ariaSummary()">
        <defs>
          <linearGradient id="mm-trend-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#0e7a4a" stop-opacity=".18" />
            <stop offset="1" stop-color="#0e7a4a" stop-opacity="0" />
          </linearGradient>
        </defs>

        @for (t of ticks(); track t.v) {
          <line [attr.x1]="gx" [attr.x2]="W - 10" [attr.y1]="t.y" [attr.y2]="t.y" class="grid" />
          <text [attr.x]="gx - 10" [attr.y]="t.y + 4" text-anchor="end" class="axis">{{ t.label }}</text>
        }

        @for (b of bars(); track b.x) {
          <rect [attr.x]="b.x - 11" [attr.y]="b.y" width="22" [attr.height]="b.h" rx="4" class="bar" [class.spike]="b.spike" />
        }

        <path [attr.d]="area()" fill="url(#mm-trend-area)" />
        <path [attr.d]="prevLine()" class="prev" />
        <path [attr.d]="curLine()" class="cur" />

        @if (anomaly(); as a) {
          <g [attr.transform]="'translate(' + a.x + ',' + (a.y - 26) + ')'">
            <rect x="-40" y="-10" width="80" height="20" rx="10" class="spike-pill" />
            <text y="4" text-anchor="middle" class="spike-text">{{ a.label }}</text>
          </g>
        }

        @if (highlight(); as h) {
          <circle [attr.cx]="h.x" [attr.cy]="h.y" r="5" class="hl-dot" />
          <g [attr.transform]="'translate(' + (h.x - 150) + ',' + (h.y - 8) + ')'">
            <rect width="136" height="58" rx="8" class="tip" />
            <text x="10" y="18" class="tip-sub">{{ h.label }}</text>
            <text x="10" y="35" class="tip-val">{{ h.value | aed: 'full' }}</text>
            <text x="10" y="50" class="tip-delta">{{ h.delta }}</text>
          </g>
        }

        @for (p of xLabels(); track p.label) {
          <text [attr.x]="p.x" [attr.y]="gy + gh + 22" text-anchor="middle" class="axis x">{{ p.label }}</text>
        }
      </svg>
      </div>
      <figcaption class="legend">
        <span><i class="sw cur"></i>This week</span>
        <span><i class="sw prev"></i>Last week</span>
        <span><i class="sw ref"></i>Refunds</span>
      </figcaption>
    </figure>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; gap: 12px; padding: 18px 20px; }
    figure { margin: 0; }
    .scroll { overflow-x: auto; overscroll-behavior-x: contain; }
    svg { width: 100%; min-width: 640px; height: auto; display: block; overflow: visible; }
    .grid { stroke: var(--mm-border); }
    .axis { font-size: 11px; fill: var(--mm-text-3); }
    .axis.x { font-size: 11.5px; font-weight: 500; }
    .bar { fill: var(--mm-danger); opacity: .28; }
    .bar.spike { opacity: .9; }
    .prev { fill: none; stroke: var(--mm-chart-prev); stroke-width: 2; stroke-dasharray: 6 5; }
    .cur { fill: none; stroke: var(--mm-brand-600); stroke-width: 2.5; }
    .hl-dot { fill: #fff; stroke: var(--mm-brand-600); stroke-width: 2.5; }
    .tip { fill: var(--mm-text-1); }
    .tip-sub { font-size: 11px; fill: rgba(255,255,255,.75); }
    .tip-val { font-size: 13px; font-weight: 700; fill: #fff; }
    .tip-delta { font-size: 11px; font-weight: 600; fill: var(--mm-brand-accent); }
    .spike-pill { fill: var(--mm-danger-bg); }
    .spike-text { font-size: 10.5px; font-weight: 600; fill: var(--mm-danger-text); }
    .legend { display: flex; justify-content: center; flex-wrap: wrap; gap: 12px 20px; margin-top: 8px; font-size: 12px; font-weight: 500; color: var(--mm-text-2); }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .sw { display: inline-block; width: 18px; height: 0; border-top: 2.5px solid var(--mm-brand-600); }
    .sw.prev { border-top: 2px dashed var(--mm-chart-prev); }
    .sw.ref { width: 12px; height: 10px; border: 0; border-radius: 2px; background: var(--mm-danger); opacity: .5; }
    @media (max-width: 900px) { :host { gap: 12px; padding: 16px; }.legend { justify-content: flex-start; gap: 10px 16px; } }
  `],
  host: { class: 'mm-card' },
})
export class SalesTrendComponent {
  readonly data = input.required<SalesTrend>();
  protected readonly metric = signal<Metric>('net');
  protected readonly metrics: { id: Metric; label: string }[] = [
    { id: 'net', label: 'Net sales' },
    { id: 'txns', label: 'Transactions' },
    { id: 'ticket', label: 'Avg ticket' },
  ];

  // Geometry (viewBox units; the SVG scales to the card width)
  protected readonly W = 1132;
  protected readonly H = 250;
  protected readonly gx = 56;
  protected readonly gy = 10;
  protected readonly gh = 190;
  private readonly max = 25000;

  private readonly x = computed(() => scale(0, this.data().points.length - 1, this.gx + 30, this.W - 40));
  private readonly y = computed(() => scale(0, this.max, this.gy + this.gh, this.gy));

  protected readonly ticks = computed(() =>
    [25000, 20000, 15000, 10000, 5000, 0].map((v) => ({
      v, y: this.y()(v), label: v ? `AED ${v / 1000}k` : 'AED 0',
    })),
  );
  private readonly curPts = computed(() => this.data().points.map((p, i) => ({ x: this.x()(i), y: this.y()(p.current) })));
  private readonly prevPts = computed(() => this.data().points.map((p, i) => ({ x: this.x()(i), y: this.y()(p.previous) })));
  protected readonly curLine = computed(() => smoothPath(this.curPts()));
  protected readonly prevLine = computed(() => smoothPath(this.prevPts()));
  protected readonly area = computed(() => areaPath(this.curPts(), this.gy + this.gh));
  protected readonly bars = computed(() =>
    this.data().points.map((p, i) => {
      const y = this.y()(p.refunds);
      return { x: this.x()(i), y, h: this.gy + this.gh - y, spike: this.data().anomaly?.index === i };
    }),
  );
  protected readonly xLabels = computed(() => this.data().points.map((p, i) => ({ label: p.label, x: this.x()(i) })));
  protected readonly highlight = computed(() => {
    const h = this.data().highlight;
    return h ? { ...h, x: this.x()(h.index), y: this.y()(h.value) } : null;
  });
  protected readonly anomaly = computed(() => {
    const a = this.data().anomaly;
    if (!a) return null;
    const p = this.data().points[a.index];
    return { label: a.label, x: this.x()(a.index), y: this.y()(p.refunds) };
  });
  protected readonly ariaSummary = computed(() => {
    const pts = this.data().points;
    const last = pts[pts.length - 1];
    return `Net sales this week, ${pts.map((p) => `${p.label} AED ${p.current}`).join(', ')}. ` +
      `Today AED ${last.current} versus AED ${last.previous} last week.`;
  });

}
