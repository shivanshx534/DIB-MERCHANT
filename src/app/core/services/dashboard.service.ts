import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DashboardData, Period, SettlementDetail } from '../models/dashboard.models';
import { DASHBOARD_MOCK, SETTLEMENT_DETAIL_MOCK } from '../data/dashboard.mock';

/**
 * Dashboard data access.
 *
 * Suggested endpoints (replace the mocks):
 *   GET /api/merchant/dashboard?period=today|7d|30d&from=&to=   -> DashboardData
 *   GET /api/merchant/settlements/next                           -> SettlementDetail
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  getDashboard(_period: Period): Observable<DashboardData> {
    return of(DASHBOARD_MOCK).pipe(delay(150));
  }

  getNextSettlement(): Observable<SettlementDetail> {
    return of(SETTLEMENT_DETAIL_MOCK).pipe(delay(100));
  }
}
