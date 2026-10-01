import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Invoice, InvoiceCreateRequest, InvoiceListRequest, InvoiceStatus } from '../../core/models/invoice.models';
import { InvoiceService } from '../../core/services/invoice.service';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-invoices-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page">
      <div class="breadcrumb">Accept Payments <span>/</span> <strong>{{ showCreate() ? 'Create Invoice' : 'Payment Invoice' }}</strong></div>
      <header class="page-header">
        <div class="title-wrap"><div class="title-icon"><mm-icon name="file" [size]="22" /></div><h1>{{ showCreate() ? 'Create Invoice' : 'Payment Invoice' }}</h1></div>
        @if (!showCreate()) {
          <button class="primary" type="button" (click)="openCreateInvoice()"><mm-icon name="plus" [size]="15" /> Create Invoice</button>
        }
      </header>
      @if (error(); as message) {
        <div class="error" role="alert">{{ message }}</div>
      }
      @if (showCreate()) {
        <form class="create-card" (ngSubmit)="submitInvoice()">
          <section class="form-section">
            <h2>Invoice Details</h2>
            <div class="form-grid three-cols">
              <label>Invoice ID <span>*</span><input name="invoiceId" [(ngModel)]="createForm.invoiceId" placeholder="E.G. INV00123" required /></label>
              <label>Amount <span>*</span><input name="amount" [(ngModel)]="createForm.amount" placeholder="0.00" required /><small>Amount entered should be inclusive of VAT</small></label>
              <label>Expiry Date <span>*</span><input name="expiryDate" [(ngModel)]="createForm.expiryDate" placeholder="Select date" onfocus="this.type='date'" required /></label>
            </div>
            <label class="description-field">Description <span>*</span><textarea name="description" [(ngModel)]="createForm.description" placeholder="Enter item description" required></textarea></label>
          </section>
          <section class="form-section customer-section">
            <h2>Customer Details</h2>
            <div class="form-grid three-cols">
              <label>Name <span>*</span><input name="customerName" [(ngModel)]="createForm.customerName" placeholder="Customer Name" required /></label>
              <label>Email <span>*</span><input name="customerEmail" type="email" [(ngModel)]="createForm.customerEmail" placeholder="Customer Email" required /></label>
              <label>Mobile Number <span>*</span><input name="mobileNumber" [(ngModel)]="createForm.mobileNumber" placeholder="971" required /></label>
            </div>
            <div class="notice"><span class="info-icon">i</span>This Email will be used to send the payment request.</div>
          </section>
          <div class="form-actions">
            <button class="outline-action" type="button" (click)="closeCreateInvoice()">Back</button>
            <button class="outline-action" type="button" (click)="clearInvoiceForm()">Clear</button>
            <button class="submit-action" type="submit"><span>▶</span> Create Invoice</button>
          </div>
        </form>
      } @else {
      <section class="invoice-card" aria-live="polite">
        <nav class="tabs" aria-label="Invoice status">
          @for (tab of tabs; track tab.status) {
            <button type="button" [class.active]="filters.status === tab.status" (click)="selectStatus(tab.status)" [disabled]="loading()">
              {{ tab.label }} <span class="count">{{ countFor(tab.status) }}</span>
            </button>
          }
        </nav>
        <div class="toolbar">
          <form class="search" (ngSubmit)="loadInvoices()">
            <mm-icon name="search" [size]="16" />
            <input name="searchText" [(ngModel)]="filters.searchText" placeholder="Search By: Invoice ID/Email/Amount" />
          </form>
          <label class="rows-label">Rows to display
            <select name="pageSize" [(ngModel)]="filters.pageSize" (ngModelChange)="loadInvoices()">
              <option [ngValue]="10">10</option><option [ngValue]="25">25</option><option [ngValue]="50">50</option>
            </select>
          </label>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created Date</th><th>Paid By</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (invoice of invoices(); track invoice.id) {
                <tr>
                  <td><strong>{{ invoice.invoiceNumber }}</strong></td><td>{{ invoice.customerEmail || 'No email' }}</td>
                  <td>{{ invoice.currency }} {{ invoice.amount | number: '1.2-2' }}</td>
                  <td><span class="status" [class]="statusClass(invoice.status)">{{ statusLabel(invoice.status) }}</span></td>
                  <td>{{ invoice.issueDate ? (invoice.issueDate | date: 'dd/MM/yyyy') : '-' }}</td><td>{{ invoice.customerName }}</td>
                  <td class="actions"><button type="button" title="Copy invoice" aria-label="Copy invoice"><mm-icon name="copy" [size]="17" /></button><button type="button" title="Download invoice" aria-label="Download invoice"><mm-icon name="download" [size]="17" /></button><button type="button" title="Email invoice" aria-label="Email invoice"><mm-icon name="mail" [size]="17" /></button><button type="button" title="Copy invoice link" aria-label="Copy invoice link"><mm-icon name="link" [size]="17" /></button></td>
                </tr>
              } @empty {
                <tr><td class="empty" colspan="7">{{ loading() ? 'Loading invoices...' : 'No invoices found.' }}</td></tr>
              }
            </tbody>
          </table>
        </div>
        <footer class="table-footer"><span>Showing {{ invoices().length ? 1 : 0 }} to {{ invoices().length }} of {{ total() }} entries</span><button type="button" class="page-number" aria-current="page">1</button></footer>
      </section>
      }
    </section>
  `,
  styles: [`
    :host { display: block; min-height: 100%; background: var(--mm-canvas); }
    .page { display: grid; gap: 0; max-width: 1400px; margin: 0 auto; padding: 0 24px 28px; }
    .breadcrumb { padding: 0 0 6px; color: var(--mm-text-3); font-size: 12px; }.breadcrumb span { padding: 0 4px; color: var(--mm-brand-600); }.breadcrumb strong { color: var(--mm-brand-600); }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 0 18px; }.title-wrap { display: flex; align-items: center; gap: 16px; }.title-icon { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 10px; background: #e6f3fb; color: #0879d1; } h1 { margin: 0; color: #182433; font-size: 22px; }
    .primary { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 20px; border: 0; border-radius: 24px; background: #0e7a4a; color: #fff; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }.primary:hover { background: #095c38; } button:disabled { cursor: wait; opacity: .6; }
    .invoice-card { overflow: hidden; background: var(--mm-surface); border: 1px solid #e0e7ee; border-radius: 16px; box-shadow: 0 1px 3px rgba(16, 24, 40, .04); }.tabs { display: flex; gap: 8px; padding: 26px 20px 0; border-bottom: 1px solid #e2e8ef; }.tabs button { position: relative; display: inline-flex; align-items: center; gap: 7px; min-height: 38px; padding: 0 4px 12px; border: 0; background: transparent; color: #63728a; font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }.tabs button + button { margin-left: 16px; }.tabs button.active { color: #0879d1; }.tabs button.active::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: #0879d1; content: ''; }.count { padding: 2px 7px; border-radius: 999px; background: #eef2f6; color: #75849a; font-size: 11px; }.tabs button.active .count { background: #e7f3fc; color: #0879d1; }
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 18px 20px 15px; }.search { display: flex; align-items: center; gap: 8px; width: 335px; height: 40px; padding: 0 12px; border: 1px solid #dfe6ee; border-radius: 10px; color: #8090a4; }.search input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--mm-text-1); font: inherit; font-size: 13px; }.rows-label { display: flex; align-items: center; gap: 10px; color: #354255; font-size: 13px; } select { height: 40px; padding: 0 28px 0 12px; border: 1px solid #dfe6ee; border-radius: 10px; background: #fff; color: #354255; font: inherit; }.error { margin: 0 20px 14px; padding: 12px 14px; border: 1px solid var(--mm-danger); border-radius: var(--mm-radius-md); background: var(--mm-danger-bg); color: var(--mm-danger-text); }
    .table-wrap { overflow-x: auto; } table { width: 100%; min-width: 980px; border-collapse: collapse; } th { padding: 13px 16px; background: #f0f4f8; color: #65758d; font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: .03em; } td { padding: 13px 16px; border-bottom: 1px solid #e3e9ef; color: #344255; font-size: 13px; white-space: nowrap; } td strong { color: #182433; }.status { display: inline-flex; padding: 5px 12px; border-radius: 999px; background: #eef2f6; color: #566477; font-size: 11px; font-weight: 700; }.status.paid { background: #dff5e7; color: #168045; }.status.expired, .status.overdue, .status.cancelled { background: #fbdfe2; color: #bd2848; }.status.pending, .status.sent { background: #fff0c9; color: #976e08; }.actions { display: flex; align-items: center; gap: 10px; }.actions button { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; border: 1px solid #e0e7ef; border-radius: 50%; background: #fff; color: #8191a5; cursor: pointer; }.actions button:hover { border-color: #0879d1; color: #0879d1; }.table-footer { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; color: #75849a; font-size: 12px; }.page-number { display: grid; place-items: center; width: 30px; height: 30px; border: 0; border-radius: 6px; background: #0879d1; color: #fff; font-weight: 700; }.empty { padding: 40px; color: var(--mm-text-3); text-align: center; }
    @media (max-width: 767px) { .page { padding: 0 16px 20px; }.page-header { align-items: flex-start; flex-direction: column; }.primary { align-self: stretch; justify-content: center; }.toolbar { align-items: stretch; flex-direction: column; }.search { width: 100%; }.rows-label { justify-content: space-between; } }
    .create-card { padding: 30px 24px 8px; background: #fff; border: 1px solid #e0e7ee; border-radius: 16px; box-shadow: 0 1px 3px rgba(16, 24, 40, .04); }
    .form-section + .form-section { margin-top: 26px; }
    .form-section h2 { margin: 0 0 20px; padding-bottom: 12px; border-bottom: 1px solid #e2e8ef; color: #182433; font-size: 16px; }
    .form-grid { display: grid; gap: 22px; }.three-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .create-card label { display: grid; gap: 8px; color: #182433; font-size: 13px; font-weight: 600; }.create-card label > span { color: #d64550; }.create-card input, .create-card textarea { width: 100%; min-height: 46px; padding: 0 14px; border: 1px solid #dfe6ee; border-radius: 11px; background: #fff; color: #354255; font: inherit; font-size: 14px; outline: none; }.create-card input:focus, .create-card textarea:focus { border-color: var(--mm-brand-600); }.create-card textarea { min-height: 78px; padding-top: 14px; resize: vertical; }.create-card small { margin-top: -2px; color: #718198; font-size: 12px; font-weight: 400; }.description-field { margin-top: 24px; }.customer-section .form-grid { margin-bottom: 18px; }
    .notice { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 11px; background: #fff1df; color: #96702b; font-size: 13px; }.info-icon { display: grid; place-items: center; width: 21px; height: 21px; border: 2px solid #a98232; border-radius: 50%; font-size: 13px; font-weight: 700; }.form-actions { display: flex; justify-content: center; gap: 12px; padding: 20px 0 0; }.outline-action, .submit-action { min-height: 44px; padding: 0 20px; border-radius: 24px; font: inherit; font-weight: 700; cursor: pointer; }.outline-action { border: 1px solid #e0e7ef; background: #fff; color: #182433; }.submit-action { display: inline-flex; align-items: center; gap: 9px; border: 0; background: #0e7a4a; color: #fff; }.submit-action:hover { background: #095c38; }
    @media (max-width: 767px) { .create-card { padding: 22px 16px 8px; }.three-cols { grid-template-columns: 1fr; gap: 16px; }.form-actions { flex-wrap: wrap; }.submit-action { flex: 1 1 100%; order: -1; } }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; min-width: 760px; border-collapse: collapse; }
    th { padding: 11px 16px; background: var(--mm-canvas); color: var(--mm-text-3); font-size: 11px; text-align: left; text-transform: uppercase; letter-spacing: .05em; }
    td { padding: 14px 16px; border-bottom: 1px solid var(--mm-border); color: var(--mm-text-2); font-size: 13px; }
    td strong, td small { display: block; }
    td strong { color: var(--mm-text-1); }
    td small { margin-top: 3px; color: var(--mm-text-3); font-size: 11px; }
    .amount { text-align: right; font-variant-numeric: tabular-nums; }
    .status { display: inline-flex; padding: 4px 9px; border-radius: 999px; background: var(--mm-neutral-bg); color: var(--mm-text-2); font-size: 11px; font-weight: 700; }
    .status.paid { background: var(--mm-brand-50); color: var(--mm-brand-600); }
    .status.overdue, .status.cancelled { background: var(--mm-danger-bg); color: var(--mm-danger-text); }
    .status.sent { background: var(--mm-warning-bg); color: var(--mm-warning-text); }
    .empty { padding: 40px; color: var(--mm-text-3); text-align: center; }
    @media (max-width: 767px) { .page { padding: 20px 16px; } .page-header { flex-direction: column; } }
    @media (max-width: 420px) {
      .page { padding-inline: 12px; }
      .invoice-card { border-radius: 10px; }
      .tabs { padding: 18px 12px 0; }
      .toolbar, .table-footer { padding-inline: 12px; }
      .create-card { padding-inline: 12px; }
      .form-actions { flex-direction: column; }
      .form-actions button { width: 100%; justify-content: center; }
    }
  `],
})
export class InvoicesPage {
  private readonly invoiceService = inject(InvoiceService);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly invoices = signal<Invoice[]>([]);
  protected readonly total = signal(0);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly statuses: InvoiceStatus[] = ['PENDING', 'PAID', 'EXPIRED'];
  protected readonly tabs: Array<{ label: string; status: InvoiceStatus }> = [
    { label: 'Pending', status: 'PENDING' }, { label: 'Paid', status: 'PAID' },
    { label: 'Expired', status: 'EXPIRED' },
  ];
  protected readonly showCreate = signal(false);
  protected readonly createForm = this.emptyInvoiceForm();
  protected readonly filters: InvoiceListRequest = {
    mid: '555500001',
    searchText: '',
    status: 'PENDING',
    pageSize: 10,
    pageNo: 1,
  };

  constructor() {
    if (isPlatformBrowser(this.platformId)) this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.error.set('');
    this.invoiceService.list({ ...this.filters }).subscribe({
      next: (response) => {
        this.invoices.set(response.invoices);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (requestError: unknown) => {
        this.invoices.set([]);
        this.total.set(0);
        this.loading.set(false);
        this.error.set(this.readError(requestError));
      },
    });
  }

  selectStatus(status: InvoiceStatus): void {
    this.filters.status = status;
    this.loadInvoices();
  }

  openCreateInvoice(): void {
    this.showCreate.set(true);
  }

  closeCreateInvoice(): void {
    this.showCreate.set(false);
  }

  clearInvoiceForm(): void {
    Object.assign(this.createForm, this.emptyInvoiceForm());
  }

  submitInvoice(): void {
    this.loading.set(true);
    this.error.set('');
    const request: InvoiceCreateRequest = {
      invoiceId: this.createForm.invoiceId,
      amount: this.createForm.amount,
      expiryDate: this.formatExpiryDate(this.createForm.expiryDate),
      itemDescription: this.createForm.description,
      customerName: this.createForm.customerName,
      customerEmail: this.createForm.customerEmail,
      customerMobile: this.createForm.mobileNumber,
    };
    this.invoiceService.create(request).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response['title'] === 'FAILURE' || response.status === '2000') {
          this.error.set(response.detail ? this.detailMessage(response.detail) : response.message || 'Unable to create invoice.');
          return;
        }
        this.showCreate.set(false);
        this.clearInvoiceForm();
        this.loadInvoices();
      },
      error: (requestError: unknown) => {
        this.loading.set(false);
        this.error.set(this.readError(requestError));
      },
    });
  }

  countFor(status: InvoiceStatus): number {
    return this.invoices().filter((invoice) => this.statusGroup(invoice.status) === status).length;
  }

  statusLabel(status: string): string {
    const group = this.statusGroup(status);
    return group.charAt(0) + group.slice(1).toLowerCase();
  }

  statusClass(status: string): string {
    return `status ${this.statusGroup(status).toLowerCase()}`;
  }

  private statusGroup(status: string): InvoiceStatus {
    const normalized = status.toUpperCase();
    if (normalized === 'PENDING' || normalized === 'SENT') return 'PENDING';
    if (normalized === 'EXPIRED' || normalized === 'OVERDUE') return 'EXPIRED';
    if (normalized === 'PAID') return 'PAID';
    return 'PENDING';
  }

  private formatExpiryDate(value: string): string {
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return isoDate ? `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}` : value;
  }

  private detailMessage(detail: unknown): string {
    if (detail && typeof detail === 'object' && 'errorDescription' in detail) {
      return String(detail.errorDescription);
    }
    return 'Unable to create invoice.';
  }

  private emptyInvoiceForm(): {
    invoiceId: string; amount: string; expiryDate: string; description: string;
    customerName: string; customerEmail: string; mobileNumber: string;
  } {
    return { invoiceId: '', amount: '', expiryDate: '', description: '', customerName: '', customerEmail: '', mobileNumber: '971' };
  }

  private readError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) return 'Invoice service is unreachable. Start the backend on http://localhost:8080.';
      if (error.error && typeof error.error === 'object' && 'detail' in error.error) {
        return this.detailMessage(error.error.detail);
      }
      return `Invoice request failed with status ${error.status}.`;
    }
    return error instanceof Error ? error.message : 'Unable to load invoices.';
  }
}
