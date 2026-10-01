import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a number as UAE dirham.
 *   {{ 142900 | aed }}            -> "AED 142,900.00"
 *   {{ -890 | aed }}              -> "− AED 890.00"
 *   {{ 142900 | aed: 'compact' }} -> "AED 142.9k"
 *   {{ -14449.25 | aed: 'signed' }} -> "− 14,449.25" (no currency, used in breakdowns)
 */
@Pipe({ name: 'aed', standalone: true })
export class AedPipe implements PipeTransform {
  private readonly full = new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  private readonly compact = new Intl.NumberFormat('en-AE', { maximumFractionDigits: 1 });

  transform(value: number | null | undefined, mode: 'full' | 'compact' | 'signed' = 'full'): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    const sign = value < 0 ? '− ' : '';
    const abs = Math.abs(value);
    if (mode === 'compact') {
      if (abs >= 1_000_000) return `${sign}AED ${this.compact.format(abs / 1_000_000)}M`;
      if (abs >= 1_000) return `${sign}AED ${this.compact.format(abs / 1_000)}k`;
      return `${sign}AED ${this.compact.format(abs)}`;
    }
    if (mode === 'signed') return `${sign}${this.full.format(abs)}`;
    return `${sign}AED ${this.full.format(abs)}`;
  }
}
