import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon.component';

interface QrTerminal {
  id: string;
  storeName: string;
  active: boolean;
}

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
        <div class="table-wrap">
          <table>
            <thead><tr><th>Terminal ID</th><th>Store Name</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              @for (terminal of terminals; track terminal.id) {
                <tr>
                  <td><strong>{{ terminal.id }}</strong></td>
                  <td>{{ terminal.storeName }}</td>
                  <td><span class="status" [class.active]="terminal.active" [class.inactive]="!terminal.active">{{ terminal.active ? 'Active' : 'Inactive' }}</span></td>
                  <td><button type="button" class="download" aria-label="Download QR code" title="Download QR code" (click)="openDownloadPage()"><mm-icon name="download" [size]="17" /></button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100%; background: var(--mm-canvas); }
    .page { max-width: 1400px; margin: 0 auto; padding: 0 22px 28px; }
    .breadcrumb { padding: 0 0 7px; color: var(--mm-text-3); font-size: 12px; }.breadcrumb span { padding: 0 4px; color: var(--mm-brand-600); }.breadcrumb strong { color: #0879d1; }
    .page-header { display: flex; align-items: center; padding: 0 0 18px; }.title-wrap { display: flex; align-items: center; gap: 14px; }.title-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 11px; background: #e6f3fb; color: #0879d1; } h1 { margin: 0; color: #182433; font-size: 24px; }
    .terminal-card { overflow: hidden; background: #fff; border: 1px solid #e0e7ee; border-radius: 16px; box-shadow: 0 1px 3px rgba(16, 24, 40, .05); padding: 22px 24px; }
    .table-wrap { overflow-x: auto; } table { width: 100%; min-width: 760px; border-collapse: collapse; } th { padding: 14px 16px; background: #f0f4f8; color: #65758d; font-size: 12px; text-align: left; text-transform: uppercase; } td { padding: 14px 16px; border-bottom: 1px solid #e1e8ef; color: #344255; font-size: 14px; } td strong { color: #182433; } tbody tr:last-child td { border-bottom: 0; }
    .status { display: inline-flex; padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }.status.active { background: #dff5e7; color: #168045; }.status.inactive { background: #fbdfe2; color: #bd2848; }
    .download { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 1px solid #e0e7ef; border-radius: 50%; background: #fff; color: #8191a5; cursor: pointer; }.download:hover { border-color: var(--mm-brand-600); background: #fff; color: var(--mm-brand-600); }
    @media (max-width: 767px) { .page { padding: 0 16px 20px; }.terminal-card { padding: 14px; }.page-header { padding-bottom: 16px; } }
  `],
})
export class QrTerminalPage {
  private readonly router = inject(Router);
  protected readonly terminals: QrTerminal[] = [
    { id: 'TID10029931', storeName: 'DemoAanipayMerchant', active: true },
    { id: 'TID10029932', storeName: 'DemoAanipayMerchant - Branch 2', active: true },
    { id: 'TID10029933', storeName: 'DemoAanipayMerchant - Branch 3', active: false },
  ];

  openDownloadPage(): void {
    void this.router.navigate(['/dashboard/qr-download']);
  }
}
