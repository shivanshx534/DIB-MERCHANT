import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

interface CopilotQueryResponse {
  detail?: {
    answer?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class MerchantCopilotService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/invoice-api/api/copilot/query';

  query(question: string, merchantId: string): Observable<string> {
    return this.http.post<CopilotQueryResponse>(this.endpoint, { merchantId, question }).pipe(
      map((response) => {
        const answer = response.detail?.answer?.trim();
        if (!answer) {
          throw new Error('Merchant Copilot returned an empty answer.');
        }
        return answer;
      }),
    );
  }
}