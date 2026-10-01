import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon.component';

interface QrDownloadItem {
  id: string;
  storeName: string;
}

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

      <section class="qr-grid">
        @for (item of items; track item.id) {
          <article class="qr-card">
            <div class="qr-code" [attr.aria-label]="'QR code for ' + item.id">
              <span></span>
            </div>
            <strong class="terminal-id">{{ item.id }}</strong>
            <span class="store-name">{{ item.storeName }}</span>
            <button type="button" class="download" (click)="download(item)">
              <mm-icon name="download" [size]="17" /> Download
            </button>
          </article>
        }
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100%; background: var(--mm-canvas); }
    .page { max-width: 1400px; margin: 0 auto; padding: 0 22px 28px; }
    .breadcrumb { padding: 0 0 7px; color: var(--mm-text-3); font-size: 12px; }.breadcrumb span { padding: 0 4px; color: var(--mm-brand-600); }.breadcrumb strong { color: #0879d1; }
    .page-header { display: flex; align-items: center; padding: 0 0 18px; }.title-wrap { display: flex; align-items: center; gap: 14px; }.title-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 11px; background: #e6f3fb; color: #0879d1; } h1 { margin: 0; color: #182433; font-size: 24px; }
    .qr-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }.qr-card { display: flex; min-height: 356px; align-items: center; flex-direction: column; padding: 28px 18px 24px; background: #fff; border: 1px solid #e0e7ee; border-radius: 16px; box-shadow: 0 1px 3px rgba(16, 24, 40, .05); }
    .qr-code { position: relative; display: grid; place-items: center; width: 164px; height: 164px; margin: 0 0 17px; background-color: #fff; background-image: linear-gradient(45deg, #45505d 25%, transparent 25%, transparent 75%, #45505d 75%), linear-gradient(45deg, #45505d 25%, transparent 25%, transparent 75%, #45505d 75%); background-position: 0 0, 8px 8px; background-size: 16px 16px; border: 7px solid #fff; box-shadow: 0 0 0 1px #e5e9ef; }
    .qr-code::before, .qr-code::after, .qr-code span { position: absolute; width: 35px; height: 35px; border: 7px solid #45505d; background: #fff; content: ''; }.qr-code::before { top: 7px; left: 7px; }.qr-code::after { top: 7px; right: 7px; }.qr-code span { bottom: 7px; left: 7px; }
    .terminal-id { color: #182433; font-size: 16px; }.store-name { margin-top: 4px; color: #748299; font-size: 13px; text-align: center; }.download { display: inline-flex; align-items: center; gap: 8px; min-height: 36px; margin-top: 16px; padding: 0 18px; border: 0; border-radius: 22px; background: #AD0B43 !important; color: #fff !important; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }.download:hover { background: #920938 !important; }
    @media (max-width: 900px) { .qr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 600px) { .page { padding: 0 16px 20px; }.qr-grid { grid-template-columns: 1fr; }.qr-card { min-height: 330px; } }
  `],
})
export class QrDownloadPage {
  protected readonly items: QrDownloadItem[] = [
    { id: 'TID10029931', storeName: 'DemoAanipayMerchant' },
    { id: 'TID10029932', storeName: 'DemoAanipayMerchant - Branch 2' },
    { id: 'TID10029933', storeName: 'DemoAanipayMerchant - Branch 3' },
  ];

  download(item: QrDownloadItem): void {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="white"/><path fill="#45505d" d="M32 32h128v128H32zM352 32h128v128H352zM32 352h128v128H32zM192 32h32v32h-32zM256 32h32v64h-32zM192 96h64v32h-64zM192 160h32v64h-32zM256 160h32v32h-32zM320 192h32v64h-32zM384 192h64v32h-64zM192 288h64v32h-64zM288 288h32v64h-32zM352 288h32v32h-32zM416 288h64v32h-64zM192 384h32v64h-32zM256 384h64v32h-64zM352 384h32v64h-32zM416 416h64v32h-64z"/></svg>`;
    const link = document.createElement('a');
    link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    link.download = `${item.id}-qr.svg`;
    link.click();
  }
}
