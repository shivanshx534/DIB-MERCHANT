import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

export interface MerchantTerminalApiResponse {
  title?: string;
  status?: string;
  detail?: {
    terminals?: MerchantTerminal[];
  };
}

export interface MerchantTerminal {
  terminalId: string;
  terminalName?: string;
  storeName?: string;
  merchantId?: string;
  storeId?: string;
  status?: string | number | boolean;
}

export interface StaticQrListApiResponse {
  title?: string;
  status?: string;
  detail?: StaticQrEntry[];
}

export interface StaticQrEntry {
  terminalId: string;
  terminalName?: string;
  storeName?: string;
  merchantId?: string;
  storeId?: string;
  status?: string | number | boolean;
}

export interface StaticQrViewApiResponse {
  title?: string;
  status?: string;
  detail?: {
    base64EncImageText?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly http = inject(HttpClient);
  private readonly defaultMerchantId = '00449936';

  listTerminals(merchantId = this.defaultMerchantId): Observable<MerchantTerminal[]> {
    const payload = { merchantId };
    return this.http.post<MerchantTerminalApiResponse>('/invoice-api/merchant/credentials/list', payload, {
      headers: this.headers(),
    }).pipe(
      map((response) => this.normalizeTerminalList(response)),
    );
  }

  listStaticQr(merchantId = this.defaultMerchantId): Observable<StaticQrEntry[]> {
    const payload = { mid: merchantId };
    return this.http.post<StaticQrListApiResponse>('/invoice-api/merchant/staticqr/list', payload, {
      headers: this.headers(),
    }).pipe(
      map((response) => this.normalizeStaticQrList(response)),
    );
  }

  viewStaticQr(terminalId: string, storeId: string, merchantId = this.defaultMerchantId): Observable<string> {
    const payload = { terminalId, storeId, merchantId };
    return this.http.post<StaticQrViewApiResponse>('/invoice-api/merchant/staticqr/view', payload, {
      headers: this.headers(),
    }).pipe(
      map((response) => {
        const text = response?.detail?.base64EncImageText;
        if (!text) {
          throw new Error('Static QR image was not returned by the API.');
        }
        return `data:image/png;base64,${text}`;
      }),
    );
  }

  downloadStaticQr(terminalId: string, storeId: string, merchantId = this.defaultMerchantId): Observable<Blob> {
    const payload = { terminalId, storeId, merchantId };
    return this.http.post('/invoice-api/merchant/staticqr/download', payload, {
      headers: this.headers(),
      responseType: 'blob',
    }).pipe(
      map((response) => response instanceof Blob ? response : new Blob([response as BlobPart], { type: 'application/octet-stream' })),
    );
  }

  private normalizeTerminalList(response: MerchantTerminalApiResponse | null | undefined): MerchantTerminal[] {
    const terminals = response?.detail?.terminals ?? [];
    return terminals
      .filter((item) => !!item && !!item.terminalId)
      .map((item) => ({
        terminalId: item.terminalId,
        terminalName: item.terminalName || item.terminalId,
        storeName: item.storeName || 'Unknown store',
        merchantId: item.merchantId,
        storeId: item.storeId,
        status: item.status,
      }));
  }

  private normalizeStaticQrList(response: StaticQrListApiResponse | null | undefined): StaticQrEntry[] {
    const items = response?.detail ?? [];
    return items
      .filter((item) => !!item && !!item.terminalId)
      .map((item) => ({
        terminalId: item.terminalId,
        terminalName: item.terminalName || item.terminalId,
        storeName: item.storeName || 'Unknown store',
        merchantId: item.merchantId || this.defaultMerchantId,
        storeId: item.storeId || item.terminalId,
        status: item.status,
      }));
  }

  private headers(): HttpHeaders {
    const storage = typeof globalThis !== 'undefined' && 'sessionStorage' in globalThis ? globalThis.sessionStorage : undefined;
    const token = storage ? storage.getItem('maps_auth_token') : null;
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }
}
