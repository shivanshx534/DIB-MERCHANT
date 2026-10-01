import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon.component';
import { StaticQrEntry, QrService } from '../../core/services/qr.service';

@Component({
  selector: 'app-qr-download-page',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="breadcrumb">Accept Payments <span>/</span> <strong>QR - Download</strong></div>
      <header class="page-header">
        <div class="title-wrap"><div class="title-icon"><mm-icon name="qr" [size]="23" /></div><h1>QR - Download</h1></div>
      </header>

      @if (loading) {
        <div class="state">Loading QR codes...</div>
      } @else if (error) {
        <div class="state error">{{ error }}</div>
      } @else {
        <section class="qr-grid">
          @for (item of items; track item.terminalId) {
            <article class="qr-card">
              <div class="qr-code" [attr.aria-label]="'QR code for ' + item.terminalId">
                @if (item.imageUrl) {
                  <img [src]="item.imageUrl" [alt]="'QR code for ' + item.terminalId" />
                }
              </div>
              <strong class="terminal-id">{{ item.terminalId }}</strong>
              <span class="store-name">{{ item.storeName }}</span>
              <button type="button" class="download" (click)="download(item)">
                <mm-icon name="download" [size]="17" /> Download
              </button>
            </article>
          }
        </section>
      }
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100%; background: var(--mm-canvas); }
    .page { max-width: 1400px; margin: 0 auto; padding: 0 22px 28px; }
    .breadcrumb { padding: 0 0 7px; color: var(--mm-text-3); font-size: 12px; }.breadcrumb span { padding: 0 4px; color: var(--mm-brand-600); }.breadcrumb strong { color: #0879d1; }
    .page-header { display: flex; align-items: center; padding: 0 0 18px; }.title-wrap { display: flex; align-items: center; gap: 14px; }.title-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 11px; background: #e6f3fb; color: #0879d1; } h1 { margin: 0; color: #182433; font-size: 24px; }
    .qr-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }.qr-card { display: flex; min-height: 356px; align-items: center; flex-direction: column; padding: 28px 18px 24px; background: #fff; border: 1px solid #e0e7ee; border-radius: 16px; box-shadow: 0 1px 3px rgba(16, 24, 40, .05); }
    .qr-code { position: relative; display: grid; place-items: center; width: 164px; height: 164px; margin: 0 0 17px; background: #fff; border: 7px solid #fff; box-shadow: 0 0 0 1px #e5e9ef; overflow: hidden; }
    .qr-code img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .terminal-id { color: #182433; font-size: 16px; }.store-name { margin-top: 4px; color: #748299; font-size: 13px; text-align: center; }.download { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; margin-top: 16px; padding: 0 18px; border: 0; border-radius: 22px; background: #AD0B43 !important; color: #fff !important; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }.download:hover { background: #920938 !important; }
    .state { padding: 20px 10px; color: var(--mm-text-2); }
    .state.error { color: var(--mm-danger-text); }
    @media (max-width: 900px) { .qr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .page { padding: 0 16px 20px; }.qr-grid { grid-template-columns: 1fr; }.qr-card { min-height: 330px; } }
    @media (max-width: 420px) { .page { padding-inline: 12px; }.qr-card { padding-inline: 14px; }.qr-code { width: min(164px, 68vw); height: auto; aspect-ratio: 1; } }
  `],
})
export class QrDownloadPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly qrService = inject(QrService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  protected items: Array<StaticQrEntry & { imageUrl?: string }> = [];
  protected loading = true;
  protected error = '';

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    const terminalId = this.route.snapshot.queryParamMap.get('terminalId') ?? '00449936';
    const storeId = this.route.snapshot.queryParamMap.get('storeId') ?? '00449936';
    const merchantId = this.route.snapshot.queryParamMap.get('merchantId') ?? '00449936';

    this.qrService.listStaticQr(merchantId).subscribe({
      next: (entries) => {
        const list = entries.length ? entries : [{ terminalId, storeName: 'Current Terminal', merchantId, storeId }];
        this.items = list.map((item) => ({ ...item, imageUrl: '' }));

        this.items.forEach((item, index) => {
          this.qrService.viewStaticQr(item.terminalId, item.storeId || storeId, item.merchantId || merchantId).subscribe({
            next: (imageUrl) => {
              this.items[index] = { ...this.items[index], imageUrl };
              this.changeDetector.markForCheck();
            },
            error: () => {
              this.items[index] = { ...this.items[index], imageUrl: '' };
              this.changeDetector.markForCheck();
            },
          });
        });

        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'Unable to load QR codes right now.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  download(item: StaticQrEntry & { imageUrl?: string }): void {
    const terminalId = item.terminalId;
    const storeId = item.storeId || '00449936';
    const merchantId = item.merchantId || '00449936';

    this.qrService.downloadStaticQr(terminalId, storeId, merchantId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${terminalId}-qr.png`;
        link.click();
        URL.revokeObjectURL(url);
      },
      error: () => {
        if (item.imageUrl) {
          const link = document.createElement('a');
          link.href = item.imageUrl;
          link.download = `${terminalId}-qr.png`;
          link.click();
        }
      },
    });
  }
}
