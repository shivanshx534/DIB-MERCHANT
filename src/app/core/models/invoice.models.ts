export type InvoiceStatus = 'PENDING' | 'PAID' | 'EXPIRED';

export interface InvoiceListRequest {
  mid: string;
  searchText?: string;
  status: InvoiceStatus;
  pageNo?: number;
  pageSize: number;
}

export interface InvoiceCreateRequest {
  invoiceId: string;
  amount: string;
  expiryDate: string;
  itemDescription: string;
  customerName: string;
  customerEmail: string;
  customerMobile: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: string;
  issueDate?: string;
  dueDate?: string;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
}

export interface InvoiceApiResponse {
  status?: string;
  title?: string;
  message?: string;
  data?: unknown;
  detail?: unknown;
  total?: number;
  totalCount?: number;
}
