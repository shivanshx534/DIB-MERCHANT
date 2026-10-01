/**
 * Data contracts for the merchant dashboard.
 * One `DashboardData` payload drives the whole page for the selected period.
 * All money values are numbers in AED (major units, 2 decimals) — format in the view.
 */

export type Period = 'today' | '7d' | '30d' | 'custom';
export type Trend = 'up' | 'down' | 'flat';
export type Priority = 'high' | 'medium' | 'low';
export type Tone = 'success' | 'warning' | 'danger' | 'neutral';

export interface Merchant {
  name: string;
  bankName: string;
  role: 'owner' | 'cashier' | 'developer';
  language: string;
}

export interface WelcomeFeature {
  icon: 'shield' | 'growth' | 'percent' | 'headset';
  title: string;
  description: string;
}

export interface QuickAction {
  id: 'payment-link' | 'invoice' | 'qr' | 'refund';
  label: string;
  icon: string;
  primary?: boolean;
}

/** Money in motion — collected → pending settlement → next payout */
export interface SettlementSummary {
  collectedToday: number;
  paymentsCount: number;
  pendingSettlement: number;
  batchClosesAt: string; // "23:59"
  settlementCycle: string; // "T+1"
  nextPayoutDate: string; // ISO date
  nextPayoutAmount: number;
  bankAccountMasked: string; // "DIB ••4521"
  lastPayout: { amount: number; date: string };
}

export interface Kpi {
  id: 'net-sales' | 'transactions' | 'success-rate' | 'refunds';
  label: string;
  value: string; // pre-formatted for display ("AED 128,450.75", "94.2%")
  delta: string; // "▲ 12.4%"
  deltaTone: Tone;
  caption: string;
  icon: string;
  iconColor: string; // CSS var reference
  sparkline: number[];
  flagged?: string; // e.g. "Unusual" when abnormal
}

export interface AttentionItem {
  id: string;
  priority: Priority;
  title: string;
  meta: string;
  icon: string;
  action: { label: string; primary?: boolean };
}

export interface CopilotInsight {
  id: string;
  tone: Tone;
  title: string;
  body: string;
  linkLabel: string;
}

export interface TrendPoint {
  label: string; // "Mon"
  current: number;
  previous: number;
  refunds: number;
}

export interface SalesTrend {
  points: TrendPoint[];
  highlight?: { index: number; label: string; value: number; delta: string };
  anomaly?: { index: number; label: string };
}

export interface ChannelShare {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string; // CSS var reference
}

export interface FailureReason {
  label: string;
  percent: number;
}

export interface PaymentHealth {
  successRate: number; // 0–100
  failedCount: number;
  recoverableAmount: number;
  reasons: FailureReason[];
}

export type TransactionStatus = 'success' | 'failed' | 'pending' | 'refunded';

export interface Transaction {
  id: string;
  time: string;
  day: string;
  customer: string;
  reference: string;
  channel: string;
  kind: 'card' | 'invoice' | 'qr';
  status: TransactionStatus;
  amount: number; // negative for refunds
}

export interface PayoutLine {
  label: string;
  amount: number; // negative = deduction
}

export interface PayoutHistoryItem {
  date: string;
  id: string;
  amount: number;
  status: 'paid' | 'processing' | 'on-hold';
}

export interface SettlementDetail {
  id: string;
  amount: number;
  arrivesAt: string;
  status: 'processing' | 'paid' | 'on-hold';
  steps: { label: string; time: string; state: 'done' | 'current' | 'todo' }[];
  lines: PayoutLine[];
  transactionsCount: number;
  onHold?: { amount: number; date: string; reason: string };
  recent: PayoutHistoryItem[];
  settledThisMonth: number;
}

export interface DashboardData {
  merchant: Merchant;
  greeting: string;
  dateLabel: string;
  compareLabel: string;
  welcome: { title: string; subtitle: string; features: WelcomeFeature[] };
  quickActions: QuickAction[];
  settlement: SettlementSummary;
  kpis: Kpi[];
  attention: AttentionItem[];
  insights: CopilotInsight[];
  salesTrend: SalesTrend;
  channels: ChannelShare[];
  health: PaymentHealth;
  transactions: Transaction[];
  transactionsTotal: number;
  counts: { failed: number; refunds: number };
}
