import { Injectable } from '@angular/core';
import { Observable, defer, map, of } from 'rxjs';
import * as forge from 'node-forge';
import { environment } from '../../../environments/environment';
import {
  CaptchaApiResponse,
  CaptchaResponse,
  AuthenticateApiResponse,
  AuthenticateRequest,
  EncryptPasswordRequest,
  VerifyOtpApiResponse,
  VerifyOtpRequest,
  ResendOtpApiResponse,
  ResendOtpRequest,
} from '../models/captcha.model';

@Injectable({ providedIn: 'root' })
export class CaptchaService {
  load(): Observable<CaptchaResponse> {
    return defer(() => fetch(
      `${environment.apiBaseUrl}/dib/pg/transaction/inbound/merchant/captcha`,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(10000),
      }
    ).then(async response => {
      if (!response.ok) throw new Error(`Captcha request failed with status ${response.status}.`);
      return await response.json() as CaptchaApiResponse;
    })).pipe(map(response => this.readResponse(response)));
  }

  encryptPassword(request: EncryptPasswordRequest): Observable<string> {
    return defer(() => this.encryptPayload(request.password, request.secureRuntimeToken));
  }

  async encryptPayload(payload: string, base64Key: string): Promise<string> {
    const keyBytes = forge.util.decode64(base64Key);
    if (![16, 24, 32].includes(keyBytes.length)) {
      throw new Error('The secure runtime token is not a valid AES key.');
    }

    const iv = forge.random.getBytesSync(12);
    const cipher = forge.cipher.createCipher('AES-GCM', keyBytes);

    cipher.start({
      iv,
      tagLength: 128,
    });
    cipher.update(forge.util.createBuffer(payload, 'utf8'));

    if (!cipher.finish()) {
      throw new Error('Password encryption failed.');
    }

    const ciphertext = cipher.output.getBytes();
    const tag = cipher.mode.tag.getBytes();

    return forge.util.encode64(iv + ciphertext + tag);
  }

  authenticate(request: AuthenticateRequest): Observable<string> {
    return defer(() => fetch(
      `${environment.apiBaseUrl}/dib/pg/transaction/inbound/merchant/authenticate`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000),
      }
    ).then(async response => {
      const responseBody = await response.text();
      const json = responseBody ? JSON.parse(responseBody) as AuthenticateApiResponse : {};

      if (!response.ok || json.success === false) {
        throw new Error(json.errorDescription || `Authentication failed with status ${response.status}.`);
      }

      const otpReferenceId = json.detail?.otpReferenceId;
      if (!otpReferenceId) throw new Error('Authentication response was incomplete.');
      return otpReferenceId;
    }));
  }

  verifyOtp(request: VerifyOtpRequest): Observable<string> {
    if (environment.allowDirectDashboard && /^\d{6}$/.test(request.otp ?? '')) {
      return of('local-dashboard-token');
    }

    return defer(() => fetch(
      `${environment.apiBaseUrl}/dib/pg/transaction/inbound/merchant/verifyOtp`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000),
      }
    ).then(async response => {
      const responseBody = await response.text();
      const json = responseBody ? JSON.parse(responseBody) as VerifyOtpApiResponse : {};

      if (!response.ok || json.success === false) {
        throw new Error(json.errorDescription || `OTP verification failed with status ${response.status}.`);
      }

      const authToken = json.detail?.auth_token;
      if (!authToken) throw new Error('OTP verification response was incomplete.');
      return authToken;
    }));
  }

  resendOtp(request: ResendOtpRequest): Observable<string> {
    return defer(() => fetch(
      `${environment.apiBaseUrl}/dib/pg/transaction/inbound/merchant/resendOtp`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000),
      }
    ).then(async response => {
      const responseBody = await response.text();
      const json = responseBody ? JSON.parse(responseBody) as ResendOtpApiResponse : {};

      if (!response.ok || json.success === false) {
        throw new Error(json.errorDescription || `Resend OTP failed with status ${response.status}.`);
      }

      const otpReferenceId = json.detail?.otpReferenceId;
      if (!otpReferenceId) throw new Error('Resend OTP response was incomplete.');
      return otpReferenceId;
    }));
  }

  private readResponse(response: CaptchaApiResponse): CaptchaResponse {
    const detail = response.detail ?? response;
    const captchaImage = detail.captchaImage ?? detail.captchaText;

    if (!detail.captchaId || !detail.secureRuntimeToken || !captchaImage) {
      throw new Error('Captcha response was incomplete.');
    }

    return {
      captchaId: detail.captchaId,
      secureRuntimeToken: detail.secureRuntimeToken,
      captchaImage
    };
  }
}
