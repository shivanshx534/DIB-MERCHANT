import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { IconComponent } from '../../shared/ui/icon.component';
import { MerchantTerminal, QrService, StaticQrEntry } from '../../core/services/qr.service';

@Component({
  selector: 'app-qr-terminal-page',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="breadcrumb">Accept Payments <span>/</span> <strong>QR - List Terminal</strong></div>
      <header class="page-header">
        <div class="title-wrap"><div class="title-icon"><mm-icon name="qr" [size]="23" /></div><h1>QR - List Terminal</h1></div>
      </header>

      <section class="terminal-card">
        @if (loading) {
          <div class="state">Loading terminals...</div>
        } @else if (error) {
          <div class="state error">{{ error }}</div>
        } @else {
          <div class="table-wrap">
            <table>
              <thead><tr><th>Terminal ID</th><th>Store Name</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                @for (terminal of terminals; track terminal.terminalId) {
                  <tr>
                    <td><strong>{{ terminal.terminalId }}</strong></td>
                    <td>{{ terminal.storeName || terminal.terminalName }}</td>
                    <td><span class="status" [class.active]="isActive(terminal.status)" [class.inactive]="!isActive(terminal.status)">{{ isActive(terminal.status) ? 'Active' : 'Inactive' }}</span></td>
                    <td>
                      <div class="action-buttons">
                        <button type="button" class="action-button view" aria-label="View QR" title="View QR" (click)="viewQr(terminal)"><mm-icon name="search" [size]="16" /></button>
                        <button type="button" class="action-button download" aria-label="Download QR code" title="Download QR code" (click)="downloadQr(terminal)"><mm-icon name="download" [size]="16" /></button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (actionError) {
          <div class="state error" role="alert">{{ actionError }}</div>
        }

        @if (selectedQr) {
          <div class="qr-preview" (click)="closePreview()">
            <section class="preview-content" role="dialog" aria-modal="true" aria-labelledby="preview-title" (click)="$event.stopPropagation()">
              <header class="preview-header">
                <div>
                  <span class="preview-kicker">STATIC QR CODE</span>
                  <h2 id="preview-title">QR code</h2>
                </div>
                <button type="button" class="close-button" aria-label="Close QR preview" (click)="closePreview()"><mm-icon name="x" [size]="17" /></button>
              </header>
              <p class="preview-store">{{ selectedQr.storeName || selectedQr.terminalName }}</p>
              <div class="preview-image-wrap">
                <img [src]="selectedQr.imageUrl" [alt]="'QR code for ' + selectedQr.terminalId" />
              </div>
              <div class="preview-meta">
                <span>Terminal ID</span>
                <strong>{{ selectedQr.terminalId }}</strong>
              </div>
              <button type="button" class="preview-download" (click)="downloadQr(selectedQr)">
                <mm-icon name="download" [size]="17" /> Download QR
              </button>
            </section>
          </div>
        }
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100%; background: var(--mm-canvas); }
    .page { max-width: 1400px; margin: 0 auto; padding: 0 22px 28px; }
    .breadcrumb { padding: 0 0 7px; color: var(--mm-text-3); font-size: 12px; }.breadcrumb span { padding: 0 4px; color: var(--mm-brand-600); }.breadcrumb strong { color: #0879d1; }
    .page-header { display: flex; align-items: center; padding: 0 0 18px; }.title-wrap { display: flex; align-items: center; gap: 14px; }.title-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 11px; background: #e6f3fb; color: #0879d1; } h1 { margin: 0; color: #182433; font-size: 24px; }
    .terminal-card { position: relative; overflow: hidden; background: #fff; border: 1px solid #e0e7ee; border-radius: 16px; box-shadow: 0 1px 3px rgba(16, 24, 40, .05); padding: 22px 24px; }
    .table-wrap { overflow-x: auto; } table { width: 100%; min-width: 760px; border-collapse: collapse; } th { padding: 14px 16px; background: #f0f4f8; color: #65758d; font-size: 12px; text-align: left; text-transform: uppercase; letter-spacing: .04em; } td { padding: 18px 16px; border-bottom: 1px solid #e1e8ef; color: #344255; font-size: 18px; } td strong { color: #182433; font-weight: 700; } tbody tr:last-child td { border-bottom: 0; }
    .status { display: inline-flex; padding: 8px 18px; border-radius: 999px; font-size: 14px; font-weight: 700; min-width: 112px; justify-content: center; }.status.active { background: #dff6e7; color: #1a8a59; }.status.inactive { background: #fce4e6; color: #d64064; }
    .action-buttons { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
    .action-button { display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid #dfe6ee; border-radius: 50%; background: #fff; color: #7f8ea4; cursor: pointer; transition: .2s ease; }
    .action-button:hover { border-color: #a7b6c8; color: #4b5971; box-shadow: 0 4px 10px rgba(16,24,40,.06); }
    .action-button.download:hover { color: #0b7bd3; }
    .qr-preview { position: fixed; inset: 0; z-index: 1200; display: grid; place-items: center; overflow-y: auto; padding: 24px; background: rgba(16, 24, 40, .48); backdrop-filter: blur(5px); animation: preview-fade-in .18s ease-out both; }
    .preview-content { display: flex; flex-direction: column; width: min(420px, 100%); max-height: calc(100dvh - 32px); overflow-y: auto; padding: 24px; background: #fff; border: 1px solid #e0e7ee; border-radius: 16px; box-shadow: 0 24px 72px rgba(15, 23, 42, .24); animation: preview-rise-in .22s ease-out both; }
    .preview-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
    .preview-kicker { color: #748299; font-size: 11px; font-weight: 700; letter-spacing: .08em; }
    .preview-header h2 { margin: 5px 0 0; color: #182433; font-size: 22px; line-height: 1.2; }
    .close-button { display: grid; place-items: center; flex: 0 0 36px; width: 36px; height: 36px; padding: 0; border: 1px solid #dfe7ef; border-radius: 50%; background: #fff; color: #64748b; cursor: pointer; }
    .close-button:hover { background: #f4f7fa; color: #182433; }
    .preview-store { margin: 12px 0 18px; color: #64748b; font-size: 14px; }
    .preview-image-wrap { display: grid; place-items: center; width: 100%; aspect-ratio: 1; max-height: 300px; padding: 18px; background: #f6f9fc; border: 1px solid #e5edf6; border-radius: 14px; }
    .preview-image-wrap img { display: block; width: 100%; height: 100%; object-fit: contain; background: #fff; }
    .preview-meta { display: flex; flex-direction: column; gap: 4px; margin: 18px 0; }
    .preview-meta span { color: #748299; font-size: 12px; }
    .preview-meta strong { color: #182433; font-size: 15px; }
    .preview-download { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 44px; width: 100%; border: 0; border-radius: 8px; background: #ad0b43; color: #fff; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
    .preview-download:hover { background: #920938; }
    @keyframes preview-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes preview-rise-in { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .state { padding: 20px 10px; color: var(--mm-text-2); }
    .state.error { color: var(--mm-danger-text); }
    @media (max-width: 767px) {
      .page { padding: 0 16px 20px; }
      .terminal-card { padding: 14px; }
      .page-header { padding-bottom: 16px; }
      .qr-preview { padding: 16px; }
      .preview-content { padding: 20px; }
    }
    @media (max-width: 420px) {
      .page { padding-inline: 12px; }
      .terminal-card { padding: 10px; }
      .qr-preview { padding: 10px; }
      .preview-content { max-height: calc(100dvh - 20px); padding: 16px; }
      .preview-image-wrap { padding: 12px; }
    }
  `],
})
export class QrTerminalPage implements OnInit {
  private readonly qrService = inject(QrService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  protected terminals: MerchantTerminal[] = [];
  protected loading = true;
  protected error = '';
  protected actionError = '';
  protected selectedQr: (MerchantTerminal & { imageUrl: string }) | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    forkJoin({
      terminals: this.qrService.listTerminals(),
      qrEntries: this.qrService.listStaticQr().pipe(catchError(() => of([] as StaticQrEntry[]))),
    }).subscribe({
      next: ({ terminals, qrEntries }) => {
        const qrByTerminal = new Map(qrEntries.map((entry) => [entry.terminalId, entry]));
        this.terminals = terminals.map((terminal) => {
          const qrEntry = qrByTerminal.get(terminal.terminalId);
          return {
            ...terminal,
            merchantId: terminal.merchantId || qrEntry?.merchantId,
            storeId: terminal.storeId || qrEntry?.storeId,
            status: terminal.status ?? qrEntry?.status,
          };
        });
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'Unable to load terminals right now.';
        this.loading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  isActive(status: string | number | boolean | undefined): boolean {
    return status === '1' || status === 1 || status === 'active' || status === true;
  }

  viewQr(terminal: MerchantTerminal): void {
    this.actionError = '';
    const storeId = terminal.storeId || terminal.terminalId;
    const merchantId = terminal.merchantId || '00449936';

    this.qrService.viewStaticQr(terminal.terminalId, storeId, merchantId).subscribe({
      next: (imageUrl) => {
        this.selectedQr = {
          ...terminal,
          imageUrl,
        };
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.selectedQr = null;
        this.actionError = 'Unable to view this QR code. Check the terminal QR details and try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  downloadQr(terminal: MerchantTerminal): void {
    this.actionError = '';
    const storeId = terminal.storeId || terminal.terminalId;
    const merchantId = terminal.merchantId || '00449936';

    this.qrService.downloadStaticQr(terminal.terminalId, storeId, merchantId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${terminal.terminalId}-qr.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.actionError = 'Unable to download this QR code. Check the terminal QR details and try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  closePreview(): void {
    this.selectedQr = null;
  }
}
