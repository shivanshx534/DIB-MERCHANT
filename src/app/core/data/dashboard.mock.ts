import { DashboardData, SettlementDetail } from '../models/dashboard.models';

/**
 * Sample payload matching the Figma artboard (Dashboard v2 — Merchant cockpit).
 * Replace with the real API response; the shape is the contract.
 */
export const DASHBOARD_MOCK: DashboardData = {
  merchant: {
    name: 'DemoAanipayMerchant',
    bankName: 'Dubai Islamic Bank',
    role: 'owner',
    language: 'English',
  },
  greeting: 'Good evening',
  dateLabel: 'Friday, 25 Sep',
  compareLabel: 'vs last Friday',
  welcome: {
    title: 'Bank Today. Build Tomorrow.',
    subtitle: 'Smart banking solutions that help you secure your future and achieve your goals.',
    features: [
      { icon: 'shield', title: 'Bank-Grade Security', description: 'Your data is always safe with us' },
      { icon: 'growth', title: 'Smart Investing', description: 'Expert-backed solutions' },
      { icon: 'percent', title: 'Attractive Rates', description: 'Rates that work for you' },
      { icon: 'headset', title: '24/7 Support', description: 'Here anytime, anywhere' },
    ],
  },
  quickActions: [
    { id: 'payment-link', label: 'Create payment link', icon: 'plus', primary: true },
    { id: 'invoice', label: 'Send invoice', icon: 'plus' },
    { id: 'qr', label: 'Generate QR code', icon: 'qr' },
    { id: 'refund', label: 'Issue refund', icon: 'refund' },
  ],
  settlement: {
    collectedToday: 142900,
    paymentsCount: 412,
    pendingSettlement: 123681.39,
    batchClosesAt: '23:59',
    settlementCycle: 'T+1',
    nextPayoutDate: '2026-09-28',
    nextPayoutAmount: 123681.39,
    bankAccountMasked: 'DIB ••4521',
    lastPayout: { amount: 88040, date: '2026-09-24' },
  },
  kpis: [
    {
      id: 'net-sales', label: 'Net sales', value: 'AED 128,450.75', delta: '▲ 12.4%', deltaTone: 'success',
      caption: 'Payments − refunds', icon: 'trend-up', iconColor: 'var(--mm-brand-600)',
      sparkline: [9, 11, 10, 13, 12, 14, 13, 16, 15, 18, 17, 20],
    },
    {
      id: 'transactions', label: 'Transactions', value: '412', delta: '▲ 6.1%', deltaTone: 'success',
      caption: 'Avg ticket AED 346.85', icon: 'hash', iconColor: 'var(--mm-warning)',
      sparkline: [8, 9, 11, 10, 12, 11, 12, 13, 12, 14, 15, 15],
    },
    {
      id: 'success-rate', label: 'Success rate', value: '94.2%', delta: '▼ 1.8 pts', deltaTone: 'danger',
      caption: '24 failed · see why', icon: 'check', iconColor: 'var(--mm-brand-600)',
      sparkline: [16, 16, 15, 16, 15, 15, 14, 15, 14, 13, 14, 13],
    },
    {
      id: 'refunds', label: 'Refunds', value: 'AED 14,449.25', delta: '10.1% of sales', deltaTone: 'danger',
      caption: 'Usually ~4%', icon: 'refund', iconColor: 'var(--mm-danger)',
      sparkline: [3, 3, 4, 3, 4, 12, 5, 4, 4, 3, 4, 5],
    },
  ],
  attention: [
    { id: 'a1', priority: 'high', icon: 'flag', title: '2 chargebacks need a response',
      meta: 'Respond by 28 Sep · AED 3,420 at stake', action: { label: 'Respond', primary: true } },
    { id: 'a2', priority: 'high', icon: 'file', title: '5 invoices are overdue',
      meta: 'AED 18,600 outstanding · oldest 34 days', action: { label: 'Send reminders' } },
    { id: 'a3', priority: 'medium', icon: 'link', title: '3 payment links expired after being opened',
      meta: 'Customers viewed them in the last 48 hours', action: { label: 'Reactivate' } },
    { id: 'a4', priority: 'medium', icon: 'wrench', title: 'Terminal replacement is past its SLA',
      meta: 'REQ-20418 · 2 days overdue', action: { label: 'Escalate' } },
    { id: 'a5', priority: 'low', icon: 'file', title: 'Trade licence expires in 21 days',
      meta: 'Upload the renewal to avoid a settlement hold', action: { label: 'Upload' } },
  ],
  insights: [
    { id: 'i1', tone: 'danger', title: 'Refunds spiked on Tuesday',
      body: '8 of 11 refunds came from terminal T-004, 3× your usual.', linkLabel: 'View transactions' },
    { id: 'i2', tone: 'warning', title: 'Card declines up 1.8 pts',
      body: 'Mostly 3-D Secure drop-offs on mobile checkout.', linkLabel: 'See failure reasons' },
    { id: 'i3', tone: 'success', title: '~AED 165k expected next week',
      body: 'Based on the last 6 weeks. Payday on the 28th usually lifts Monday.', linkLabel: 'How is this estimated?' },
  ],
  salesTrend: {
    points: [
      { label: 'Sat', current: 12500, previous: 11000, refunds: 900 },
      { label: 'Sun', current: 14000, previous: 12800, refunds: 1100 },
      { label: 'Mon', current: 15200, previous: 13600, refunds: 1000 },
      { label: 'Tue', current: 14800, previous: 15500, refunds: 3400 },
      { label: 'Wed', current: 18500, previous: 16000, refunds: 1200 },
      { label: 'Thu', current: 20200, previous: 17400, refunds: 1000 },
      { label: 'Fri', current: 22800, previous: 19200, refunds: 1400 },
    ],
    highlight: { index: 6, label: 'Fri · today', value: 22800, delta: '▲ 18.8% vs last Fri' },
    anomaly: { index: 3, label: 'Refund spike' },
  },
  channels: [
    { id: 'pos', label: 'POS terminals', amount: 82900, percent: 58, color: 'var(--mm-chart-1)' },
    { id: 'links', label: 'Payment links', amount: 30000, percent: 21, color: 'var(--mm-chart-2)' },
    { id: 'online', label: 'Online checkout', amount: 17100, percent: 12, color: 'var(--mm-chart-3)' },
    { id: 'qr', label: 'QR code', amount: 8600, percent: 6, color: 'var(--mm-chart-4)' },
    { id: 'wallets', label: 'Apple Pay / wallets', amount: 4300, percent: 3, color: 'var(--mm-chart-5)' },
  ],
  health: {
    successRate: 94.2,
    failedCount: 24,
    recoverableAmount: 8300,
    reasons: [
      { label: 'Insufficient funds', percent: 31 },
      { label: '3-D Secure abandoned', percent: 27 },
      { label: 'Declined by bank', percent: 22 },
      { label: 'Expired card', percent: 12 },
      { label: 'Other', percent: 8 },
    ],
  },
  transactions: [
    { id: 't1', time: '18:42', day: 'Today', customer: 'Visa •••• 4821', reference: 'TXN-88213', channel: 'POS · T-004', kind: 'card', status: 'success', amount: 1250 },
    { id: 't2', time: '18:37', day: 'Today', customer: 'Mastercard •••• 1907', reference: 'TXN-88209', channel: 'Payment link', kind: 'card', status: 'success', amount: 3480 },
    { id: 't3', time: '18:31', day: 'Today', customer: 'Visa •••• 5530', reference: 'TXN-88204', channel: 'Online checkout', kind: 'card', status: 'failed', amount: 640 },
    { id: 't4', time: '18:20', day: 'Today', customer: 'INV-1043 · Al Noor Trading', reference: 'TXN-88198', channel: 'Payment link', kind: 'invoice', status: 'pending', amount: 12600 },
    { id: 't5', time: '18:05', day: 'Today', customer: 'Apple Pay •••• 2210', reference: 'TXN-88190', channel: 'POS · T-002', kind: 'card', status: 'success', amount: 215.5 },
    { id: 't6', time: '17:58', day: 'Today', customer: 'Mastercard •••• 7764', reference: 'RFD-02231', channel: 'POS · T-004', kind: 'card', status: 'refunded', amount: -890 },
    { id: 't7', time: '17:44', day: 'Today', customer: 'QR · Mada •••• 3318', reference: 'TXN-88176', channel: 'QR code', kind: 'qr', status: 'success', amount: 96 },
  ],
  transactionsTotal: 412,
  counts: { failed: 3, refunds: 11 },
};

