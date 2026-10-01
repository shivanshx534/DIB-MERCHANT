import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { linePath, scale } from '../utils/chart.utils';

/** Decorative trend line inside KPI cards (the value itself is in text). */
@Component({
  selector: 'mm-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.viewBox]="'0 0 ' + w + ' ' + h" preserveAspectRatio="none" aria-hidden="true">
      <path [attr.d]="d()" fill="none" [attr.stroke]="color()" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
    </svg>
  `,
  styles: [':host{display:block;height:36px} svg{width:100%;height:100%;overflow:visible}'],
})
export class SparklineComponent {
  readonly values = input.required<number[]>();
  readonly color = input('var(--mm-brand-600)');
  protected readonly w = 240;
  protected readonly h = 36;

  protected readonly d = computed(() => {
    const v = this.values();
    const x = scale(0, v.length - 1, 0, this.w);
    const y = scale(Math.min(...v), Math.max(...v), this.h, 0);
    return linePath(v.map((n, i) => ({ x: x(i), y: y(n) })));
  });
}
