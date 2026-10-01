import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  Invoice,
  InvoiceApiResponse,
  InvoiceCreateRequest,
  InvoiceListRequest,
  InvoiceListResponse,
} from '../models/invoice.models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/invoice-api/merchant/invoice/list';
  private readonly createEndpoint = '/invoice-api/merchant/invoice/create';

  list(request: InvoiceListRequest): Observable<InvoiceListResponse> {
    return this.http.post<InvoiceApiResponse>(this.endpoint, request).pipe(
      map((response) => {
        if (response.title === 'FAILURE' || response.status === '2000') {
          throw new Error(this.detailMessage(response.detail));
        }
        return this.normalize(response);
      }),
    );
  }

  create(request: InvoiceCreateRequest): Observable<InvoiceApiResponse> {
    return this.http.post<InvoiceApiResponse>(this.createEndpoint, request);
  }

  private normalize(response: InvoiceApiResponse): InvoiceListResponse {
    const root = this.record(response) ?? {};
    const data = this.record(root['data']) ?? this.record(root['detail']) ?? root;
    const rawRows = Array.isArray(root['data'])
      ? root['data']
      : Array.isArray(root['detail'])
        ? root['detail']
        : Array.isArray(data?.['content'])
          ? data['content']
          : Array.isArray(data?.['items'])
            ? data['items']
            : Array.isArray(data?.['invoices'])
              ? data['invoices']
              : [];

    const invoices = rawRows
      .map((row) => this.toInvoice(row))
      .filter((invoice): invoice is Invoice => invoice !== null);
    const total = this.numberValue(root['total'] ?? root['totalCount'] ?? data?.['total'] ?? data?.['totalCount']) ?? invoices.length;

    return { invoices, total };
  }

  private toInvoice(value: unknown): Invoice | null {
    const row = this.record(value);
    if (!row) return null;

    const id = this.stringValue(row['id'] ?? row['invoiceId'] ?? row['invoiceNumber']);
    if (!id) return null;

    return {
      id,
      invoiceNumber: this.stringValue(row['invoiceNumber'] ?? row['invoiceNo'] ?? row['number']) || id,
      customerName: this.stringValue(row['customerName'] ?? row['customer'] ?? row['buyerName']) || 'Unknown customer',
      customerEmail: this.stringValue(row['customerEmail'] ?? row['email']) || undefined,
      amount: this.numberValue(row['amount'] ?? row['totalAmount'] ?? row['invoiceAmount']) ?? 0,
      currency: this.stringValue(row['currency']) || 'AED',
      status: this.stringValue(row['status']) || 'UNKNOWN',
      issueDate: this.stringValue(row['issueDate'] ?? row['createdDate']) || undefined,
      dueDate: this.stringValue(row['dueDate']) || undefined,
    };
  }

  private record(value: unknown): Record<string, unknown> | null {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  }

  private numberValue(value: unknown): number | null {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? number : null;
  }

  private detailMessage(detail: unknown): string {
    if (detail && typeof detail === 'object' && 'errorDescription' in detail) {
      return String(detail.errorDescription);
    }
    return 'Invoice list request failed.';
  }
}