/** Payload for the "View settlements" drawer. */
export const SETTLEMENT_DETAIL_MOCK: SettlementDetail = {
  id: 'SET-20260928',
  amount: 123681.39,
  arrivesAt: 'Arrives Mon, 28 Sep by 12:00',
  status: 'processing',
  steps: [
    { label: 'Batch closes', time: 'Fri 23:59', state: 'current' },
    { label: 'Processed', time: 'Sat 06:00', state: 'todo' },
    { label: 'Sent', time: 'Mon 09:00', state: 'todo' },
    { label: 'Credited', time: 'Mon 12:00', state: 'todo' },
  ],
  lines: [
    { label: 'Gross sales', amount: 142900 },
    { label: 'Refunds (11)', amount: -14449.25 },
    { label: 'Processing fees · 0.9%', amount: -1285.1 },
    { label: 'VAT on fees · 5%', amount: -64.26 },
    { label: 'Chargeback reserve (2 disputes)', amount: -3420 },
  ],
  transactionsCount: 412,
  onHold: { amount: 106710.15, date: '20 Sep', reason: 'Upload your renewed trade licence to release it.' },
  recent: [
    { date: 'Thu, 24 Sep', id: 'SET-20260924', amount: 88040, status: 'paid' },
    { date: 'Wed, 23 Sep', id: 'SET-20260923', amount: 87705.3, status: 'paid' },
    { date: 'Tue, 22 Sep', id: 'SET-20260922', amount: 77779.65, status: 'paid' },
    { date: 'Sun, 20 Sep', id: 'SET-20260920', amount: 106710.15, status: 'on-hold' },
  ],
  settledThisMonth: 1842300,
};
